export interface SubpageMiniCard {
  id: string;
  tag: string;
  title: string;
  img: string;
  onClick: () => void;
}

interface SubpageCardsBandProps {
  kicker: string;
  heading: string;
  cards: SubpageMiniCard[];
}

export function SubpageCardsBand({ kicker, heading, cards }: SubpageCardsBandProps) {
  if (!cards.length) return null;

  return (
    <section className="gf-sub-band-parchment" aria-label={heading}>
      <div className="tc-wrap">
        <div className="gf-sub-band-head">
          <span className="gf-sub-band-kicker">{kicker}</span>
          <h2 className="gf-sub-band-h2">{heading}</h2>
        </div>

        <div className="gf-sub-cards-4">
          {cards.map((c) => (
            <button key={c.id} type="button" className="gf-sub-mini-card" onClick={c.onClick}>
              <img src={c.img} alt={c.title} loading="lazy" />
              <div className="gf-sub-mini-card-body">
                <span>{c.tag}</span>
                <strong>{c.title}</strong>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
