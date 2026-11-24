import { useState } from 'react';
import { VIBE_PORTFOLIO_CARDS, VIBE_VIDEOS } from '../data/vibeAssets';
import { useHoloTilt } from '../hooks/useHoloTilt';
import { useGearForgeStore } from '../hooks/useGearForgeStore';
import './ecosystem/ecosystem.css';

interface SetupShowcase {
  id: string;
  tag: string;
  campus: string;
  title: string;
  specs: string;
  img: string;
  cat: string;
  quote: string;
}

const hw = VIBE_PORTFOLIO_CARDS.hardware;
const SETUPS: SetupShowcase[] = [
  { id: 'ai-uit', tag: 'AI & Deep Learning', campus: 'UIT · Khoa KHMT', title: 'ROG Strix G16 AI Lab Rig', specs: 'Core i7-13650HX · RTX 4060 · 32GB', img: hw.campusUitAi, cat: 'laptop-gaming', quote: 'Chạy PyTorch & model vision mượt, trả góp 0% qua thẻ SV.' },
  { id: 'watercool-bk', tag: 'Custom PC RTX', campus: 'Bách Khoa · Cơ Điện Tử', title: 'Workstation CAD & Robotics', specs: 'i7-14700K · RTX 4070 Ti · 64GB', img: hw.campusBkCad, cat: 'pc-workstation', quote: 'Kiểm tra SolidWorks ổn định 24h trước khi giao KTX.' },
  { id: 'creator-media', tag: 'Creator OLED', campus: 'Media Club UIT', title: 'OLED 240Hz Studio Rig', specs: '27" QHD OLED · DCI-P3 99% · M4', img: hw.monitorOled, cat: 'gear', quote: 'Dựng video 4K chuẩn màu điện ảnh, bảo hành theo số Serial.' },
  { id: 'ktx-desk', tag: 'KTX Compact', campus: 'KTX Khu B ĐHQG', title: 'Mini-ITX Dorm PC Setup', specs: 'Ryzen 5 5600G · Mesh ITX · 2TB', img: hw.pcMiniItx, cat: 'pc-workstation', quote: 'Gọn bàn học ký túc xá, giao trong 2 giờ.' },
  { id: 'rog-dev', tag: 'KTPM & Dev', campus: 'UIT · Kỹ Thuật Phần Mềm', title: 'Gaming Laptop ROG RGB Dev', specs: 'Core Ultra 9 · RTX 4070 · 32GB', img: hw.laptopRogRgb, cat: 'laptop-gaming', quote: 'Docker + IDE + Android Studio mở song song không giật.' },
  { id: 'gear-pro', tag: 'Gaming Gear', campus: 'CLB Esports Làng ĐH', title: 'Combo Phím Cơ & Audio Hub', specs: 'Custom Gasket RGB · Headset 2.4G', img: hw.galleryEsportsDesk, cat: 'gear', quote: 'Combo phím chuột tai nghe êm chuẩn phòng KTX & đấu giải.' },
];

const KPIS = [
  { v: '100%', l: 'Hàng chính hãng VAT' },
  { v: '0%', l: 'Lãi suất SV 3 tháng' },
  { v: '1:1', l: 'Định danh Serial S/N' },
  { v: '2 Giờ', l: 'Giao KTX Khu A & B' },
  { v: '36T', l: 'Bảo hành điện tử' },
  { v: '6', l: 'Trường thành viên ĐHQG' },
];

