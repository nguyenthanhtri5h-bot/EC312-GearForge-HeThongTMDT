import type { GearForgeBoot } from '../types/gearforge';

export interface InstallmentSubmitPayload {
  boot: GearForgeBoot;
  productId: number;
  downPct: number;
  months: number;
  studentCode: string;
  eduEmail: string;
  cccdNumber: string;
  phone: string;
  cccdFile: File;
  svCardFile: File;
  draftOrderMap: Record<number, number>;
}

export interface InstallmentSubmitOutcome {
  ok: boolean;
  message: string;
  orderId?: number;
  appId?: number;
  trackingUrl?: string;
}

/**
 * Two-step REST submission: creates or reuses a pending WooCommerce draft order
 * via /gf/v1/installment/start, then uploads encrypted identity documents to Role 4 /installment-apply.
 */
export async function submitTwoStepInstallment(input: InstallmentSubmitPayload): Promise<InstallmentSubmitOutcome> {
  const { boot, productId, downPct, months, studentCode, eduEmail, cccdNumber, phone, cccdFile, svCardFile, draftOrderMap } = input;
  let orderId = draftOrderMap[productId] || 0;

  if (orderId <= 0) {
    const startUrl = boot.restUrl.replace(/\/gearforge\/v1\/?$/, '/gf/v1/installment/start');
    const startRes = await fetch(startUrl, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        ...(boot.restNonce ? { 'X-WP-Nonce': boot.restNonce } : {}),
      },
      body: JSON.stringify({ product_id: productId, qty: 1 }),
    });
    const startJson = await startRes.json();
    if (!startRes.ok || !startJson?.order_id) {
      return { ok: false, message: startJson?.message || 'Không thể khởi tạo đơn hàng trả góp.' };
    }
    orderId = Number(startJson.order_id);
    draftOrderMap[productId] = orderId;
  }

  const fd = new FormData();
  fd.set('order_id', String(orderId));
  fd.set('down_pct', String(downPct));
  fd.set('months', String(months));
  fd.set('student_code', studentCode.trim());
  fd.set('student_edu_email', eduEmail.trim());
  fd.set('cccd_number', cccdNumber.trim());
  fd.set('phone', phone.trim());
  fd.set('consent_nd13_accepted', '1');
  fd.set('cccd_file', cccdFile);
  fd.set('student_card_file', svCardFile);

  const res = await fetch(`${boot.restUrl}/installment-apply`, {
    method: 'POST',
    credentials: 'same-origin',
    headers: boot.restNonce ? { 'X-WP-Nonce': boot.restNonce } : undefined,
    body: fd,
  });
  const json = await res.json();
  if (res.ok && json?.app_id) {
    delete draftOrderMap[productId];
    const resolvedOrderId = Number(json.order_id || orderId);
    return {
      ok: true,
      appId: Number(json.app_id),
      orderId: resolvedOrderId,
      trackingUrl: `${boot.routes.tracking}?order_id=${resolvedOrderId}`,
      message: `${json.message || 'Nộp hồ sơ trả góp thành công.'} (Hồ sơ #${json.app_id} · Đơn #${resolvedOrderId})`,
    };
  }

  return {
    ok: false,
    message: json?.message || 'Không thể nộp hồ sơ. Kiểm tra định dạng ảnh (JPG/PNG/PDF) và email .edu.vn.',
  };
}
