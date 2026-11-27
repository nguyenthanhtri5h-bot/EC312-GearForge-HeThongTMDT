import { useRef, useState, type FormEvent } from 'react';
import { submitTwoStepInstallment, type InstallmentSubmitOutcome } from '../../hooks/installmentSubmitApi';
import { useGearForgeStore } from '../../hooks/useGearForgeStore';
import type { GearForgeProduct } from '../../types/gearforge';

interface Props {
  product: GearForgeProduct;
  downPct: number;
  months: number;
}

export function InstallmentForm({ product, downPct, months }: Props) {
  const { boot, showToast, openDrawer } = useGearForgeStore();
  const [studentCode, setStudentCode] = useState('');
  const [eduEmail, setEduEmail] = useState('');
  const [cccdNumber, setCccdNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [cccdFile, setCccdFile] = useState<File | null>(null);
  const [svCardFile, setSvCardFile] = useState<File | null>(null);
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<InstallmentSubmitOutcome | null>(null);
  const draftOrderRef = useRef<Record<number, number>>({});

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!consent || submitting) return;

    if (!boot.user.loggedIn) {
      setReceipt({
        ok: false,
        message: 'Vui lòng đăng nhập tài khoản sinh viên trước khi nộp hồ sơ trả góp.',
      });
      return;
    }
    if (!cccdFile || !svCardFile) {
      setReceipt({
        ok: false,
        message: 'Vui lòng đính kèm đủ cả ảnh CCCD và ảnh Thẻ Sinh viên.',
      });
      return;
    }

    setSubmitting(true);
    setReceipt(null);
    try {
      const outcome = await submitTwoStepInstallment({
        boot,
        productId: product.id,
        downPct,
        months,
        studentCode,
        eduEmail,
        cccdNumber,
        phone,
        cccdFile,
        svCardFile,
        draftOrderMap: draftOrderRef.current,
      });
      setReceipt(outcome);
      if (outcome.ok && outcome.orderId) {
        showToast(`Đã tiếp nhận hồ sơ #${outcome.appId} (Đơn #${outcome.orderId})!`);
        setConsent(false);
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
          <a href={boot.routes.myAccount} style={{ color: '#D13639', fontWeight: 800, textDecoration: 'underline' }}>
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
          <div className="gf-tool-file-row">
            <input
              id="gf-ekyc-cccd-file"
              name="cccd_file"
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              className="gf-tool-file-native"
              onChange={(e) => setCccdFile(e.target.files?.[0] || null)}
              required
            />
            <label htmlFor="gf-ekyc-cccd-file" className="gf-tool-file-btn">Chọn ảnh CCCD</label>
            <span className="gf-tool-file-name">{cccdFile ? cccdFile.name : 'Chưa chọn tệp'}</span>
          </div>
        </div>
        <div className="gf-field-col">
          <label htmlFor="gf-ekyc-sv-file" className="gf-field-label">Ảnh Thẻ Sinh viên (JPG/PNG/PDF) *</label>
          <div className="gf-tool-file-row">
            <input
              id="gf-ekyc-sv-file"
              name="student_card_file"
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              className="gf-tool-file-native"
              onChange={(e) => setSvCardFile(e.target.files?.[0] || null)}
              required
            />
            <label htmlFor="gf-ekyc-sv-file" className="gf-tool-file-btn">Chọn ảnh Thẻ SV</label>
            <span className="gf-tool-file-name">{svCardFile ? svCardFile.name : 'Chưa chọn tệp'}</span>
          </div>
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
            <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              <button
                type="button"
                onClick={() => openDrawer('oms')}
                style={{ background: 'none', border: 0, padding: 0, color: '#047857', fontWeight: 800, textDecoration: 'underline', cursor: 'pointer' }}
              >
                Mở tra cứu OMS #{receipt.orderId} →
              </button>
              <a href={receipt.trackingUrl} style={{ color: '#047857', fontWeight: 700, textDecoration: 'underline' }}>
                Trang theo dõi chi tiết
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
