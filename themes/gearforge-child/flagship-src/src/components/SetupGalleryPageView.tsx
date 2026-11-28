import { useState } from 'react';
import { GALLERY_MEDIA_DATA } from '../data/subpageBandsData';
import { VIBE_PORTFOLIO_CARDS } from '../data/vibeMedia';
import { useGearForgeStore } from '../hooks/useGearForgeStore';
import { CrestIcon } from './BrandLogo';
import { SubpageMediaBand } from './subpages/SubpageMediaBand';
import '../styles/gallery-page.css';

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
  { id: 'ai-uit', tag: 'AI & Deep Learning', campus: 'UIT · Khoa KHMT', title: 'Góc Lab AI & Lập Trình — ROG Strix G16', specs: 'Core i7-13650HX · RTX 4060 · 32GB', img: hw.campusUitAi, cat: 'laptop-gaming', quote: 'Chạy PyTorch và model vision mượt mà, duyệt trả góp 0% qua thẻ sinh viên.' },
  { id: 'watercool-bk', tag: 'Custom PC RTX', campus: 'Bách Khoa · Cơ Điện Tử', title: 'Workstation CAD & Cơ Điện Tử', specs: 'i7-14700K · RTX 4070 Ti · 64GB', img: hw.campusBkCad, cat: 'pc-workstation', quote: 'Kiểm định SolidWorks ổn định 24h trước khi kỹ thuật viên giao tới KTX.' },
  { id: 'ktx-desk', tag: 'KTX Compact', campus: 'KTX Khu B ĐHQG', title: 'Mini-ITX Gọn Bàn KTX Khu B', specs: 'Ryzen 5 5600G · Mesh ITX · 2TB', img: hw.pcMiniItx, cat: 'pc-workstation', quote: 'Tối ưu bàn học ký túc xá 1m², đi dây gọn gàng và giao nhanh trong 2 giờ.' },
  { id: 'esports-dual', tag: 'KTPM & Dev', campus: 'UIT · Kỹ Thuật Phần Mềm', title: 'Dual-Monitor Đồ Án & Esports PC', specs: 'Core i7-14700K · RTX 4070 Super · Tản Nước Custom', img: hw.galleryEsportsDesk, cat: 'pc-workstation', quote: 'Mở song song SolidWorks, IDE và giải trí Esports 240Hz mượt mà trên hệ thống 2 màn hình.' },
  { id: 'oled-studio', tag: 'Creator OLED', campus: 'Media Club UIT', title: 'Màn Hình OLED 240Hz Dựng Phim 4K', specs: '27" QHD OLED · DCI-P3 99% · M4', img: hw.monitorOled, cat: 'gear', quote: 'Chuẩn màu điện ảnh cho dựng phim 4K, bảo hành điện tử theo Serial.' },
  { id: 'gear-pro', tag: 'Gaming Gear', campus: 'CLB Esports Làng ĐH', title: 'Combo Phím Cơ Gasket & Chuột Pro', specs: 'Custom Gasket RGB · Headset 2.4G', img: hw.gearPeripherals, cat: 'gear', quote: 'Switch êm ái không ồn phòng KTX, chuột không dây siêu nhẹ chuẩn đấu giải.' },
  { id: 'concept-creator', tag: 'Creator OLED', campus: 'Concept 2026 · Creator Studio', title: 'Concept Studio 2D · Creator ĐHQG', specs: 'MacBook Pro M4 · Dual OLED · Dock TB4', img: hw.galCreatorOled, cat: 'laptop-ultrabook', quote: 'Không gian thiết kế 2D tối giản dành riêng cho sinh viên Đồ họa & Truyền thông.' },
];

const TAGS = ['Tất cả', 'AI & Deep Learning', 'Custom PC RTX', 'Creator OLED', 'KTX Compact', 'KTPM & Dev', 'Gaming Gear'];

