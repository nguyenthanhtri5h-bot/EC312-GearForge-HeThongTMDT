import { useState } from 'react';
import { useGearForgeStore } from '../hooks/useGearForgeStore';
import { OmsLookupPanel } from './OmsLookupPanel';
import '../styles/contact-section.css';

type TabKey = 'support' | 'installment' | 'build';

export function ContactSection() {
  const { boot, setChatOpen, openDrawer, navigateToPage } = useGearForgeStore();
  const [tab, setTab] = useState<TabKey>('support');
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [details, setDetails] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);
    if (!name.trim() || !contact.trim()) {
      setStatusMsg({ ok: false, text: 'Vui lòng điền họ tên và email / SĐT.' });
      return;
    }
    setSending(true);
    try {
      const url = tab === 'installment'
        ? `${boot.restUrl}/installment/apply`
        : `${boot.restUrl}/support-request`;
      const payload = tab === 'installment'
        ? { product_id: boot.products[0]?.id || 0, full_name: name, contact_info: contact, notes: details }
        : { request_type: tab, full_name: name, contact_info: contact, message: details };
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(boot.restNonce ? { 'X-WP-Nonce': boot.restNonce } : {}),
        },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (res.ok && json) {
        setStatusMsg({ ok: true, text: json.message || 'Đã tiếp nhận yêu cầu! Bộ phận ĐHQG-HCM sẽ liên hệ lại sớm.' });
        setDetails('');
      } else {
        setStatusMsg({ ok: false, text: json?.message || 'Gửi thất bại, vui lòng thử lại hoặc gọi 1900 6868 07.' });
      }
    } catch {
      setStatusMsg({ ok: false, text: 'Không kết nối được máy chủ. Vui lòng thử lại.' });
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="gf-oms-contact" className="contact-box-footer" aria-labelledby="gf-contact-heading">
      <div className="tc-wrap">
        <div className="contact-box-wrap">
          <div className="contact-box-ctn">
            <div className="contact-box-content">
              <p className="contact-kicker">TRUNG TÂM HỖ TRỢ SINH VIÊN ĐHQG-HCM</p>
              <h2 id="gf-contact-heading" className="contact-title">
                Tra Cứu Đơn Hàng, Trả Góp 0% &amp; Kích Hoạt Bảo Hành
              </h2>
              <p className="contact-sub">
                Kiểm tra tiến độ giao hàng theo mã đơn, tải hóa đơn điện tử VAT, mở hồ sơ trả góp .edu.vn hoặc gửi yêu cầu bảo hành theo số Serial máy.
              </p>

              <div className="contact-facts">
                <div className="contact-fact-row">
                  <span>Giờ trực KTX Khu A &amp; B</span>
                  <strong>08:00 – 22:00 (T2 – CN)</strong>
                </div>
                <div className="contact-fact-row">
                  <span>Thời gian giao nội khu</span>
                  <strong>Trong 2 giờ · Miễn phí cài app</strong>
                </div>
                <div className="contact-fact-row">
                  <span>Hotline &amp; Email kỹ thuật</span>
                  <strong>1900 6868 07 · support@gearforge.vn</strong>
                </div>
              </div>

              <div className="contact-link-stack">
                <a
                  href="/tra-cuu-don-hang/"
                  className="contact-link-btn"
                  onClick={(e) => {
                    e.preventDefault();
                    navigateToPage('tracking');
                  }}
                >
                  Mở trang tra cứu đơn hàng đầy đủ &rarr;
                </a>
                <button type="button" className="contact-link-btn" onClick={() => setChatOpen(true)}>
                  Mở Trợ lý AI GearForge tư vấn cấu hình &rarr;
                </button>
              </div>
            </div>

            <div className="contact-box-form" id="id-form-contact">
              <div className="wrap">
                <div className="form-tab" role="tablist" aria-label="Chức năng hỗ trợ">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={tab === 'support'}
                    className={`tab-btn ${tab === 'support' ? 'active' : ''}`}
                    onClick={() => setTab('support')}
                  >
                    Tra cứu &amp; Bảo hành
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={tab === 'installment'}
                    className={`tab-btn ${tab === 'installment' ? 'active' : ''}`}
                    onClick={() => setTab('installment')}
                  >
                    Trả góp 0%
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={tab === 'build'}
                    className={`tab-btn ${tab === 'build' ? 'active' : ''}`}
                    onClick={() => setTab('build')}
                  >
                    Build PC &amp; Ưu đãi
                  </button>
                </div>

                {tab === 'support' ? (
                  <OmsLookupPanel initialOrderId={542} compact />
                ) : (
                  <form className="gf-flat-form" onSubmit={(e) => void handleSubmit(e)}>
                    <div className="gf-flat-grid-2">
                      <label className="gf-flat-field">
                        <span className="gf-flat-label">Họ và tên sinh viên</span>
                        <input
                          type="text"
                          className="gf-flat-input"
                          placeholder="Ví dụ: Nguyễn Minh Khoa"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                        />
                      </label>
                      <label className="gf-flat-field">
                        <span className="gf-flat-label">Email .edu.vn hoặc SĐT</span>
                        <input
                          type="text"
                          className="gf-flat-input"
                          placeholder="mssv@gm.uit.edu.vn / 09xx"
                          value={contact}
                          onChange={(e) => setContact(e.target.value)}
                          required
                        />
                      </label>
                    </div>
                    <label className="gf-flat-field">
                      <span className="gf-flat-label">
                        {tab === 'installment' ? 'Mẫu máy muốn trả góp 0% (3 tháng)' : 'Ngân sách & nhu cầu Build PC / Nâng cấp'}
                      </span>
                      <textarea
                        className="gf-flat-input gf-flat-textarea"
                        placeholder={tab === 'installment' ? 'Ghi rõ tên máy, trả trước (20%–50%) và tòa KTX...' : 'Ví dụ: PC AI RTX 4060 ngân sách 25tr...'}
                        value={details}
                        onChange={(e) => setDetails(e.target.value)}
                      />
                    </label>
                    {statusMsg && (
                      <div className={`gf-flat-msg ${statusMsg.ok ? 'is-ok' : 'is-err'}`}>
                        {statusMsg.text}
                      </div>
                    )}
                    <button type="submit" className="gf-flat-submit" disabled={sending}>
                      {sending ? 'Đang gửi...' : tab === 'installment' ? 'Gửi yêu cầu mở hồ sơ trả góp 0%' : 'Nhận cấu hình & ưu đãi SV'}
                    </button>
                    {tab === 'installment' && (
                      <button
                        type="button"
                        className="contact-link-btn"
                        onClick={() => openDrawer('installment', boot.products[0]?.id)}
                      >
                        Hoặc mở trình ước tính Trả góp 0% chi tiết &rarr;
                      </button>
                    )}
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
