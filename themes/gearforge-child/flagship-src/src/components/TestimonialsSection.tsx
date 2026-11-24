import { CUSTOMER_VIDEOS } from '../data/socialData';
import { useGearForgeStore } from '../hooks/useGearForgeStore';
import { MuteIcon, PlayIcon } from './ArrowIcon';

export function TestimonialsSection() {
  const { setVideoModalSrc, showToast } = useGearForgeStore();

  return (
    <section
      id="gf-testimonials"
      className="tc-pin tc-tim kc"
      data-pin=""
      style={{ '--len': 228 } as React.CSSProperties}
      aria-labelledby="kc-h"
    >
      <div className="tc-pin-in">
        <span className="tc-sao-nen" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>

        <div className="tc-wrap kc-dau">
          <h2 id="kc-h" className="tc-h2 kc-h">
            Sinh viên ĐHQG-HCM tin chọn từ <span className="tc-dan">UIT tới Bách Khoa</span>
          </h2>
          <span className="kc-note" aria-hidden="true">
            cuộn để xem setup các khoa
          </span>
        </div>

        <div className="kc-vong" data-kc="">
          {CUSTOMER_VIDEOS.map((item, idx) => (
            <button
              key={item.name}
              type="button"
              className="kc-the"
              style={{ '--i': idx } as React.CSSProperties}
              onClick={() => {
                if (item.fullVideo) setVideoModalSrc(item.fullVideo);
                else showToast(`${item.name} · ${item.title}`);
              }}
              aria-label={`Xem setup của ${item.name}`}
            >
              <img src={item.poster} loading="lazy" alt={`Setup phần cứng của ${item.name}`} />
              {item.previewVideo && (
                <video
                  className="tc-song"
                  muted
                  playsInline
                  loop
                  preload="none"
                  data-src={item.previewVideo}
                  aria-hidden="true"
                />
              )}
              <span className="tc-play" aria-hidden="true">
                <PlayIcon />
              </span>
              <span className="tc-am" aria-hidden="true">
                <MuteIcon />
                {item.title}
              </span>
              <span className="kc-ten">{item.name}</span>
            </button>
          ))}
        </div>

        <div className="kc-loi" data-kc-loi="">
          {CUSTOMER_VIDEOS.map((item, idx) => (
            <blockquote key={item.name} className={idx === 0 ? 'on' : ''}>
              <span className="tc-sao">★★★★★</span>
              <p>{item.quote}</p>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
