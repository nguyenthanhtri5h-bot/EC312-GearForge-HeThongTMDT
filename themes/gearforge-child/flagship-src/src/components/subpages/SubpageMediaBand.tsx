export interface MediaFactRow {
  label: string;
  value: string;
}

interface SubpageMediaBandProps {
  kicker: string;
  heading: string;
  desc: string;
  videoSrc: string;
  posterSrc: string;
  verticalReel?: boolean;
  facts: MediaFactRow[];
  ctaLabel: string;
  onCta: () => void;
}

export function SubpageMediaBand({
  kicker,
  heading,
  desc,
  videoSrc,
  posterSrc,
  verticalReel = false,
  facts,
  ctaLabel,
  onCta,
}: SubpageMediaBandProps) {
  const reduceMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <section className="gf-sub-band-dark" aria-label={heading}>
      <div className="tc-wrap">
        <div className={`gf-sub-media-grid${verticalReel ? ' is-vertical-reel' : ''}`}>
          <div className="gf-sub-media-box">
            <video
              src={videoSrc}
              autoPlay={!reduceMotion}
              controls={reduceMotion}
              muted
              loop={!reduceMotion}
              playsInline
              preload="metadata"
              poster={posterSrc}
            />
          </div>

          <div>
            <span className="gf-sub-band-kicker">{kicker}</span>
            <h2 className="gf-sub-band-h2">{heading}</h2>
            <p className="gf-sub-media-desc">{desc}</p>

            <ul className="gf-sub-bullet-list">
              {facts.map((f) => (
                <li key={f.label}>
                  <span>{f.label}</span>
                  <strong>{f.value}</strong>
                </li>
              ))}
            </ul>

            <button type="button" className="gf-sub-cta-pill" onClick={onCta}>
              {ctaLabel} &rarr;
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
