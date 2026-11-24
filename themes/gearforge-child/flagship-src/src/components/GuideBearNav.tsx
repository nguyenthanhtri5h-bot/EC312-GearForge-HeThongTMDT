import type { RefObject } from 'react';
import { GUIDE_SECTIONS } from '../data/footerData';
import { VIBE_BEAR_GUIDE } from '../data/vibeAssets';
import { useGuideBear } from '../hooks/useGuideBear';

export function GuideBearNav({ rootRef }: { rootRef: RefObject<HTMLElement | null> }) {
  const { visible, moving, changed, progress, activeIdx, positions, scrollToSection } =
    useGuideBear(rootRef);

  return (
    <nav
      className={`tc-dd ${visible ? 'hien' : ''} ${moving ? 'di' : ''} ${changed ? 'doi' : ''}`}
      aria-label="Điều hướng các phân khu GearForge"
      style={{ '--q': progress.toFixed(4) } as React.CSSProperties}
    >
      <div className="tc-dd-ray" aria-hidden="true">
        <i className="tc-dd-chi" />
      </div>
      <ol className="tc-dd-moc">
        {GUIDE_SECTIONS.map((sec, idx) => (
          <li
            key={sec.id}
            className={idx <= activeIdx ? 'qua' : ''}
            style={{ '--t': `${positions[idx].toFixed(2)}%` } as React.CSSProperties}
          >
            <a
              href={`#${sec.id}`}
              onClick={(e) => {
                e.preventDefault();
                scrollToSection(idx);
              }}
            >
              <span>{sec.label}</span>
            </a>
          </li>
        ))}
      </ol>
      <div className="tc-dd-gau" aria-hidden="true">
        <img src={VIBE_BEAR_GUIDE.avatar} alt="" />
        <b className={`tc-dd-nhan ${changed ? 'noi' : ''}`}>{GUIDE_SECTIONS[activeIdx]?.label}</b>
      </div>
    </nav>
  );
}
