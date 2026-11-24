import { useState } from 'react';
import { VIBE_PORTFOLIO_CARDS } from '../../data/vibeMedia';
import { useGearForgeStore } from '../../hooks/useGearForgeStore';
import { ShowcaseLogo } from './ShowcaseLogos';

interface ShowcaseLine {
  id: string;
  categorySlug: string;
  label: string;
  img: string;
  platforms: Array<'win' | 'mac' | 'gpu' | 'ktx'>;
}

const hw = VIBE_PORTFOLIO_CARDS.hardware;

const SHOWCASE_LINES: ShowcaseLine[] = [
  { id: 'titan-workstation', categorySlug: 'pc-workstation', label: 'Titan AI Workstation', img: hw.riotP4Titan, platforms: ['win', 'gpu', 'ktx'] },
  { id: 'valkyrie-laptop', categorySlug: 'laptop-gaming', label: 'Valkyrie Gaming RTX', img: hw.riotP2Valkyrie, platforms: ['win', 'gpu'] },
  { id: 'apex-rtx-pc', categorySlug: 'pc-workstation', label: 'Apex RTX Custom Series', img: hw.riotP1ApexPc, platforms: ['win', 'gpu', 'ktx'] },
  { id: 'cipher-ultrabook', categorySlug: 'laptop-ultrabook', label: 'Cipher Evo Ultrabook', img: hw.riotP3Cipher, platforms: ['win', 'mac', 'ktx'] },
  { id: 'strike-gear', categorySlug: 'gear', label: 'Strike Pro Esports Gear', img: hw.riotP5Strike, platforms: ['win', 'mac'] },
  { id: 'valkyrie-2', categorySlug: 'laptop-gaming', label: 'ROG Strix & Legion RTX', img: hw.laptopRogRgb, platforms: ['win', 'gpu'] },
  { id: 'titan-2', categorySlug: 'pc-workstation', label: 'ĐHQG Dorm Mini-ITX', img: hw.campusBkCad, platforms: ['win', 'ktx'] },
];

function PlatformIcon({ kind }: { kind: 'win' | 'mac' | 'gpu' | 'ktx' }) {
  if (kind === 'win') {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M3 5.5 10.5 4.4v7.1H3zm8.6-1.3L21 3v8.5h-9.4zM3 12.6h7.5v7.1L3 18.6zm8.6 0H21V21l-9.4-1.3z" />
      </svg>
    );
  }
  if (kind === 'mac') {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M18.7 19.5c-.9 1.3-1.8 2.5-3.2 2.5-1.4 0-1.9-.8-3.4-.8-1.6 0-2.1.8-3.4.8-1.4 0-2.4-1.3-3.3-2.6C3.5 16.7 2.2 12 4.1 8.8c1-1.6 2.6-2.6 4.4-2.6 1.4 0 2.6.9 3.4.9.8 0 2.3-1.1 3.9-.9.7 0 2.6.3 3.8 2-3.3 1.9-2.7 6.3.6 7.6-.4 1.3-1 2.5-1.5 3.7zM14.7 4.7c.7-.9 1.2-2.1 1-3.3-1 0-2.2.7-2.9 1.6-.6.7-1.2 1.9-1 3.1 1.1.1 2.2-.5 2.9-1.4z" />
      </svg>
    );
  }
  if (kind === 'gpu') {
    return (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" aria-hidden="true">
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <rect x="9" y="9" width="6" height="6" />
      </svg>
    );
  }
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" aria-hidden="true">
      <rect x="6" y="3" width="12" height="18" rx="2" />
      <circle cx="12" cy="17.5" r="1" fill="currentColor" />
    </svg>
  );
}

export function RiotProductsShowcase() {
  const { navigateToPage } = useGearForgeStore();
  const [paused, setPaused] = useState(false);
  const [activeIdx, setActiveIdx] = useState(2);

  return (
    <section
      id="san-pham"
      className="gf-riot-sec gf-riot-topo gf-riot-showcase"
      aria-labelledby="riot-showcase-h"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="gf-riot-wrap">
        <div className="gf-riot-head">
          <h2 id="riot-showcase-h" className="gf-riot-h2">
            Dòng Máy Chủ Lực
          </h2>
        </div>
      </div>

      <div className="gf-riot-games-viewport">
        <div className={`gf-riot-games-track${paused ? ' is-paused' : ''}`}>
          {[...SHOWCASE_LINES, ...SHOWCASE_LINES].map((item, idx) => {
            const logicalIdx = idx % SHOWCASE_LINES.length;
            const isElevated = logicalIdx === activeIdx;
            return (
              <button
                key={`${item.id}-${idx}`}
                type="button"
                className={`gf-riot-game-card${isElevated ? ' is-elevated' : ''}`}
                onMouseEnter={() => setActiveIdx(logicalIdx)}
                onClick={() => navigateToPage('shop', { category: item.categorySlug })}
                aria-label={item.label}
              >
                <img src={item.img} alt={item.label} className="gf-riot-game-img" />
                <div className="gf-riot-game-grad" aria-hidden="true" />
                <div className="gf-riot-game-wordmark">
                  <ShowcaseLogo id={item.id} />
                </div>
                <div className="gf-riot-game-platforms" aria-hidden="true">
                  {item.platforms.map((p) => (
                    <PlatformIcon key={p} kind={p} />
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
