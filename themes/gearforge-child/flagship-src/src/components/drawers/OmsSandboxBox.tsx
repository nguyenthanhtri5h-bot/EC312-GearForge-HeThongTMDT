import { useState } from 'react';
import { formatVnd, useGearForgeStore } from '../../hooks/useGearForgeStore';
import type { OmsOrder } from '../../types/gearforge';

export function OmsSandboxBox({
  order,
  onOrderRefresh,
}: {
  order: OmsOrder;
  onOrderRefresh: (orderId: number) => Promise<void>;
}) {
  const { boot } = useGearForgeStore();
  const [provider, setProvider] = useState<'vnpay' | 'vnpay_portal' | 'momo' | 'fundiin'>('vnpay');
  const [busy, setBusy] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const isDownpayment = order.installment?.status === 'APPROVED_WAITING_DOWNPAYMENT';
  const canPayFull = !order.installment && order.status === 'PENDING_PAYMENT';
  if (!isDownpayment && !canPayFull) return null;

  const launchSandbox3DS = async () => {
    if (busy) return;
    setBusy(true);
    setStatusMsg(null);
    try {
      const res = await fetch(`${boot.restUrl}/payment-sandbox/session`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          ...(boot.restNonce ? { 'X-WP-Nonce': boot.restNonce } : {}),
        },
        body: JSON.stringify({
          order_id: order.orderId,
          provider,
          mode: isDownpayment ? 'downpayment' : 'full',
        }),
      });
      const json = await res.json();
      if (res.ok && json?.checkout_url) {
        setStatusMsg({
          ok: true,
          text: `Đã tạo phiên Sandbox 3DS (${String(json.provider || provider).toUpperCase()} · ${formatVnd(Number(json.amount || 0))}). Đang chuyển cổng...`,
        });
        window.open(String(json.checkout_url), '_blank', 'noopener,noreferrer');
      } else {
        setStatusMsg({
          ok: false,
          text: json?.message || 'Cần đăng nhập đúng tài khoản chủ đơn để tạo phiên thanh toán.',
        });
      }
    } catch {
      setStatusMsg({ ok: false, text: 'Lỗi kết nối cổng thanh toán Sandbox 3DS.' });
    } finally {
      setBusy(false);
    }
  };

  const checkQueryDr = async () => {
    if (busy) return;
    setBusy(true);
    setStatusMsg(null);
    try {
      const res = await fetch(`${boot.restUrl}/payment-sandbox/query/${order.orderId}`, {
        credentials: 'same-origin',
        headers: boot.restNonce ? { 'X-WP-Nonce': boot.restNonce } : undefined,
      });
      const json = await res.json();
      if (res.ok) {
        setStatusMsg({
          ok: true,
          text: `QueryDR: trạng thái WC "${json.order_status}"${json.transaction_ref ? ` · Mã GD ${json.transaction_ref}` : ' (chưa ghi nhận giao dịch)'}.`,
        });
        await onOrderRefresh(order.orderId);
      } else {
        setStatusMsg({ ok: false, text: json?.message || 'Không đối soát được giao dịch QueryDR.' });
      }
    } catch {
      setStatusMsg({ ok: false, text: 'Lỗi kết nối QueryDR.' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="gf-sandbox-card">
      <div className="gf-sandbox-head">
        <div>
          <span className="gf-sandbox-badge">Cổng thanh toán Sandbox</span>
          <strong className="gf-sandbox-title">
            {isDownpayment ? 'Thanh toán tiền trả trước qua Sandbox 3DS / VNPay' : 'Thanh toán đơn hàng qua Sandbox 3DS / VNPay'}
          </strong>
        </div>
        <div className="gf-sandbox-controls">
          <select
            aria-label="Chọn cổng thanh toán Sandbox"
            className="gf-oms-input"
            style={{ minHeight: 34, padding: '0 10px', fontSize: 12, width: 'auto' }}
            value={provider}
            onChange={(e) => setProvider(e.target.value as 'vnpay' | 'vnpay_portal' | 'momo' | 'fundiin')}
          >
            <option value="vnpay">VNPay 3DS (OTP 123456)</option>
            <option value="vnpay_portal">VNPay Sandbox Portal (sandbox.vnpayment.vn)</option>
            <option value="momo">MoMo Sandbox</option>
            <option value="fundiin">Fundiin BNPL</option>
          </select>
          <button
            type="button"
            className="gf-oms-btn"
            style={{ minHeight: 34, padding: '0 14px', fontSize: 12 }}
            disabled={busy}
            onClick={() => void launchSandbox3DS()}
          >
            {busy ? 'Đang mở...' : 'Thanh toán 3DS →'}
          </button>
          <button
            type="button"
            className="gf-oms-chip-btn"
            style={{ minHeight: 34 }}
            disabled={busy}
            onClick={() => void checkQueryDr()}
          >
            Đối soát QueryDR
          </button>
        </div>
      </div>
      {statusMsg && (
        <div style={{ fontSize: 12, fontWeight: 700, color: statusMsg.ok ? '#047857' : '#B91C1C' }}>
          {statusMsg.text}
        </div>
      )}
    </div>
  );
}
