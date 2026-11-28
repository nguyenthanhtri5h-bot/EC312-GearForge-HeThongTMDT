import type { MouseEvent } from 'react';
import { formatVnd, useGearForgeStore } from '../../hooks/useGearForgeStore';
import { useCardMedia } from '../../hooks/useCardMedia';
import type { GearForgeProduct } from '../../types/gearforge';
import { extractCardSpecs } from './specFormatter';
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

function SpecIcon({ kind }: { kind: 'cpu' | 'gpu' | 'ram' | 'extra' }) {
  if (kind === 'cpu') {
    return (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <rect x="4" y="4" width="16" height="16" rx="2" /><rect x="9" y="9" width="6" height="6" />
      </svg>
    );
  }
  if (kind === 'gpu') {
    return (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="8" cy="12" r="2.5" /><circle cx="16" cy="12" r="2.5" />
      </svg>
    );
  }
  if (kind === 'ram') {
    return (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M3 7h18v10H3zM7 7v10M12 7v10M17 7v10" />
      </svg>
    );
  }
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <ellipse cx="12" cy="5" rx="8" ry="3" /><path d="M4 5v14c0 1.66 3.58 3 8 3s8-1.34 8-3V5" />
    </svg>
  );
}

export function StorefrontProductCard({ product, compact = false, showFlashBar = false, eagerImage = false }: Props) {
  const { compareIds, toggleCompare, addToCart, setQuickViewProduct } = useGearForgeStore();
  const media = useCardMedia(product, eagerImage);

  const inCompare = compareIds.includes(product.id);
  const effectivePrice = product.salePrice && product.salePrice > 0 ? product.salePrice : product.price;
  const regPrice = product.regularPrice ?? 0;
  const discPct = calcDiscountPct(regPrice, effectivePrice);
  const monthly = product.monthly3m && product.monthly3m > 0 ? product.monthly3m : Math.round((effectivePrice * 0.8) / 3);
  const specs = extractCardSpecs(product);
  const stockRate = 58 + ((product.id * 11) % 34);
  const isOut = product.stockStatus === 'outofstock';

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

        <button
          type="button"
          className="xg-qv-float"
          onClick={handleQuickView}
          aria-label={`Xem nhanh ${product.name}`}
        >
          Xem nhanh
        </button>
      </div>

      <div className="gf-prod-body">
        <span className="gf-prod-kicker">{product.category}</span>
        <h3 className="gf-prod-title">
          <a href={product.permalink} className="gf-prod-title-link" title={product.name}>
            {product.name}
          </a>
        </h3>

        <div className="xg-spec-2x2" aria-label="Thông số tóm tắt">
          {specs.map((sp) => (
            <div key={sp.kind} className="xg-spec-cell" title={sp.title}>
              <SpecIcon kind={sp.kind} />
              <span>{sp.label}</span>
            </div>
          ))}
        </div>

        <div className="gf-prod-pricing">
          <div className="gf-prod-price-row">
            <span className="gf-prod-price">{formatVnd(effectivePrice)}</span>
            {regPrice > effectivePrice && <span className="xg-strike">{formatVnd(regPrice)}</span>}
          </div>
          {!compact && (
            <div className="xg-sv-hook">
              {effectivePrice >= 3000000
                ? `Góp 0% .edu.vn chỉ từ ${formatVnd(monthly)}/th`
                : 'Chính hãng ĐHQG · Giao KTX 2 giờ'}
            </div>
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
