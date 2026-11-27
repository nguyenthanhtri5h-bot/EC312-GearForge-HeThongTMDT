import { useRef, useState } from 'react';
import { VIBE_VIDEOS } from '../data/vibeAssets';
import { useGearForgeStore } from '../hooks/useGearForgeStore';
import { useHeroAnimation } from '../hooks/useHeroAnimation';

export function HeroSection() {
  const { setVideoModalSrc, navigateToPage, openDrawer } = useGearForgeStore();
  const heroRef = useRef<HTMLElement>(null);
  const [videoReady, setVideoReady] = useState(false);
  const reducedMotion =
    typeof window !== 'undefined' &&
    (window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData));
  useHeroAnimation(heroRef);

  return (
    <section
      id="top"
      ref={heroRef}
      className="tc-hero gf-riot-hero"
      data-hero=""
      aria-labelledby="tc-h1"
    >
      <div className="gf-hero-bg" aria-hidden="true">
        <img
          src={VIBE_VIDEOS.posterHeroRiot}
          alt="GearForge Arena Showcase"
          fetchPriority="high"
          className="gf-hero-poster-img"
        />
        {!reducedMotion && (
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={VIBE_VIDEOS.posterHeroRiot}
            className={videoReady ? 'is-ready' : ''}
            onCanPlay={() => setVideoReady(true)}
            onPlaying={() => setVideoReady(true)}
          >
            <source src={VIBE_VIDEOS.heroRiotCinematic} type="video/mp4" />
          </video>
        )}
        <div className="gf-hero-top-scrim" />
        <div className="gf-hero-bottom-scrim" />
      </div>

      <div className="gf-hero-bottom-stack">
        <span className="gf-hero-eyebrow">SHOWROOM CÔNG NGHỆ · KTX ĐHQG-HCM</span>
        <h1 id="tc-h1" className="gf-hero-title">
          Laptop RTX, Custom PC AI &amp; Esports Gear Sinh Viên
        </h1>
        <div className="gf-hero-bottom-bar">
          <button
            type="button"
            className="gf-hero-mini-play"
            aria-label="Phát Trailer toàn màn hình"
            title="Xem Trailer toàn màn hình"
            onClick={() => setVideoModalSrc(VIBE_VIDEOS.heroRiotCinematic)}
          >
            &#9654;
          </button>
          <button
            type="button"
            className="gf-hero-cta-primary"
            onClick={() => navigateToPage('shop')}
          >
            Khám phá Kho Máy ĐHQG →
          </button>
          <button
            type="button"
            className="gf-hero-cta-secondary"
            onClick={() => openDrawer('installment')}
          >
            Trả góp 0% · .edu.vn
          </button>
        </div>
      </div>
    </section>
  );
}