export function SetupGalleryPageView() {
  const { navigateToPage } = useGearForgeStore();
  const { handleMouseMove, handleMouseLeave, tiltStyle } = useHoloTilt(4.5);
  const [filterTag, setFilterTag] = useState('Tất cả');
  const [query, setQuery] = useState('');

  const tags = ['Tất cả', 'AI & Deep Learning', 'Custom PC RTX', 'Creator OLED', 'KTX Compact', 'KTPM & Dev', 'Gaming Gear'];
  const visible = SETUPS.filter((s) => {
    const matchTag = filterTag === 'Tất cả' || s.tag === filterTag;
    const q = query.trim().toLowerCase();
    return matchTag && (!q || `${s.title} ${s.specs} ${s.campus}`.toLowerCase().includes(q));
  });

  return (
    <main className="tc" id="tc-gallery" style={{ paddingTop: 78, background: '#F1F0EC', color: '#0A0A0A' }}>
      <section className="gf-eco-hero" style={{ position: 'relative', overflow: 'hidden', paddingBottom: 32 }}>
        <video
          src={VIBE_VIDEOS.deskOrbit}
          poster={VIBE_VIDEOS.posterDeskOrbit}
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
            opacity: 0.16,
            pointerEvents: 'none',
          }}
        />
        <div className="tc-wrap" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ fontSize: 13, color: '#A1A1AA', marginBottom: 10 }}>
            <button type="button" onClick={() => navigateToPage('showcase')} style={{ background: 'none', border: 0, color: '#ffffff', fontWeight: 700, cursor: 'pointer', padding: 0 }}>
              &larr; Trang chủ
            </button> / Góc Máy Thực Tế Sinh Viên ĐHQG-HCM
          </div>
          <h1 className="tc-h1" style={{ color: '#fff', fontSize: 'clamp(28px, 3.5vw, 44px)' }}>
            Góc Máy Thực Tế Đã Bàn Giao Cho <span className="tc-dan">Sinh Viên ĐHQG</span>
          </h1>
          <div className="gf-kpi-strip">
            {KPIS.map((k) => (
              <div key={k.l} className="gf-kpi-tile" style={{ background: '#1F1F1F', borderColor: 'rgba(255,255,255,0.12)', color: '#D4D4D8' }}>
                <strong style={{ color: '#ffffff' }}>{k.v}</strong>
                <span style={{ fontSize: 12.5, color: '#A1A1AA' }}>{k.l}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="tc-sec" style={{ paddingBlock: 36, background: '#F1F0EC' }}>
        <div className="tc-wrap">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {tags.map((t) => (
                <button key={t} type="button" className={`gf-cat-pill ${filterTag === t ? 'is-active' : ''}`} onClick={() => setFilterTag(t)}>
                  {t}
                </button>
              ))}
            </div>
            <input
              type="search"
              className="gf-cat-input"
              style={{ width: 290, minHeight: 42, padding: '0 14px', borderRadius: 10, background: '#ffffff', color: '#0A0A0A', border: '1px solid #DFDEDC' }}
              placeholder="Tìm góc máy theo trường, RTX, M4..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          {visible.length === 0 ? (
            <div style={{ padding: 40, borderRadius: 14, background: '#1F1F1F', color: '#FFFFFF', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
              <p style={{ margin: '0 0 14px', fontSize: 15, color: '#D4D4D8' }}>
                Không tìm thấy góc máy phù hợp với từ khóa "{query}".
              </p>
              <button
                type="button"
                className="gf-riot-red-pill"
                style={{ height: 40, padding: '0 20px', fontSize: 13 }}
                onClick={() => { setFilterTag('Tất cả'); setQuery(''); }}
              >
                Đặt lại bộ lọc
              </button>
            </div>
          ) : (
            <div className="gf-cat-grid">
              {visible.map((s) => (
                <article
                  key={s.id}
                  className="gf-chrome-card gf-holo-card"
                  style={{ ...tiltStyle, background: '#1F1F1F', borderColor: 'rgba(255,255,255,0.1)', color: '#F4F4F5' }}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                >
                  <div style={{ position: 'relative' }}>
                    <img src={s.img} alt={s.title} style={{ width: '100%', aspectRatio: '16/10', objectFit: 'cover', display: 'block' }} />
                    <span style={{ position: 'absolute', top: 12, left: 12, fontSize: 11.5, fontWeight: 700, padding: '4px 9px', borderRadius: 6, background: 'rgba(10, 10, 12, 0.88)', color: '#FFFFFF' }}>
                      {s.tag}
                    </span>
                  </div>
                  <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#F87171', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.campus}</span>
                    <h2 style={{ margin: 0, fontFamily: "'Be Vietnam Pro', sans-serif", fontSize: 18, fontWeight: 800, color: '#FFFFFF' }}>{s.title}</h2>
                    <div style={{ fontSize: 13, color: '#D4D4D8', fontWeight: 600 }}>{s.specs}</div>
                    <p style={{ margin: 0, fontSize: 13.5, color: '#A1A1AA', lineHeight: 1.5 }}>&ldquo;{s.quote}&rdquo;</p>
                    <button
                      type="button"
                      className="gf-act-btn is-primary"
                      style={{ marginTop: 'auto' }}
                      onClick={() => navigateToPage('shop', { category: s.cat })}
                    >
                      Tìm cấu hình tương tự →
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
