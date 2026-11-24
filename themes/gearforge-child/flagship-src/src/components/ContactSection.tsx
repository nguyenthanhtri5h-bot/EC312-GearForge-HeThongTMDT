import { useState, type FormEvent } from 'react';
import { CONTACT_SERVICES } from '../data/footerData';
import { useGearForgeStore } from '../hooks/useGearForgeStore';
import { OmsLookupPanel } from './OmsLookupPanel';

type ContactTab = 'oms' | 'installment' | 'build';

export function ContactSection() {
  const { setChatOpen, openDrawer, applyCoupon, showToast } = useGearForgeStore();
  const [activeTab, setActiveTab] = useState<ContactTab>('oms');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [service, setService] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    setSubmitted(true);
    showToast(`Đã ghi nhận yêu cầu tư vấn cho ${name}!`);
    window.setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <section id="gf-oms-contact" className="contact-box-footer" aria-labelledby="gf-contact-title">
      <div className="contact-box-map">
        <div
          style={{
            height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', padding: '24px 20px 140px', textAlign: 'center', color: '#ffffff',
            background: 'radial-gradient(circle at 50% 40%, #1e293b 0%, #0f172a 75%)',
          }}
        >
          <span
            style={{
              padding: '4px 12px', borderRadius: 6, background: '#1e293b',
              border: '1px solid rgba(255, 255, 255, 0.18)', color: '#93c5fd', fontSize: 12, fontWeight: 700,
            }}
          >
            CAMPUS HUB · ĐHQG-HCM THỦ ĐỨC
          </span>
          <strong style={{ marginTop: 10, fontSize: 22, fontWeight: 800 }}>
            Khu phố 6, P. Linh Trung — Giao hỏa tốc 2h tới KTX Khu A &amp; Khu B
          </strong>
          <span style={{ marginTop: 6, fontSize: 14, color: '#cbd5e1' }}>
            UIT · Bách Khoa · KHTN · Hỗ trợ test máy trực tiếp &amp; nhận bảo hành S/N tại chỗ
          </span>
        </div>
      </div>

      <div className="container">
        <div className="contact-box-wrap">
          <div className="contact-box-ctn">
            <div className="contact-box-content">
              <div>
                <div className="contact-box-header">
                  <h2 id="gf-contact-title" className="title" style={{ margin: 0 }}>
                    Tra Cứu Đơn Hàng, Trả Góp 0% &amp; Kích Hoạt Bảo Hành
                  </h2>
                  <div className="desc">
                    Kiểm tra tiến độ giao hàng theo mã đơn, tải hóa đơn điện tử VAT, mở hồ sơ trả góp{' '}
                    <strong>.edu.vn</strong> hoặc gửi yêu cầu bảo hành theo Serial máy.
                  </div>
                </div>

                <div className="contact-box-react">
                  <button type="button" className="item" style={{ border: 0, cursor: 'pointer', textAlign: 'left' }} onClick={() => setActiveTab('oms')}>
                    <div className="label">Kiểm tra tiến độ</div>
                    <div className="name">Tra cứu đơn hàng</div>
                  </button>
                  <button type="button" className="item" style={{ border: 0, cursor: 'pointer', textAlign: 'left' }} onClick={() => openDrawer('installment')}>
                    <div className="label">Duyệt qua .edu.vn</div>
                    <div className="name">Mở Trả góp 0%</div>
                  </button>
                  <button type="button" className="item" style={{ border: 0, cursor: 'pointer', textAlign: 'left' }} onClick={() => setChatOpen(true)}>
                    <div className="label">Tư vấn cấu hình</div>
                    <div className="name">Chat Trợ lý AI</div>
                  </button>
                </div>

                <div className="contact-box-address">
                  <a className="item" href="/tra-cuu-don-hang/">
                    <span>Mở trang tra cứu đơn hàng đầy đủ →</span>
                  </a>
                  <a className="item" href="mailto:support@gearforge.vn">
                    <span>Email kỹ thuật: support@gearforge.vn · Hotline: 1900 6868 07</span>
                  </a>
                </div>
              </div>
            </div>

            <div id="id-form-contact" className="contact-box-form">
              <div className="wrap">
                <div className="form-tab" role="tablist" aria-label="Chức năng hỗ trợ GearForge">
                  {([
                    ['oms', 'Tra cứu & Bảo hành'],
                    ['installment', 'Trả góp 0%'],
                    ['build', 'Build PC & Ưu đãi'],
                  ] as const).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      role="tab"
                      aria-selected={activeTab === key}
                      className={`form-tab-item ${activeTab === key ? 'active' : ''}`}
                      onClick={() => setActiveTab(key)}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {activeTab === 'oms' && <OmsLookupPanel initialOrderId={542} />}

                {activeTab === 'installment' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#141018' }}>
                      Hồ sơ Trả góp 0% Sinh viên ĐHQG-HCM
                    </h3>
                    <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: '#47405c' }}>
                      Hỗ trợ kỳ hạn 3 tháng lãi suất 0% (trả trước từ 20%). Thông tin CCCD &amp; Thẻ sinh viên của bạn được bảo mật tuyệt đối theo quy định hiện hành.
                    </p>
                    <button type="button" className="cf-submit" onClick={() => openDrawer('installment')}>
                      Mở biểu mẫu Trả góp 0%
                    </button>
                    <button
                      type="button"
                      className="gf-act-btn"
                      style={{ background: '#f5f2fc', color: '#141018', borderColor: '#d8d0e8' }}
                      onClick={() => openDrawer('compare')}
                    >
                      Xem khay So sánh 3 thiết bị
                    </button>
                  </div>
                )}

                {activeTab === 'build' && (
                  <form onSubmit={handleSubmit}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '10px 12px', marginBottom: 12, borderRadius: 12, background: '#f4efff' }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#4b0a8c' }}>
                        Mã SV ĐHQG: <code>BACKTOSCHOOL</code> (-5%)
                      </span>
                      <button type="button" className="gf-hd-pill is-primary" onClick={() => void applyCoupon('BACKTOSCHOOL')}>
                        Áp dụng mã
                      </button>
                    </div>
                    <div className="cf-field">
                      <input type="text" className="cf-input" placeholder="Họ và tên sinh viên *" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div className="cf-field">
                      <input type="tel" className="cf-input" placeholder="Số điện thoại / Zalo *" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                    </div>
                    <div className="cf-field">
                      <select className="cf-select" value={service} onChange={(e) => setService(e.target.value)}>
                        <option value="">Chọn nhu cầu tư vấn cấu hình *</option>
                        {CONTACT_SERVICES.map((sv) => <option key={sv} value={sv}>{sv}</option>)}
                      </select>
                    </div>
                    <div className="cf-field">
                      <textarea
                        className="cf-textarea"
                        placeholder="Ngân sách, phần mềm sử dụng (PyTorch, SolidWorks, Premiere...)"
                        maxLength={200}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                      />
                      <p className="cf-word">{message.length}/200</p>
                    </div>
                    <button type="submit" className="cf-submit">
                      Gửi yêu cầu Build PC &amp; Nhận báo giá
                    </button>
                    {submitted && (
                      <div className="cf-success">
                        Đã ghi nhận yêu cầu của {name}! Kỹ sư GearForge sẽ phản hồi qua Zalo trong 10 phút.
                      </div>
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
