import { useRef } from 'react';
import { VIBE_PORTFOLIO_CARDS, VIBE_VIDEOS } from '../../data/vibeMedia';
import { useGearForgeStore } from '../../hooks/useGearForgeStore';
import './riot-home.css';

interface EcosystemCard {
  id: string;
  step: string;
  title: string;
  sub: string;
  img: string;
  action: () => void;
}

export function RiotEcosystemStrip() {
  const { navigateToPage, setVideoModalSrc } = useGearForgeStore();
  const downXRef = useRef(0);
  const hw = VIBE_PORTFOLIO_CARDS.hardware;

  const cards: EcosystemCard[] = [
    { id: 'ai', step: '01', title: 'AI BUILDER', sub: 'Gợi ý cấu hình theo ngành ĐHQG', img: hw.ecoCardAi, action: () => navigateToPage('ecosystem') },
    { id: 'setup', step: '02', title: 'ĐHQG SETUP', sub: 'Góc máy thực tế sinh viên đã giao', img: hw.ecoCardSetup, action: () => navigateToPage('gallery') },
    { id: 'lab', step: '03', title: 'LAB STRESS', sub: 'Test tải nặng 30p trước xuất kho', img: hw.riotEcoStressLab, action: () => setVideoModalSrc(VIBE_VIDEOS.heroShowcase) },
    { id: 'oms', step: '04', title: 'OMS SERIAL', sub: 'Tra cứu bảo hành & hóa đơn VAT', img: hw.ecoCardOms, action: () => navigateToPage('tracking') },
    { id: 'sv-club', step: '05', title: 'GIAO KTX 2 GIỜ', sub: 'Giao hỏa tốc KTX Khu A & B', img: hw.swKtxDelivery, action: () => navigateToPage('tracking') },
  ];

  return (
    <section
      id="he-sinh-thai-strip"
      className="gf-riot-sec gf-riot-eco"
      role="region"
      aria-roledescription="carousel"
      aria-labelledby="riot-eco-h"
    >
      <div className="gf-riot-wrap">
        <div className="gf-riot-head">
          <h2 id="riot-eco-h" className="gf-riot-h2">Hệ Sinh Thái &amp; Giải Pháp</h2>
          <button type="button" className="gf-riot-all-btn" onClick={() => navigateToPage('ecosystem')}>
            KHÁM PHÁ HỆ SINH THÁI
          </button>
        </div>
      </div>

      <div className="gf-riot-eco-wide">
        <div className="gf-riot-eco-grid">
          {cards.map((card) => (
            <button
              key={card.id}
              type="button"
              className="gf-riot-slant-card"
              onPointerDown={(e) => {
                downXRef.current = e.clientX;
              }}
              onClick={(e) => {
                if (e.detail !== 0 && Math.abs(e.clientX - downXRef.current) > 8) return;
                card.action();
              }}
            >
              <img src={card.img} alt={card.title} className="gf-riot-slant-bg" draggable={false} />
              <div className="gf-riot-slant-overlay" aria-hidden="true" />
              <div className="gf-riot-slant-center">
                <span className="gf-riot-slant-step">{card.step}</span>
                <strong className="gf-riot-slant-title">{card.title}</strong>
                <span className="gf-riot-slant-sub">{card.sub}</span>
              </div>
            </button>
          ))}
        </div>
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
          <h2 id="riot-split-h" className="gf-riot-split-h2">Trả Góp 0% Sinh Viên ĐHQG</h2>
          <p className="gf-riot-split-lead">
            Duyệt hồ sơ điện tử qua email .edu.vn, không giữ giấy tờ gốc — giao tận KTX Khu A &amp; B trong 2 giờ.
          </p>

          <div className="gf-riot-stat-pair">
            <div className="gf-riot-stat-box">
              <strong>0%</strong>
              <span>Lãi suất 3 kỳ · .edu.vn</span>
            </div>
            <div className="gf-riot-stat-box">
              <strong>2 giờ</strong>
              <span>Giao hỏa tốc KTX ĐHQG</span>
            </div>
          </div>

          <button type="button" className="gf-riot-red-pill" onClick={() => openDrawer('installment')}>
            Ước tính Trả góp 0%
          </button>
        </div>

        <div className="gf-riot-split-media" aria-hidden="true">
          <img
            src={VIBE_PORTFOLIO_CARDS.hardware.riotSplitStatue}
            alt="Khối phần cứng Custom PC và Laptop RTX tại GearForge Studio ĐHQG"
            draggable={false}
          />
        </div>
      </div>
    </section>
  );
}
