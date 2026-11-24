import type React from 'react';

interface CrestIconProps {
  size?: number;
  className?: string;
}

/**
 * Canonical GearForge web crest — single unified crimson-and-white hexagonal forge emblem.
 */
export function CrestIcon({ size = 32, className = 'gf-crest-svg' }: CrestIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" aria-hidden="true" className={className}>
      <polygon points="60,6 108,24 100,79 60,114 20,79 12,24" fill="#D13639" />
      <polygon points="60,15 99,30 92,75 60,104 28,75 21,30" fill="#0B0B0E" />
      <path d="M60 24L86 36L82 49H54V59H79L73 82L60 94L37 74L34 37L60 24Z" fill="#FFFFFF" />
      <polygon points="56,64 72,64 67,79 58,86" fill="#EB0029" />
    </svg>
  );
}

interface BrandLogoProps {
  subLabel?: string;
  height?: number;
  tone?: 'light' | 'dark';
  stacked?: boolean;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export function BrandLogo({
  subLabel,
  height = 28,
  tone = 'light',
  stacked = false,
  onClick,
}: BrandLogoProps) {
  const isLightText = tone === 'light';
  const wordColor = isLightText ? '#FFFFFF' : '#0A0A0A';
  const subColor = isLightText ? 'rgba(255, 255, 255, 0.7)' : '#52525B';

  return (
    <a href="/" className="header-logo-link" aria-label="GearForge Trang chủ" onClick={onClick}>
      <CrestIcon size={height} />
      <span className={`gf-brand-text-wrap${stacked ? ' is-stacked' : ''}`}>
        {stacked ? (
          <>
            <span className="gf-brand-word-top" style={{ color: wordColor }}>GEAR</span>
            <span className="gf-brand-word-bot" style={{ color: wordColor }}>FORGE</span>
          </>
        ) : (
          <span className="gf-brand-word" style={{ color: wordColor }}>GEARFORGE</span>
        )}
        {subLabel && (
          <span className="header-logo-sub" style={{ color: subColor }}>
            {subLabel}
          </span>
        )}
      </span>
    </a>
  );
}
