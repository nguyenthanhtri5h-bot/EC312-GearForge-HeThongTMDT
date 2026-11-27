import { useEffect, useState } from 'react';
import { ECO_HOVER_STEPS, QUICK_MAJORS } from '../data/ecosystemData';
import { VIBE_VIDEOS } from '../data/vibeMedia';
import { useGearForgeStore } from '../hooks/useGearForgeStore';
import { ContactSection } from './ContactSection';
import { OmsPipelineSimulator } from './ecosystem/OmsPipelineSimulator';
import { StudentBuildEstimator } from './ecosystem/StudentBuildEstimator';
import './ecosystem/ecosystem.css';
import { SubpageHoverBand } from './subpages/SubpageHoverBand';
import { SubpageMediaBand } from './subpages/SubpageMediaBand';

const AUTO_ADVANCE_MS = 7000;

export function EcosystemPageView() {
  const { navigateToPage } = useGearForgeStore();
  const [activeIdx, setActiveIdx] = useState(0);
  const [autoAdvance, setAutoAdvance] = useState(true);

  const activeMajor = QUICK_MAJORS[activeIdx] || QUICK_MAJORS[0];

  useEffect(() => {
    if (!autoAdvance) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setTimeout(() => {
      setActiveIdx((prev) => (prev + 1) % QUICK_MAJORS.length);
    }, AUTO_ADVANCE_MS);
    return () => window.clearTimeout(timer);
  }, [activeIdx, autoAdvance]);

  const handleSelectTab = (idx: number) => {
    setActiveIdx(idx);
    setAutoAdvance(false);
  };

  return (
    <main className="tc" id="tc-ecosystem" style={{ background: '#F1F0EC' }}>
      <section className="gf-eco-hero is-who-hero" aria-label="Hệ sinh thái chọn máy theo ngành học">
        <img
          key={activeMajor.id}
          src={activeMajor.heroImg}
          alt={`Cấu hình chuẩn ngành ${activeMajor.label}`}
          className="gf-eco-hero-media is-switching"
        />
        <div className="gf-eco-hero-scrim" aria-hidden="true" />

        <div className="tc-wrap gf-eco-hero-center">
          <span className="gf-eco-hero-kicker">
            TIÊU CHUẨN ĐHQG-HCM · <span style={{ whiteSpace: 'nowrap' }}>{activeMajor.label.toUpperCase()}</span>
          </span>
          <h1>{activeMajor.heroHeadline}</h1>
          <p className="gf-eco-hero-lead">{activeMajor.heroLead}</p>
          <button
            type="button"
            className="gf-eco-center-pill"
            onClick={() => navigateToPage('shop', { search: activeMajor.query, page: 1 })}
          >
            / Xem máy ngành {activeMajor.label}
          </button>
        </div>

        <nav className="gf-who-tabs" aria-label="Nhóm ngành học ĐHQG">
          <div className="tc-wrap">
            <div className="gf-who-tabs-grid" role="tablist">
              {QUICK_MAJORS.map((m, idx) => {
                const active = idx === activeIdx;
                return (
                  <button
                    key={m.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    className={`gf-who-tab ${active ? 'is-active' : ''}`}
                    onClick={() => handleSelectTab(idx)}
                  >
                    <span className="gf-who-tab-label">
                      <span className="gf-who-tab-num">{m.num}.</span>
                      <span>{m.label}</span>
                    </span>
                    <span className="gf-who-tab-track" aria-hidden="true">
                      {active && (
                        <span
                          key={`${m.id}-${autoAdvance ? 'auto' : 'locked'}`}
                          className={`gf-who-tab-fill ${autoAdvance ? 'is-running' : 'is-locked'}`}
                          style={{ animationDuration: `${AUTO_ADVANCE_MS}ms` }}
                        />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </nav>
      </section>

      <section className="gf-eco-pillars-dark" aria-live="polite">
        <div className="tc-wrap">
          <div className="gf-eco-pillars-grid">
            {activeMajor.pillars.map((p) => (
              <article key={p.title} className="gf-eco-pillar-col">
                <h2>{p.title}</h2>
                <p>{p.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <div className="tc-wrap">
        <StudentBuildEstimator />
      </div>

      <SubpageHoverBand
        kicker="QUY TRÌNH LAB-TO-DORM 4 CHẶNG"
        heading="Lộ Trình Chuẩn Bị Máy"
        items={ECO_HOVER_STEPS}
      />

      <div className="tc-wrap">
        <OmsPipelineSimulator />
      </div>

      <SubpageMediaBand
        kicker="KIỂM ĐỊNH PHÒNG LAB ĐHQG"
        heading="Stress-Test GPU & Nhiệt Độ Trước Xuất Kho"
        desc="Mọi máy AI/Đồ họa đều chạy benchmark liên tục 30 phút bằng FurMark & Cinebench trong phòng Lab trước khi kỹ thuật viên đi giao tận KTX."
        videoSrc={VIBE_VIDEOS.labPc}
        posterSrc={VIBE_VIDEOS.posterLab}
        facts={[
          { label: 'Thời gian test tải nặng', value: '30 phút GPU + CPU đồng thời' },
          { label: 'Ngưỡng nhiệt độ xuất kho', value: 'Dưới 82°C buồng hơi ổn định' },
          { label: 'Cam kết lỗi đầu tiên', value: 'Đổi máy mới trong 15 ngày' },
        ]}
        ctaLabel="Lọc máy cấu hình cao tại Kho"
        onCta={() => navigateToPage('shop')}
      />

      <ContactSection />
    </main>
  );
}
