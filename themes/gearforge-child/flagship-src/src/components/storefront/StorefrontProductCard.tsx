import type { MouseEvent } from 'react';
import { formatVnd, useGearForgeStore } from '../../hooks/useGearForgeStore';
import { useCardMedia } from '../../hooks/useCardMedia';
import type { GearForgeProduct } from '../../types/gearforge';
import './xgear-shelves.css';

interface Props {
  product: GearForgeProduct;
  compact?: boolean;
  showFlashBar?: boolean;
  eagerImage?: boolean;
}

function calcDiscountPct(regular: number, current: number): number {
  if (regular <= current || regular <= 0) return 0;
  return Math.max(1, Math.min(45, Math.round(((regular - current) / regular) * 100)));
}

function formatSpecToken(kind: 'cpu' | 'gpu' | 'ram' | 'ssd', value: string | undefined, fallback: string): string {
  const clean = (value || fallback || '')
    .replace(/[®™]/g, '')
    .replace(/\s*\([^)]*\)/g, '')
    .trim();
  if (!clean || clean === 'Đang cập nhật') return fallback;

  if (kind === 'cpu') {
    const ultra = clean.match(/Core\s*Ultra\s*([579])(?:\s*processor)?\s*[- ]?(\d{3}[A-Z]*)/i);
    if (ultra) return `Ultra ${ultra[1]} ${ultra[2]}`;
    const intel = clean.match(/(?:Intel\s*Core\s*)?(i[3579]|Core\s*[3579])(?:\s*processor)?\s*[- ]?(\d{3,5}[A-Z]*)/i);
    if (intel) return `${intel[1].replace(/^Core\s*/i, 'Core ')}-${intel[2]}`.replace(/\s+/g, ' ');
    const ryzen = clean.match(/Ryzen\s*(?:AI\s*(?:Max\+?\s*)?)?([3579])\s*[- ]?(\d{3,4}[A-Z]*)/i);
    if (ryzen) return `R${ryzen[1]}-${ryzen[2]}`;
    const apple = clean.match(/M[1-4](?:\s*(?:Pro|Max))?/i);
    if (apple) return apple[0];
    return clean.replace(/^CPU\s+(AMD|Intel)\s+/i, '').slice(0, 14);
  }

  if (kind === 'gpu') {
    const rtx = clean.match(/(?:RTX|GTX)\s*\d{4}(?:\s*(?:Ti|SUPER|4GB|6GB|8GB|12GB|16GB))?/i);
    if (rtx) return rtx[0].replace(/\s+/g, ' ');
    const rx = clean.match(/(?:Radeon\s*)?(RX\s*\d{3,4}[A-Z]*|\d{3}M)/i);
    if (rx) return rx[1].startsWith('RX') ? rx[1] : `Radeon ${rx[1]}`;
    if (/arc/i.test(clean)) return 'Intel Arc';
    if (/tích hợp|iris|uhd|graphics/i.test(clean)) return 'GPU Onboard';
    if (/Tem Serial/i.test(clean)) return 'Chuẩn Serial';
    return clean.slice(0, 14);
  }

  if (kind === 'ram') {
    const ram = clean.match(/(\d+\s*GB)(?:\s*(LPDDR[45]X?|DDR[45]))?/i);
    if (ram) return `${ram[1].replace(/\s+/g, '')}${ram[2] ? ` ${ram[2].toUpperCase()}` : ''}`;
    return /Bảo hành/i.test(clean) ? clean : '16GB DDR5';
  }

  const ssd = clean.match(/(\d+\s*(?:GB|TB))/i);
  if (ssd) return `${ssd[1].replace(/\s+/g, '')} SSD`;
  return clean.replace(/^Chính hãng GearForge$/i, 'Chính hãng').slice(0, 14);
}

