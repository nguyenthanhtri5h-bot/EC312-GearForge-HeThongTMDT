import { useRef } from 'react';
import { VIBE_PORTFOLIO_CARDS, VIBE_VIDEOS } from '../../data/vibeMedia';
import { useGearForgeStore } from '../../hooks/useGearForgeStore';
import './riot-home.css';

interface EcosystemCard {
  id: string;
  title: string;
  sub?: string;
  img: string;
  action: () => void;
}

export function RiotEcosystemStrip() {
  const { navigateToPage, openDrawer, setVideoModalSrc } = useGearForgeStore();
  const railRef = useRef<HTMLDivElement>(null);
  const hw = VIBE_PORTFOLIO_CARDS.hardware;

  const cards: EcosystemCard[] = [
    {
      id: 'ai',
      title: 'AI BUILDER',
      img: hw.riotEcoAiBuilder,
      action: () => navigateToPage('ecosystem'),
    },
    {
      id: 'setup',
      title: 'ĐHQG SETUP',
      img: hw.pcMiniItx,
      action: () => navigateToPage('gallery'),
    },
    {
      id: 'lab',
      title: 'LAB STRESS',
      img: hw.riotEcoStressLab,
      action: () => setVideoModalSrc(VIBE_VIDEOS.labPc),
    },
    {
      id: 'oms',
      title: 'OMS SERIAL',
      img: hw.riotNewsOmsSerial,
      action: () => openDrawer('oms'),
    },
    {
      id: 'sv-club',
      title: 'CAMPUS ARENA',
      img: hw.riotNewsBooth,
      action: () => navigateToPage('gallery'),
    },
  ];

  const scrollRail = (dir: number) => {
    railRef.current?.scrollBy({ left: dir * 360, behavior: 'smooth' });
  };

  return (
    <section
      id="he-sinh-thai-strip"
      className="gf-riot-sec gf-riot-topo gf-riot-eco"
      aria-labelledby="riot-eco-h"
    >
      <div className="gf-riot-wrap">
        <div className="gf-riot-head">
          <h2 id="riot-eco-h" className="gf-riot-h2">
            Hệ Sinh Thái &amp; Giải Pháp
          </h2>
          <div className="gf-riot-nav-pair" aria-label="Điều hướng thẻ giải pháp">
            <button type="button" className="gf-riot-nav-txt" aria-label="Trước" onClick={() => scrollRail(-1)}>
              &larr;
            </button>
            <span className="gf-riot-nav-sep" aria-hidden="true" />
            <button type="button" className="gf-riot-nav-txt" aria-label="Tiếp" onClick={() => scrollRail(1)}>
              &rarr;
            </button>
          </div>
        </div>
      </div>

      <div ref={railRef} className="gf-riot-eco-rail">
        {cards.map((card) => (
          <button key={card.id} type="button" className="gf-riot-slant-card" onClick={card.action}>
            <img src={card.img} alt={card.title} className="gf-riot-slant-bg" />
            <div className="gf-riot-slant-overlay" aria-hidden="true" />
            <div className="gf-riot-slant-center">
              <strong className="gf-riot-slant-title">{card.title}</strong>
              {card.sub && <span className="gf-riot-slant-sub">{card.sub}</span>}
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

export function RiotStudentSplit() {
  const { openDrawer } = useGearForgeStore();

  return (
    <section id="tra-gop-sv" className="gf-riot-split" aria-labelledby="riot-split-h">
      <div className="gf-riot-split-inner">
        <div className="gf-riot-split-copy">
          <h2 id="riot-split-h" className="gf-riot-split-h2">
            Trả Góp 0% Sinh Viên!
          </h2>
          <p className="gf-riot-split-lead">
            Hãy đồng hành cùng GearForge để trang bị cấu hình chuẩn ĐHQG và giao KTX trong 2 giờ
          </p>

          <div className="gf-riot-stat-pair">
            <div className="gf-riot-stat-box">
              <strong>0%</strong>
              <span>Lãi suất qua thẻ SV</span>
            </div>
            <div className="gf-riot-stat-box">
              <strong>2</strong>
              <span>Giờ giao hỏa tốc KTX</span>
            </div>
          </div>

          <button
            type="button"
            className="gf-riot-red-pill"
            onClick={() => openDrawer('installment')}
          >
            Ước tính Trả góp 0%
          </button>
        </div>

        <div className="gf-riot-split-media" aria-hidden="true">
          <img
            src={VIBE_PORTFOLIO_CARDS.hardware.riotSplitStatue}
            alt="Cyber Bear Guardian tại showroom công nghệ GearForge ĐHQG"
          />
        </div>
      </div>
    </section>
  );
}
