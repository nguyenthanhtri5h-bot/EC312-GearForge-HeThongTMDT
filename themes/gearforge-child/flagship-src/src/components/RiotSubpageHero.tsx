import type { ReactNode } from 'react';
import { useGearForgeStore } from '../hooks/useGearForgeStore';
import type { FlagshipPageMode } from '../types/gearforge';
import '../styles/gallery-page.css';

interface RiotSubpageHeroProps {
  crumbLabel: string;
  crumbTarget?: FlagshipPageMode;
  kicker?: string;
  title: ReactNode;
  sub?: string;
  action?: ReactNode;
  children?: ReactNode;
}

export function RiotSubpageHero({
  crumbLabel,
  crumbTarget = 'showcase',
  kicker,
  title,
  sub,
  action,
  children,
}: RiotSubpageHeroProps) {
  const { navigateToPage } = useGearForgeStore();

  return (
    <section className="gf-sub-hero">
      <svg className="gf-news-shards" viewBox="0 0 1440 360" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <path d="M320 62L575 154L748 128L918 54L994 0L940 74L1095 20L1005 112L1168 96L1035 162L1142 292L984 184L868 278L882 192L714 218L562 298L640 198L486 154Z" fill="#18181B" />
        <path d="M1230 14L1130 112L1265 92L1178 164L1385 118L1440 82L1440 162L1278 216L1372 320L1215 224L1128 336L1142 204L1068 154Z" fill="#1D1D21" />
        <path d="M902 0L978 86L1072 22L1012 118L1118 228L992 146L914 212L948 122L836 68Z" fill="#0B0B0D" />
      </svg>

      <div className="tc-wrap gf-sub-hero-in">
        <div className="gf-sub-hero-top">
          <div>
            <button type="button" className="gf-news-crumb" onClick={() => navigateToPage(crumbTarget)}>
              &larr; {crumbLabel}
            </button>
            {kicker && <span className="gf-sub-kicker">{kicker}</span>}
            <h1 className="gf-sub-title">{title}</h1>
            {sub && <p className="gf-sub-lead">{sub}</p>}
          </div>
          {action && <div className="gf-sub-action">{action}</div>}
        </div>
        {children}
      </div>

      <svg className="gf-news-tear" viewBox="0 0 1440 58" preserveAspectRatio="none" aria-hidden="true">
        <path
          d="M0 32C95 48 178 14 282 26C395 39 468 48 592 31C718 14 824 8 960 22C1098 36 1212 46 1335 28C1382 21 1416 14 1440 18L1440 58L0 58Z"
          fill="#F1F0EC"
        />
      </svg>
    </section>
  );
}
