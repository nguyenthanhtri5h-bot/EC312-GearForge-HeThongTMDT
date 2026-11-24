import { KHA_SCREENS, KHA_STATS, KHA_STEPS } from '../data/sectionsData';
import { VIBE_BEAR_GUIDE } from '../data/vibeAssets';
import { useGearForgeStore } from '../hooks/useGearForgeStore';
import { ArrowIcon } from './ArrowIcon';

function StepIcon({ index }: { index: number }) {
  if (index === 0) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="5" width="16" height="11" rx="2" />
        <path d="M2 19h20" />
      </svg>
    );
  }
  if (index === 1) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="3" width="14" height="18" rx="2.5" />
        <path d="M9 8h6M9 12h6M9 16h3" />
      </svg>
    );
  }
  if (index === 2) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7h13v9H3zM16 10h4l2 3v3h-6z" />
      <circle cx="7.5" cy="18" r="1.8" />
      <circle cx="18.5" cy="18" r="1.8" />
    </svg>
  );
}

export function KhaAiSection() {
  const { openDrawer } = useGearForgeStore();

  return (
    <section
      id="gf-installment"
      className="tc-pin kha"
      data-pin=""
      style={{ '--len': 280 } as React.CSSProperties}
      aria-labelledby="kha-h"
    >
      <div className="tc-pin-in">
        <span className="kha-sang" aria-hidden="true" />
        <div className="tc-wrap kha-grid">
          <div className="kha-chu">
            <p className="kha-badge">
              <img src={VIBE_BEAR_GUIDE.aiBadge} loading="lazy" alt="GearForge Fintech" />
              TRẢ GÓP 0% SINH VIÊN ĐHQG-HCM
            </p>
            <h2 id="kha-h" className="kha-h">
              Trả góp 0% cho sinh viên <span className="kha-grad">duyệt nhanh qua email .edu.vn</span>
            </h2>
            <p className="kha-mo">
              Không cần giữ giấy tờ gốc. Xác thực thông tin sinh viên trực tuyến an toàn, theo dõi tiến độ giao hàng và nhận máy tận KTX trong 2 giờ.
            </p>
            <ol className="kha-buoc" data-kha-buoc="">
              {KHA_STEPS.map((step, i) => (
                <li key={step} className={i === 0 ? 'on' : ''}>
                  {step}
                </li>
              ))}
            </ol>
            <button
              type="button"
              className="kha-nut"
              style={{ border: 0, cursor: 'pointer' }}
              onClick={() => openDrawer('installment')}
            >
              Trả góp 0% ngay <ArrowIcon />
            </button>
          </div>

          <div className="kha-san" data-mouse="">
            <img
              className="kha-hung"
              data-par="-10"
              src={VIBE_BEAR_GUIDE.laptopMascot}
              loading="lazy"
              alt="Cyber Bear GearForge hỗ trợ sinh viên đăng ký trả góp 0%"
            />
            <div className="kha-dt" data-par="8">
              <div className="kha-man" data-kha-man="">
                {KHA_SCREENS.map((s, idx) => (
                  <img
                    key={s.img}
                    src={s.img}
                    loading="lazy"
                    alt={s.alt}
                    style={{ '--i': idx } as React.CSSProperties}
                  />
                ))}
              </div>
            </div>
            <div className="kha-chips" data-par="18" aria-hidden="true">
              {KHA_SCREENS.map((s, idx) => (
                <span key={s.chipTitle} className={`kha-chip ${idx === 0 ? 'on' : ''}`}>
                  <span className="ic">
                    <StepIcon index={idx} />
                  </span>
                  <span>
                    <b>{s.chipTitle}</b>
                    {s.chipDesc}
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="kha-so">
          <div className="tc-wrap kha-so-in">
            {KHA_STATS.map((st) => (
              <div key={st.label} className={`it ${st.highlight ? 'it-1' : ''}`}>
                <b>{st.value}</b>
                <span>{st.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