export function SetupGalleryPageView() {
  const { navigateToPage } = useGearForgeStore();
  const [filterTag, setFilterTag] = useState('Tất cả');
  const [query, setQuery] = useState('');

  const visible = SETUPS.filter((s) => {
    const matchTag = filterTag === 'Tất cả' || s.tag === filterTag;
    const q = query.trim().toLowerCase();
    return matchTag && (!q || `${s.title} ${s.specs} ${s.campus}`.toLowerCase().includes(q));
  });

  const lead = visible[0];
  const rest = visible.slice(1);

  return (
    <main className="tc gf-news-page" id="tc-gallery">
      <section className="gf-news-hero">
        <svg className="gf-news-shards" viewBox="0 0 1440 360" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <path d="M320 62L575 154L748 128L918 54L994 0L940 74L1095 20L1005 112L1168 96L1035 162L1142 292L984 184L868 278L882 192L714 218L562 298L640 198L486 154Z" fill="#18181B" />
          <path d="M1230 14L1130 112L1265 92L1178 164L1385 118L1440 82L1440 162L1278 216L1372 320L1215 224L1128 336L1142 204L1068 154Z" fill="#1D1D21" />
          <path d="M902 0L978 86L1072 22L1012 118L1118 228L992 146L914 212L948 122L836 68Z" fill="#0B0B0D" />
        </svg>

        <div className="tc-wrap">
          <button type="button" className="gf-news-crumb" onClick={() => navigateToPage('showcase')}>
            &larr; Trang chủ / Góc máy sinh viên ĐHQG
          </button>
          <h1 className="gf-news-h1">Góc Máy Sinh Viên</h1>

          <div className="gf-news-bar">
            <nav className="gf-news-tabs" aria-label="Lọc góc máy theo nhu cầu">
              {TAGS.map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`gf-news-tab ${filterTag === t ? 'is-active' : ''}`}
                  onClick={() => setFilterTag(t)}
                >
                  {t}
                </button>
              ))}
            </nav>

            <input
              type="search"
              aria-label="Tìm góc máy theo trường, GPU hoặc cấu hình"
              className="gf-news-search"
              placeholder="Tìm trường, RTX, M4..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        <svg className="gf-news-tear" viewBox="0 0 1440 58" preserveAspectRatio="none" aria-hidden="true">
          <path
            d="M0 32C95 48 178 14 282 26C395 39 468 48 592 31C718 14 824 8 960 22C1098 36 1212 46 1335 28C1382 21 1416 14 1440 18L1440 58L0 58Z"
            fill="#F1F0EC"
          />
        </svg>
      </section>

      <div className="tc-wrap">
        {!lead ? (
          <div className="gf-news-empty">
            <p style={{ margin: '0 0 14px', fontSize: 15, color: '#52525B' }}>
              Không tìm thấy góc máy phù hợp với từ khóa &ldquo;{query}&rdquo;.
            </p>
            <button
              type="button"
              className="gf-news-cta"
              onClick={() => { setFilterTag('Tất cả'); setQuery(''); }}
            >
              Đặt lại bộ lọc &rarr;
            </button>
          </div>
        ) : (
          <>
            <article className="gf-news-featured">
              <div className="gf-news-lead-media">
                <img src={lead.img} alt={lead.title} />
              </div>

              <div className="gf-news-lead-copy">
                <span className="gf-news-meta">
                  <CrestIcon size={16} />
                  <span>{lead.campus} · {lead.tag}</span>
                </span>
                <h2 className="gf-news-lead-title">{lead.title}</h2>
                <p className="gf-news-lead-specs">{lead.specs}</p>
                <p className="gf-news-lead-quote">&ldquo;{lead.quote}&rdquo;</p>
                <button
                  type="button"
                  className="gf-news-cta"
                  onClick={() => navigateToPage('shop', { category: lead.cat })}
                >
                  Tìm cấu hình tương tự &rarr;
                </button>
              </div>
            </article>

            {rest.length > 0 && (
              <section className="gf-news-grid" aria-label="Danh sách góc máy bàn giao">
                {rest.map((s) => (
                  <article key={s.id} className="gf-news-card">
                    <div className="gf-news-card-media">
                      <img src={s.img} alt={s.title} />
                    </div>
                    <span className="gf-news-meta">
                      <CrestIcon size={14} />
                      <span>{s.campus} · {s.tag}</span>
                    </span>
                    <h3 className="gf-news-card-title">{s.title}</h3>
                    <p className="gf-news-card-specs">{s.specs} — {s.quote}</p>
                    <button
                      type="button"
                      className="gf-news-cta"
                      onClick={() => navigateToPage('shop', { category: s.cat })}
                    >
                      Tìm cấu hình tương tự &rarr;
                    </button>
                  </article>
                ))}
              </section>
            )}
          </>
        )}
      </div>

      <SubpageMediaBand
        kicker={GALLERY_MEDIA_DATA.kicker}
        heading={GALLERY_MEDIA_DATA.heading}
        desc={GALLERY_MEDIA_DATA.desc}
        videoSrc={GALLERY_MEDIA_DATA.videoSrc}
        posterSrc={GALLERY_MEDIA_DATA.posterSrc}
        verticalReel
        facts={GALLERY_MEDIA_DATA.facts}
        ctaLabel="Đặt lịch build & giao KTX"
        onCta={() => navigateToPage('ecosystem')}
      />
    </main>
  );
}
