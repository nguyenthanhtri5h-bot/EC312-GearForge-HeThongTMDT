import { useEffect, useState } from 'react';
import { formatVnd, useGearForgeStore } from '../../hooks/useGearForgeStore';
import type { GearForgeProduct } from '../../types/gearforge';
import './xgear-shelves.css';

interface Props {
  product: GearForgeProduct;
  compact?: boolean;
  showFlashBar?: boolean;
  eagerImage?: boolean;
}

const IMG_BASE = '/wp-content/themes/gearforge-child/assets/flagship/vibe/hardware';
const SVG_FALLBACK =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200"><rect width="320" height="200" fill="#FFFFFF"/><rect x="52" y="34" width="216" height="114" rx="6" fill="#F5F4F0" stroke="#DFDEDC" stroke-width="2"/><path d="M36 154h248l-12 14H48z" fill="#DFDEDC"/><rect x="132" y="84" width="56" height="14" rx="3" fill="#D13639"/></svg>'
  );

function resolveFallbackImage(categorySlug: string): string {
  const s = (categorySlug || '').toLowerCase();
  if (s.includes('gaming') && !s.includes('pc')) return `${IMG_BASE}/laptop-gaming.jpg`;
  if (s.includes('pc') || s.includes('workstation')) return `${IMG_BASE}/pc-workstation.jpg`;
  if (s.includes('linh-kien') || s.includes('ram')) return `${IMG_BASE}/pc-minimal.jpg`;
  if (s.includes('gear') || s.includes('phu-kien') || s.includes('phim') || s.includes('chuot')) {
    return `${IMG_BASE}/gear-peripherals.jpg`;
  }
  return `${IMG_BASE}/laptop-ultrabook.jpg`;
}

function calcDiscountPct(regular: number, current: number): number {
  if (regular <= current || regular <= 0) return 0;
  return Math.max(1, Math.min(45, Math.round(((regular - current) / regular) * 100)));
}

export function StorefrontProductCard({ product, compact = false, showFlashBar = false, eagerImage = false }: Props) {
  const { compareIds, toggleCompare, addToCart, setQuickViewProduct } = useGearForgeStore();
  const [imgSrc, setImgSrc] = useState(product.image || resolveFallbackImage(product.categorySlug));
  const [fallbackStep, setFallbackStep] = useState(0);

  useEffect(() => {
    setImgSrc(product.image || resolveFallbackImage(product.categorySlug));
    setFallbackStep(0);
  }, [product.image, product.categorySlug]);

  const inCompare = compareIds.includes(product.id);
  const effectivePrice = product.salePrice && product.salePrice > 0 ? product.salePrice : product.price;
  const regPrice = product.regularPrice ?? 0;
  const discPct = calcDiscountPct(regPrice, effectivePrice);
  const monthly = product.monthly3m && product.monthly3m > 0 ? product.monthly3m : Math.round((effectivePrice * 0.8) / 3);
  const cpu = product.specs.cpu || 'Core / Ryzen';
  const gpu = product.specs.gpu || 'Card tích hợp';
  const ram = product.specs.ram || '16GB';
  const extra = product.specs.storage || product.specs.screen || '512GB NVMe';
  const stockRate = 58 + ((product.id * 11) % 34);
  const isOut = product.stockStatus === 'outofstock';

  return (
    <article className="gf-prod-card">
      <a href={product.permalink} className="gf-prod-media">
        <img
          src={imgSrc}
          alt={product.name}
          loading={eagerImage ? 'eager' : 'lazy'}
          decoding="async"
          onError={() => {
            const localFallback = resolveFallbackImage(product.categorySlug);
            if (fallbackStep === 0 && localFallback !== imgSrc) {
              setFallbackStep(1);
              setImgSrc(localFallback);
            } else if (fallbackStep < 2) {
              setFallbackStep(2);
              setImgSrc(SVG_FALLBACK);
            }
          }}
        />
        {discPct > 0 && <span className="xg-disc-badge">-{discPct}%</span>}
        <span className={`gf-prod-stock ${isOut ? 'is-out' : ''}`}>
          {isOut ? 'Hết hàng' : 'Sẵn kho'}
        </span>
      </a>

      <div className="gf-prod-body">
        <span className="gf-prod-kicker">{product.category}</span>
        <h3 className="gf-prod-title">
          <a href={product.permalink} className="gf-prod-title-link">{product.name}</a>
        </h3>

        <div className="xg-spec-2x2" aria-label="Thông số tóm tắt">
          <div className="xg-spec-cell" title={cpu}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="4" y="4" width="16" height="16" rx="2" /><rect x="9" y="9" width="6" height="6" />
            </svg>
            <span>{cpu}</span>
          </div>
          <div className="xg-spec-cell" title={gpu}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="8" cy="12" r="2.5" /><circle cx="16" cy="12" r="2.5" />
            </svg>
            <span>{gpu}</span>
          </div>
          <div className="xg-spec-cell" title={ram}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M3 7h18v10H3zM7 7v10M12 7v10M17 7v10" />
            </svg>
            <span>{ram}</span>
          </div>
          <div className="xg-spec-cell" title={extra}>
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
            <div className="xg-sv-hook">Ưu đãi SV ĐHQG: Góp 0% ~{formatVnd(monthly)}/th</div>
          )}
        </div>

        {showFlashBar && (
          <div className="xg-flash-bar">
            <div className="xg-flash-fill" style={{ width: `${stockRate}%` }} />
            <span>Đã đặt {Math.round(stockRate / 3)} máy</span>
          </div>
        )}

        <div className={`gf-prod-actions ${compact ? 'is-compact' : ''}`}>
          <button
            type="button"
            className="gf-act-btn is-primary"
            disabled={isOut}
            onClick={() => void addToCart(product.id, 1)}
          >
            {isOut ? 'Hết hàng' : 'Thêm giỏ'}
          </button>
          <button type="button" className="gf-act-btn" onClick={() => setQuickViewProduct(product)}>
            Xem nhanh
          </button>
          {!compact && (
            <button
              type="button"
              className={`gf-act-btn ${inCompare ? 'is-active' : ''}`}
              aria-pressed={inCompare}
              onClick={() => void toggleCompare(product.id)}
            >
              {inCompare ? `Đã chọn (${compareIds.length})` : '+ So sánh'}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
