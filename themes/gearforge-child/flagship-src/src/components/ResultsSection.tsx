import { RESULT_POSTERS } from '../data/sectionsData';
import { ArrowIcon } from './ArrowIcon';

export function ResultsSection() {
  return (
    <section
      id="gf-results"
      className="tc-pin tc-tim kq"
      data-pin=""
      style={{ '--len': 330 } as React.CSSProperties}
      aria-labelledby="kq-h"
    >
      <div className="tc-pin-in">
        <span className="tc-sao-nen" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>

        <div className="tc-wrap kq-grid">
          <div className="kq-chu">
            <h2 id="kq-h" className="tc-h2 kq-h">
              Cam kết phần cứng chuẩn <span className="tc-dan">Làng Đại học</span> và bảo hành S/N
            </h2>
            <div className="kq-so" aria-live="polite">
              <b data-kq-so="">{RESULT_POSTERS[0].stat}</b>
              <span data-kq-nhan="">{RESULT_POSTERS[0].label}</span>
            </div>
            <a className="kq-link" href="#gf-catalog">
              Khám phá cửa hàng <ArrowIcon />
            </a>
          </div>

          <div className="kq-bo" data-kq-bo="">
            {RESULT_POSTERS.map((poster, idx) => (
              <figure
                key={poster.img}
                className="kq-the"
                style={{ '--i': idx } as React.CSSProperties}
                data-so={poster.stat}
                data-nhan={poster.label}
              >
                <img src={poster.img} loading="lazy" alt={poster.alt} />
              </figure>
            ))}
          </div>
        </div>

        <ol className="kq-cham" aria-hidden="true">
          {RESULT_POSTERS.map((_, idx) => (
            <li key={idx} className={idx === 0 ? 'on' : ''} />
          ))}
        </ol>
      </div>
    </section>
  );
}
