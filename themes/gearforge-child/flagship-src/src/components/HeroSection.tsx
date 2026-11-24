import { useRef } from 'react';
import { VIBE_VIDEOS } from '../data/vibeAssets';
import { useGearForgeStore } from '../hooks/useGearForgeStore';
import { useHeroAnimation } from '../hooks/useHeroAnimation';

export function HeroSection() {
  const { setVideoModalSrc } = useGearForgeStore();
  const heroRef = useRef<HTMLElement>(null);
  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  useHeroAnimation(heroRef);

  return (
    <section
      id="top"
      ref={heroRef}
      className="tc-hero gf-riot-hero"
      data-hero=""
      aria-labelledby="tc-h1"
    >
      <h1 id="tc-h1" className="tc-an">
        GearForge — Laptop Gaming, Custom PC RTX &amp; Esports Gear Sinh Viên ĐHQG-HCM
      </h1>

      <div className="gf-hero-bg" aria-hidden="true">
        {reducedMotion ? (
          <img
            src={VIBE_VIDEOS.posterHeroRiot}
            alt="GearForge Arena Showcase"
            className="gf-hero-poster-img"
          />
        ) : (
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster={VIBE_VIDEOS.posterHeroRiot}
          >
            <source src={VIBE_VIDEOS.heroRiotCinematic} type="video/mp4" />
          </video>
        )}
        <div className="gf-hero-top-scrim" />
      </div>

      <button
        type="button"
        className="gf-hero-mini-play"
        aria-label="Phát Trailer 60fps toàn màn hình"
        title="Xem Trailer toàn màn hình"
        onClick={() => setVideoModalSrc(VIBE_VIDEOS.heroRiotCinematic)}
      >
        &#9654;
      </button>
    </section>
  );
}