export function StorefrontProductCard({ product, compact = false, showFlashBar = false, eagerImage = false }: Props) {
  const { compareIds, toggleCompare, addToCart, setQuickViewProduct } = useGearForgeStore();
  const media = useCardMedia(product, eagerImage);

  const inCompare = compareIds.includes(product.id);
  const effectivePrice = product.salePrice && product.salePrice > 0 ? product.salePrice : product.price;
  const regPrice = product.regularPrice ?? 0;
  const discPct = calcDiscountPct(regPrice, effectivePrice);
  const monthly = product.monthly3m && product.monthly3m > 0 ? product.monthly3m : Math.round((effectivePrice * 0.8) / 3);
  const cpu = formatSpecToken('cpu', product.specs.cpu, 'Core / Ryzen');
  const gpu = formatSpecToken('gpu', product.specs.gpu, 'GPU Onboard');
  const ram = formatSpecToken('ram', product.specs.ram, '16GB');
  const extra = formatSpecToken('ssd', product.specs.storage || product.specs.screen, '512GB SSD');
  const stockRate = 58 + ((product.id * 11) % 34);
  const isOut = product.stockStatus === 'outofstock';
  const showQuickPeekBar = !media.hasSecondAngle && !compact;

  const handleQuickView = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickViewProduct(product);
  };

  return (
    <article className="gf-prod-card">
      <div
        ref={media.wrapRef}
        className={`gf-prod-media-wrap ${media.isHovered ? 'is-hovered' : ''}`}
        onMouseEnter={() => media.setHovered(true)}
        onMouseLeave={() => media.setHovered(false)}
      >
        <a
          href={product.permalink}
          className={`gf-prod-media ${media.primaryLoaded ? 'is-ready' : 'is-loading'}`}
          aria-label={product.name}
        >
          <img
            ref={media.primaryImgRef}
            src={media.imgSrc}
            alt={product.name}
            className="gf-prod-img gf-prod-img--primary"
            {...media.imgProps}
            onLoad={media.onPrimaryLoad}
            onError={media.onPrimaryError}
          />
          {media.hasSecondAngle && (
            <img
              src={media.angle2Url}
              alt=""
              aria-hidden="true"
              className="gf-prod-img gf-prod-img--angle2"
              {...media.imgProps}
              style={{ opacity: media.isHovered && media.angle2Ready ? 1 : 0 }}
            />
          )}
        </a>

        {discPct > 0 && <span className="xg-disc-badge">-{discPct}%</span>}
        <span className={`gf-prod-stock ${isOut ? 'is-out' : ''}`}>
          {isOut ? 'Hết hàng' : 'Sẵn kho'}
        </span>

        {showQuickPeekBar ? (
          <div className="xg-quick-peek">
            <span>Góp 0% ~{formatVnd(monthly)}/th</span>
            <button
              type="button"
              className="xg-qv-inline"
              onClick={handleQuickView}
              aria-label={`Xem nhanh ${product.name}`}
            >
              Xem nhanh
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="xg-qv-float"
            onClick={handleQuickView}
            aria-label={`Xem nhanh ${product.name}`}
          >
            Xem nhanh
          </button>
        )}
      </div>

      <div className="gf-prod-body">
        <span className="gf-prod-kicker">{product.category}</span>
        <h3 className="gf-prod-title">
          <a href={product.permalink} className="gf-prod-title-link" title={product.name}>
            {product.name}
          </a>
        </h3>

        <div className="xg-spec-2x2" aria-label="Thông số tóm tắt">
          <div className="xg-spec-cell" title={product.specs.cpu || cpu}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="4" y="4" width="16" height="16" rx="2" /><rect x="9" y="9" width="6" height="6" />
            </svg>
            <span>{cpu}</span>
          </div>
          <div className="xg-spec-cell" title={product.specs.gpu || gpu}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="8" cy="12" r="2.5" /><circle cx="16" cy="12" r="2.5" />
            </svg>
            <span>{gpu}</span>
          </div>
          <div className="xg-spec-cell" title={product.specs.ram || ram}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M3 7h18v10H3zM7 7v10M12 7v10M17 7v10" />
            </svg>
            <span>{ram}</span>
          </div>
          <div className="xg-spec-cell" title={product.specs.storage || extra}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <ellipse cx="12" cy="5" rx="8" ry="3" /><path d="M4 5v14c0 1.66 3.58 3 8 3s8-1.34 8-3V5" />
            </svg>
            <span>{extra}</span>
          </div>
        </div>

        <div className="gf-prod-pricing">
          <div className="gf-prod-price-row">
            <span className="gf-prod-price">{formatVnd(effectivePrice)}</span>
            {regPrice > effectivePrice && <span className="xg-strike">{formatVnd(regPrice)}</span>}
          </div>
          {!compact && (
            <div className="xg-sv-hook">Ưu đãi SV ĐHQG · Góp 0% ~{formatVnd(monthly)}/th</div>
          )}
        </div>

        {showFlashBar && (
          <div className="xg-flash-bar">
            <div className="xg-flash-fill" style={{ width: `${stockRate}%` }} />
            <span>Đã đặt {Math.round(stockRate / 3)} máy</span>
          </div>
        )}

        <div className="gf-prod-actions">
          <button
            type="button"
            className="gf-act-btn is-primary"
            disabled={isOut}
            onClick={() => void addToCart(product.id, 1)}
          >
            {isOut ? 'Hết hàng' : 'Thêm giỏ'}
          </button>
          <button
            type="button"
            className={`gf-act-btn ${inCompare ? 'is-active' : ''}`}
            aria-pressed={inCompare}
            onClick={() => void toggleCompare(product.id)}
          >
            {inCompare ? `Đã chọn (${compareIds.length})` : '+ So sánh'}
          </button>
        </div>
      </div>
    </article>
  );
}
