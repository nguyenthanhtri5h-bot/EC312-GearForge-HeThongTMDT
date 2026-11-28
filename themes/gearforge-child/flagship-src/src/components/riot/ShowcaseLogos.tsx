export function ShowcaseLogo({ id }: { id: string }) {
  if (id === 'titan-workstation') {
    return (
      <svg viewBox="0 0 220 56" className="gf-wm-svg" aria-hidden="true">
        <polygon points="110,2 122,12 110,18 98,12" fill="#D13639" />
        <text x="110" y="38" textAnchor="middle" fill="#FFFFFF" fontFamily="'Barlow','Inter',sans-serif" fontWeight="800" fontSize="29" letterSpacing="4">
          TITAN AI
        </text>
        <text x="110" y="52" textAnchor="middle" fill="#E4E4E7" fontFamily="'Barlow','Inter',sans-serif" fontWeight="800" fontSize="11" letterSpacing="5">
          WORKSTATION
        </text>
      </svg>
    );
  }
  if (id === 'titan-2') {
    return (
      <svg viewBox="0 0 220 56" className="gf-wm-svg" aria-hidden="true">
        <rect x="78" y="6" width="64" height="3" fill="#D13639" />
        <text x="110" y="36" textAnchor="middle" fill="#FFFFFF" fontFamily="'Barlow','Inter',sans-serif" fontWeight="800" fontSize="28" letterSpacing="3">
          DORM MINI
        </text>
        <text x="110" y="50" textAnchor="middle" fill="#E4E4E7" fontFamily="'Barlow','Inter',sans-serif" fontWeight="800" fontSize="11" letterSpacing="4">
          ITX WORKSTATION
        </text>
      </svg>
    );
  }
  if (id === 'valkyrie-laptop') {
    return (
      <svg viewBox="0 0 220 56" className="gf-wm-svg" aria-hidden="true">
        <path d="M52 14L110 4L168 14" stroke="#EB0029" strokeWidth="2.5" fill="none" />
        <text x="110" y="37" textAnchor="middle" fill="#FFFFFF" fontFamily="'Barlow','Inter',sans-serif" fontWeight="800" fontSize="29" letterSpacing="3">
          VALKYRIE
        </text>
        <text x="110" y="51" textAnchor="middle" fill="#FCA5A5" fontFamily="'Barlow','Inter',sans-serif" fontWeight="800" fontSize="11" letterSpacing="5">
          GAMING RTX
        </text>
      </svg>
    );
  }
  if (id === 'valkyrie-2') {
    return (
      <svg viewBox="0 0 220 56" className="gf-wm-svg" aria-hidden="true">
        <polygon points="86,8 134,8 124,14 96,14" fill="#EB0029" />
        <text x="110" y="37" textAnchor="middle" fill="#FFFFFF" fontFamily="'Barlow','Inter',sans-serif" fontWeight="800" fontSize="26" letterSpacing="2">
          ROG / LEGION
        </text>
        <text x="110" y="51" textAnchor="middle" fill="#FCA5A5" fontFamily="'Barlow','Inter',sans-serif" fontWeight="800" fontSize="11" letterSpacing="4">
          RTX GAMING LAPTOPS
        </text>
      </svg>
    );
  }
  if (id === 'apex-rtx-pc') {
    return (
      <svg viewBox="0 0 220 60" className="gf-wm-svg" aria-hidden="true">
        <polygon points="94,4 126,4 134,12 110,19 86,12" fill="#EB0029" />
        <text x="110" y="40" textAnchor="middle" fill="#FFFFFF" fontFamily="'Barlow','Inter',sans-serif" fontWeight="800" fontSize="32" letterSpacing="3">
          APEX RTX
        </text>
        <rect x="64" y="45" width="92" height="2" fill="#FFFFFF" opacity="0.7" />
        <text x="110" y="57" textAnchor="middle" fill="#FCA5A5" fontFamily="'Barlow','Inter',sans-serif" fontWeight="800" fontSize="11" letterSpacing="5">
          CUSTOM SERIES
        </text>
      </svg>
    );
  }
  if (id === 'cipher-ultrabook') {
    return (
      <svg viewBox="0 0 220 56" className="gf-wm-svg" aria-hidden="true">
        <path d="M40 24H58M162 24H180" stroke="#E4E4E7" strokeWidth="3" />
        <text x="110" y="34" textAnchor="middle" fill="#FFFFFF" fontFamily="'Barlow','Inter',sans-serif" fontWeight="800" fontSize="29" letterSpacing="3">
          CIPHER EVO
        </text>
        <text x="110" y="49" textAnchor="middle" fill="#D4D4D8" fontFamily="'Barlow','Inter',sans-serif" fontWeight="800" fontSize="11" letterSpacing="4">
          ULTRABOOK &amp; DEV
        </text>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 220 56" className="gf-wm-svg" aria-hidden="true">
      <polygon points="48,26 60,18 56,28" fill="#D13639" />
      <polygon points="172,26 160,18 164,28" fill="#D13639" />
      <text x="110" y="34" textAnchor="middle" fill="#FFFFFF" fontFamily="'Barlow','Inter',sans-serif" fontWeight="800" fontSize="30" letterSpacing="3">
        STRIKE PRO
      </text>
      <text x="110" y="49" textAnchor="middle" fill="#E4E4E7" fontFamily="'Barlow','Inter',sans-serif" fontWeight="800" fontSize="11" letterSpacing="4">
        ESPORTS GEAR
      </text>
    </svg>
  );
}
