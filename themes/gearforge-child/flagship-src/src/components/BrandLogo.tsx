import type React from 'react';
import { vibeUrl } from '../data/vibeAssets';

interface BrandLogoProps {
  subLabel?: string;
  height?: number;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export function BrandLogo({
  subLabel = 'ĐHQG-HCM',
  height = 42,
  onClick,
}: BrandLogoProps) {
  return (
    <a href="/" className="header-logo-link" aria-label="GearForge Trang chủ" onClick={onClick}>
      <img
        src={vibeUrl('gearforge-wordmark-3d.png')}
        alt="GearForge"
        height={height}
        className="header-logo-lockup"
        decoding="async"
      />
      {subLabel && <span className="header-logo-sub">{subLabel}</span>}
    </a>
  );
}
