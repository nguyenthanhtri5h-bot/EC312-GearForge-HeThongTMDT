import { STATS_CARDS } from '../data/sectionsData';
import { ArrowIcon } from './ArrowIcon';

export function StatsSection() {
  return (
    <section id="gf-stats" className="tc-sec tc-lilac cs" aria-labelledby="cs-h">
      <div className="tc-wrap">
        <h2 id="cs-h" className="tc-h2 cs-h">
          GearForge có máy sẵn kho, duyệt góp 0% và <span className="tc-gach">bảo hành điện tử</span>
        </h2>

        <ul className="cs-ds" data-cs="">
          {STATS_CARDS.map((card) => (
            <li key={card.full}>
              <span className="cs-dong">
                <span className="tc-an">{card.full}</span>
                <span className="cs-so" aria-hidden="true">
                  {card.digits.map((d, idx) =>
                    d === '.' ? (
                      <span key={idx} className="cs-cham">
                        .
                      </span>
                    ) : (
                      <span key={idx} className="cs-o">
                        <span className="cs-cuon" style={{ '--d': d } as React.CSSProperties} />
                      </span>
                    )
                  )}
                </span>
                <em aria-hidden="true">{card.suffix}</em>
              </span>
              <span className="cs-nhan">{card.label}</span>
            </li>
          ))}
        </ul>

        <a className="tc-link cs-link" href="#gf-catalog">
          Khám phá toàn bộ sản phẩm <ArrowIcon />
        </a>
      </div>
    </section>
  );
}
