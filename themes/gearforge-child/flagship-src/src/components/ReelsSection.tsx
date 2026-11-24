import { RESULT_POSTERS } from '../data/sectionsData';
import { REEL_VIDEOS } from '../data/socialData';
import { useGearForgeStore } from '../hooks/useGearForgeStore';
import { ArrowIcon, MuteIcon } from './ArrowIcon';

const BAY_CONFIG = [
  { cls: 'rl-bay-0', cuon: -120 },
  { cls: 'rl-bay-1', cuon: 90 },
  { cls: 'rl-bay-2', cuon: -60 },
  { cls: 'rl-bay-3', cuon: 140 },
];

export function ReelsSection() {
  const { setVideoModalSrc, showToast } = useGearForgeStore();
  const floatingPosters = RESULT_POSTERS.slice(0, 4);

  return (
    <section
      id="gf-reels"
      className="tc-pin rl"
      data-pin=""
      style={{ '--len': 264 } as React.CSSProperties}
      aria-labelledby="rl-h"
    >
      <div className="tc-pin-in">
        <div className="tc-wrap rl-grid">
          <div className="rl-chu">
            <h2 id="rl-h" className="tc-h2 rl-h">
              Benchmark thực tế cho <span className="tc-gach">từng dòng máy</span> sẵn kho
            </h2>
            <p className="tc-lede">
              Mỗi cấu hình Laptop Gaming, Workstation AI &amp; Custom PC đều có báo cáo FPS, nhiệt độ và thời lượng pin.
            </p>
            <a className="tc-link" href="#gf-catalog">
              Lọc máy theo nhu cầu <ArrowIcon />
            </a>
          </div>

          <div className="rl-dt">
            <div className="rl-feed" data-rl-feed="">
              {REEL_VIDEOS.map((vid, idx) => (
                <button
                  key={vid.title}
                  type="button"
                  className="rl-mot"
                  style={{ '--i': idx } as React.CSSProperties}
                  onClick={() => {
                    if (vid.fullVideo) setVideoModalSrc(vid.fullVideo);
                    else showToast(vid.title);
                  }}
                  aria-label={`Xem benchmark: ${vid.title}`}
                >
                  <img src={vid.poster} loading="lazy" alt={vid.title} />
                  {vid.previewVideo && (
                    <video
                      className="tc-song"
                      muted
                      playsInline
                      loop
                      preload="none"
                      data-src={vid.previewVideo}
                      aria-hidden="true"
                    />
                  )}
                  <span className="rl-cot" aria-hidden="true">
                    <i>♥</i>
                    <i>✦</i>
                    <i>➦</i>
                  </span>
                  <span className="tc-am" aria-hidden="true">
                    <MuteIcon />
                    GearForge Lab
                  </span>
                  <span className="rl-ten">{vid.title}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="rl-bay" aria-hidden="true">
            {floatingPosters.map((p, idx) => (
              <img
                key={p.img}
                className={BAY_CONFIG[idx].cls}
                data-cuon={BAY_CONFIG[idx].cuon}
                src={p.img}
                loading="lazy"
                alt=""
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
