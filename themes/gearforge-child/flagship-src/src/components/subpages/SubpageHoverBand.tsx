import { useState } from 'react';

export interface HoverBandItem {
  id: string;
  tag: string;
  title: string;
  meta: string;
  desc: string;
  img: string;
  actionLabel?: string;
  onAction?: () => void;
}

interface SubpageHoverBandProps {
  kicker: string;
  heading: string;
  items: HoverBandItem[];
}

export function SubpageHoverBand({ kicker, heading, items }: SubpageHoverBandProps) {
  const [activeId, setActiveId] = useState<string>(items[0]?.id || '');
  const activeItem = items.find((it) => it.id === activeId) || items[0];

  if (!items.length || !activeItem) return null;

  return (
    <section className="gf-sub-band-dark" aria-label={heading}>
      <div className="tc-wrap">
        <div className="gf-sub-band-head">
          <span className="gf-sub-band-kicker">{kicker}</span>
          <h2 className="gf-sub-band-h2">{heading}</h2>
        </div>

        <div className="gf-sub-hover-grid">
          <div className="gf-sub-hover-rows" role="list">
            {items.map((it) => {
              const active = it.id === activeItem.id;
              return (
                <button
                  key={it.id}
                  type="button"
                  role="listitem"
                  className={`gf-sub-hover-row${active ? ' is-active' : ''}`}
                  aria-current={active ? 'true' : undefined}
                  onMouseEnter={() => setActiveId(it.id)}
                  onFocus={() => setActiveId(it.id)}
                  onClick={() => {
                    setActiveId(it.id);
                    if (it.onAction) it.onAction();
                  }}
                >
                  <div>
                    <span className="gf-sub-hover-row-title">{it.title}</span>
                    <span className="gf-sub-hover-row-meta">{it.meta}</span>
                  </div>
                  <span className="gf-sub-hover-row-arrow" aria-hidden="true">
                    &rarr;
                  </span>
                </button>
              );
            })}
          </div>

          <div className="gf-sub-hover-stage">
            {items.map((it) => (
              <img
                key={it.id}
                src={it.img}
                alt={it.title}
                className={`gf-sub-hover-frame${it.id === activeItem.id ? ' is-active' : ''}`}
              />
            ))}
            <div className="gf-sub-hover-cap">
              <span className="gf-sub-band-kicker" style={{ marginBottom: 4 }}>
                {activeItem.tag}
              </span>
              <strong>{activeItem.title}</strong>
              <span>{activeItem.desc}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
