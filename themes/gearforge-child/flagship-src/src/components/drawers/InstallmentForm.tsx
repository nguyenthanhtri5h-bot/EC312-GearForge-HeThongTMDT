import { useState, type FormEvent } from 'react';
import { useGearForgeStore } from '../../hooks/useGearForgeStore';
import type { GearForgeProduct } from '../../types/gearforge';

interface Props {
  product: GearForgeProduct;
  downPct: number;
  months: number;
}

interface SubmitReceipt {
  ok: boolean;
  message: string;
  orderId?: number;
  trackingUrl?: string;
}

export function InstallmentForm({ product, downPct, months }: Props) {
  const { boot, showToast } = useGearForgeStore();
  const [studentCode, setStudentCode] = useState('');
  const [eduEmail, setEduEmail] = useState('');
  const [cccdNumber, setCccdNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [cccdFile, setCccdFile] = useState<File | null>(null);
  const [svCardFile, setSvCardFile] = useState<File | null>(null);
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<SubmitReceipt | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!consent || submitting) return;

    if (!boot.ajaxUrl) {
      setReceipt({
        ok: true,
        orderId: 543,
        trackingUrl: boot.routes.tracking,
        message: `Đã tiếp nhận hồ sơ trả góp cho ${studentCode || 'sinh viên ĐHQG-HCM'} (${product.name}, ${months} tháng).`,
      });
      showToast('Đã nộp hồ sơ trả góp 0% thành công!');
      return;
    }

    setSubmitting(true);
    setReceipt(null);
    try {
      const fd = new FormData();
      fd.set('action', 'gf_submit_installment_app');
      fd.set('nonce', boot.ajaxNonce);
      fd.set('product_id', String(product.id));
      fd.set('down_pct', String(downPct));
      fd.set('downpayment_pct', String(downPct));
      fd.set('months', String(months));
      fd.set('student_code', studentCode.trim());
      fd.set('student_edu_email', eduEmail.trim());
      fd.set('cccd_number', cccdNumber.trim());
      fd.set('phone', phone.trim());
      fd.set('consent_nd13_accepted', '1');
      if (cccdFile) fd.set('cccd_file', cccdFile);
      if (svCardFile) fd.set('student_card_file', svCardFile);

      const res = await fetch(boot.ajaxUrl, {
        method: 'POST',
        credentials: 'same-origin',
        body: fd,
      });
      const json = await res.json();
      if (res.ok && json?.success && json.data) {
        setReceipt({
          ok: true,
          message: json.data.message || 'Hồ sơ của bạn đã được tiếp nhận và bảo mật an toàn.',
          orderId: Number(json.data.order_id || 0) || undefined,
          trackingUrl: json.data.tracking_url || boot.routes.tracking,
        });
        showToast('Nộp hồ sơ trả góp thành công!');
        setConsent(false);
      } else {
        setReceipt({
          ok: false,
          message: json?.data?.message || 'Không thể nộp hồ sơ. Vui lòng kiểm tra đăng nhập và định dạng ảnh.',
        });
      }
    } catch {
      setReceipt({ ok: false, message: 'Lỗi kết nối máy chủ khi gửi hồ sơ trả góp.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="gf-field-col" style={{ gap: 12 }} onSubmit={(e) => void handleSubmit(e)}>
      {!boot.user.loggedIn && (
        <div className="gf-alert-box is-warn">
          Vui lòng{' '}
          <a href={boot.routes.myAccount} style={{ color: '#2563eb', fontWeight: 800, textDecoration: 'underline' }}>
            đăng nhập tài khoản sinh viên
          </a>{' '}
          để hoàn tất gửi hồ sơ CCCD &amp; Thẻ sinh viên.
        </div>
      )}

      <div className="gf-form-grid-2">
        <div className="gf-field-col">
          <label htmlFor="gf-ekyc-mssv" className="gf-field-label">Mã số sinh viên *</label>
          <input
            id="gf-ekyc-mssv"
            type="text"
            className="gf-dark-input"
            placeholder="VD: 2452xxxx"
            value={studentCode}
            onChange={(e) => setStudentCode(e.target.value)}
            required
          />
        </div>
        <div className="gf-field-col">
          <label htmlFor="gf-ekyc-edu" className="gf-field-label">Email sinh viên (.edu.vn) *</label>
          <input
            id="gf-ekyc-edu"
            type="email"
            className="gf-dark-input"
            placeholder="mssv@gm.uit.edu.vn"
            value={eduEmail}
            onChange={(e) => setEduEmail(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="gf-form-grid-2">
        <div className="gf-field-col">
          <label htmlFor="gf-ekyc-cccd" className="gf-field-label">Số CCCD (12 chữ số) *</label>
          <input
            id="gf-ekyc-cccd"
            type="text"
            inputMode="numeric"
            pattern="\d{12}"
            maxLength={12}
            className="gf-dark-input"
            placeholder="07920xxxxxxx"
            value={cccdNumber}
            onChange={(e) => setCccdNumber(e.target.value)}
            required
          />
        </div>
        <div className="gf-field-col">
          <label htmlFor="gf-ekyc-phone" className="gf-field-label">Số điện thoại liên hệ *</label>
          <input
            id="gf-ekyc-phone"
            type="tel"
            className="gf-dark-input"
            placeholder="09xxxxxxxx"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="gf-form-grid-2">
        <div className="gf-field-col">
          <label htmlFor="gf-ekyc-cccd-file" className="gf-field-label">Ảnh CCCD (JPG/PNG/PDF) *</label>
          <input
            id="gf-ekyc-cccd-file"
            name="cccd_file"
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            className="gf-dark-input"
            onChange={(e) => setCccdFile(e.target.files?.[0] || null)}
            required
          />
        </div>
        <div className="gf-field-col">
          <label htmlFor="gf-ekyc-sv-file" className="gf-field-label">Ảnh Thẻ Sinh viên (JPG/PNG/PDF) *</label>
          <input
            id="gf-ekyc-sv-file"
            name="student_card_file"
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            className="gf-dark-input"
            onChange={(e) => setSvCardFile(e.target.files?.[0] || null)}
            required
          />
        </div>
      </div>

      <label className="gf-nd13-box" htmlFor="gf-consent-nd13">
        <input
          id="gf-consent-nd13"
          name="consent_nd13_accepted"
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
        />
        <span>
          <strong>Cam kết bảo vệ dữ liệu cá nhân (Nghị định 13/2023/NĐ-CP):</strong> Tôi đồng ý cho GearForge mã hóa và xử lý ảnh CCCD, Thẻ sinh viên cùng Email <code>.edu.vn</code> nhằm mục đích duy nhất là thẩm định hồ sơ trả góp sinh viên.
        </span>
      </label>

      {receipt && (
        <div className={`gf-alert-box ${receipt.ok ? 'is-ok' : 'is-err'}`} role="status" aria-live="polite">
          <span>{receipt.message}</span>
          {receipt.ok && receipt.orderId && (
            <div style={{ marginTop: 6 }}>
              <a href={receipt.trackingUrl} style={{ color: '#047857', fontWeight: 800, textDecoration: 'underline' }}>
                Theo dõi đơn hàng #{receipt.orderId} →
              </a>
            </div>
          )}
        </div>
      )}

      <button
        type="submit"
        id="gf-submit-installment-btn"
        className="gf-submit-btn"
        disabled={!consent || submitting}
      >
        {submitting ? 'Đang gửi hồ sơ...' : 'Nộp hồ sơ Trả góp 0% Sinh viên'}
      </button>
    </form>
  );
}
