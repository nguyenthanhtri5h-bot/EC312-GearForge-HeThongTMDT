import { useState } from 'react';
import { VIBE_BEAR_GUIDE, VIBE_VIDEOS } from '../data/vibeAssets';
import { useGearForgeStore } from '../hooks/useGearForgeStore';
import { ContactSection } from './ContactSection';
import { OmsPipelineSimulator } from './ecosystem/OmsPipelineSimulator';
import { StudentBuildEstimator } from './ecosystem/StudentBuildEstimator';
import './ecosystem/ecosystem.css';

const INFRA_MODULES = [
  { id: 'catalog', title: 'Lọc Máy Theo Ngành Học', tag: 'CPU · RAM · GPU · SSD', desc: 'Chọn nhanh cấu hình phù hợp từng chuyên ngành CNTT, AI, Đồ họa hay Văn phòng trong vài giây.' },
  { id: 'installment', title: 'Trả Góp 0% .edu.vn', tag: 'Kỳ hạn 3–6–12 tháng', desc: 'Chỉ cần email sinh viên ĐHQG-HCM & thẻ SV, không phí hồ sơ kỳ hạn 3 tháng, không giữ giấy tờ gốc.' },
  { id: 'security', title: 'Bảo Mật Thông Tin Cá Nhân', tag: 'An toàn tuyệt đối', desc: 'Hình ảnh CCCD & Thẻ sinh viên được mã hóa bảo mật riêng tư, chỉ dùng để duyệt hồ sơ trả góp.' },
  { id: 'serial', title: 'Bảo Hành Theo Số Serial', tag: 'Tra cứu trực tuyến', desc: 'Mỗi thiết bị đều có mã định danh Serial chính hãng, hỗ trợ gửi bảo hành hoặc đổi trả nhanh chóng.' },
  { id: 'delivery', title: 'Hóa Đơn VAT & Giao KTX 2h', tag: 'Khu A / Khu B', desc: 'Xuất hóa đơn điện tử hợp lệ & kỹ thuật viên cài đặt sẵn phần mềm môn học tận phòng ký túc xá.' },
];

export function EcosystemPageView() {
  const { navigateToPage, openDrawer } = useGearForgeStore();
  const [activeMod, setActiveMod] = useState(0);
  const current = INFRA_MODULES[activeMod];

  return (
    <main className="tc" id="tc-ecosystem" style={{ paddingTop: 64, background: '#f8fafc', color: '#0f172a' }}>
      <section className="gf-eco-hero tc-navy" style={{ position: 'relative', overflow: 'hidden' }}>
        <video
          src={VIBE_VIDEOS.ecosystemFlow}
          poster={VIBE_VIDEOS.posterEcosystemFlow}
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: 0.22,
            pointerEvents: 'none',
          }}
        />
        <div className="tc-wrap gf-eco-grid" style={{ position: 'relative', zIndex: 2 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#a1a1aa', marginBottom: 12 }}>
              <button type="button" onClick={() => navigateToPage('showcase')} style={{ background: 'none', border: 0, color: '#ffffff', fontWeight: 700, cursor: 'pointer', padding: 0 }}>
                ← Trang chủ
              </button>
              <span>/</span>
              <span>Hệ Sinh Thái &amp; Công Cụ Chọn Máy</span>
            </div>
            <h1 className="tc-h1" style={{ color: '#fff', fontSize: 'clamp(28px, 3.6vw, 44px)' }}>
              Chọn Máy Theo <span style={{ borderBottom: '2px solid rgba(255,255,255,0.35)' }}>Ngành Học</span> &amp; Dự Toán Trả Góp 0%
            </h1>
            <p style={{ marginTop: 14, fontSize: 15.5, color: '#cbd5e1', maxWidth: 560, lineHeight: 1.65 }}>
              Công cụ giúp sinh viên ĐHQG-HCM chọn đúng cấu hình học tập, ước tính khoản góp hàng tháng và theo dõi quy trình giao hàng hỏa tốc trong 2 giờ.
            </p>
            <div className="gf-eco-pills">
              {INFRA_MODULES.map((m, idx) => (
                <button key={m.id} type="button" className={`gf-eco-pill ${idx === activeMod ? 'is-on' : ''}`} onClick={() => setActiveMod(idx)}>
                  {m.title}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 22 }}>
              <button type="button" className="tc-btn tc-btn-cam" style={{ border: 0, cursor: 'pointer' }} onClick={() => navigateToPage('shop')}>
                Khám phá Cửa hàng →
              </button>
              <button type="button" className="tc-btn tc-btn-vien" onClick={() => openDrawer('installment')}>
                Đăng ký Trả góp 0%
              </button>
            </div>
          </div>

          <div className="gf-live-card">
            <div>
              <span className="gf-live-badge"><i /> {current.tag}</span>
              <h2 style={{ margin: '12px 0 8px', fontFamily: "'Be Vietnam Pro', sans-serif", fontSize: 22, fontWeight: 800, color: '#fff' }}>
                {current.title}
              </h2>
              <p style={{ margin: 0, fontSize: 14, color: '#e2e8f0', lineHeight: 1.55 }}>{current.desc}</p>
            </div>
            <img
              src={VIBE_BEAR_GUIDE.ecosystemHub || VIBE_BEAR_GUIDE.vibeStack}
              alt="Hệ sinh thái Chọn Máy & Bảo Hành GearForge"
              style={{ width: 170, height: 170, objectFit: 'contain', filter: 'drop-shadow(0 14px 24px rgba(0,0,0,0.45))' }}
            />
          </div>
        </div>
      </section>

      <section className="tc-sec" style={{ paddingBlock: 48, background: '#f8fafc' }}>
        <div className="tc-wrap" style={{ display: 'grid', gap: 28 }}>
          <StudentBuildEstimator />
          <OmsPipelineSimulator />
        </div>
      </section>

      <ContactSection />
    </main>
  );
}
