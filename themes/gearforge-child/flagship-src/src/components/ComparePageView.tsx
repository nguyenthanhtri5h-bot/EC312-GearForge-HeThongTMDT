import { useState } from 'react';
import { COMPARE_MEDIA_DATA } from '../data/subpageBandsData';
import { formatVnd, useGearForgeStore } from '../hooks/useGearForgeStore';
import type { CompareItem } from '../types/gearforge';
import { CrestIcon } from './BrandLogo';
import { RiotSubpageHero } from './RiotSubpageHero';
import { SubpageMediaBand } from './subpages/SubpageMediaBand';
import '../styles/tool-pages.css';

interface SpecRowDef {
  label: string;
  getValue: (item: CompareItem) => string;
}

const parsePrice = (item: CompareItem): number => {
  if (typeof item.price === 'number' && !Number.isNaN(item.price)) return item.price;
  const digits = String(item.price || item.priceFormatted || '').replace(/[^\d]/g, '');
  return digits ? Number(digits) : 0;
};

const SPEC_ROWS: SpecRowDef[] = [
  {
    label: 'Giá bán',
    getValue: (it) => {
      const p = parsePrice(it);
      return p > 0 ? formatVnd(p) : (it.priceFormatted || 'Liên hệ');
    },
  },
  {
    label: 'Trả góp 0%/tháng',
    getValue: (it) => {
      const p = parsePrice(it);
      return p > 0 ? `${formatVnd(Math.round((p * 0.8) / 3))}/th (3 kỳ)` : 'Liên hệ';
    },
  },
  { label: 'CPU', getValue: (it) => it.specs?.cpu || 'Đang cập nhật' },
  { label: 'RAM', getValue: (it) => it.specs?.ram || 'Đang cập nhật' },
  { label: 'GPU', getValue: (it) => it.specs?.gpu || 'Card tích hợp' },
  { label: 'Lưu trữ', getValue: (it) => it.specs?.storage || '512GB NVMe' },
  { label: 'Màn hình', getValue: (it) => it.specs?.screen || 'Đang cập nhật' },
  { label: 'Trọng lượng', getValue: (it) => it.specs?.weight || 'Đang cập nhật' },
];

export function ComparePageView() {
  const { boot, products, compareItems, toggleCompare, clearCompare, addToCart, openDrawer, navigateToPage } = useGearForgeStore();
  const [diffOnly, setDiffOnly] = useState(false);

  const handleQuickDemoCompare = async () => {
    const pool = [...products, ...(boot.products || [])];
    const laptops = pool.filter((p) => p.categorySlug.includes('laptop') && p.stockStatus === 'instock');
    const picks = (laptops.length >= 2 ? laptops : pool).slice(0, 2);
    for (const item of picks) {
      await toggleCompare(item.id);
    }
  };

  const prices = compareItems.map(parsePrice).filter((n) => n > 0);
  const minPrice = prices.length > 1 ? Math.min(...prices) : 0;

  return (
    <main className="tc gf-tool-page" id="tc-compare">
      <RiotSubpageHero
        crumbLabel="Kho sản phẩm / So sánh cấu hình"
        crumbTarget="shop"
        kicker="ĐỐI CHIẾU THÔNG SỐ · TỐI ĐA 3 THIẾT BỊ"
        title={`So Sánh Cấu Hình (${compareItems.length}/3)`}
        sub="Đối chiếu trực tiếp CPU, GPU, RAM, màn hình và mức góp 0%/tháng giữa các mẫu laptop hoặc workstation đang quan tâm."
      />

      <div className="tc-wrap">
        {compareItems.length === 0 ? (
          <div className="gf-cmp-empty">
            <div className="gf-cmp-empty-copy">
              <CrestIcon size={36} />
              <div>
                <h2>Khay So Sánh Cấu Hình Đang Trống (0/3)</h2>
                <p>
                  Chọn tối đa 3 Laptop Gaming, Ultrabook hoặc PC AI cùng nhóm trong Kho Sản Phẩm để đối chiếu từng thông số CPU, GPU RTX, màn hình và khoản góp 0%/tháng.
                </p>
              </div>
            </div>
            <div className="gf-cmp-empty-actions">
              <button type="button" className="gf-tool-btn-primary" onClick={() => void handleQuickDemoCompare()}>
                So sánh nhanh 2 laptop nổi bật
              </button>
              <button type="button" className="gf-tool-link-btn is-light" onClick={() => navigateToPage('shop')}>
                Mở Kho Sản Phẩm
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="gf-cmp-toolbar">
              <label className="gf-cmp-diff-toggle">
                <input type="checkbox" checked={diffOnly} onChange={(e) => setDiffOnly(e.target.checked)} />
                <span>Chỉ hiện điểm khác biệt</span>
              </label>
              <button type="button" className="gf-tool-link-btn" onClick={() => void clearCompare()}>
                Xóa tất cả ({compareItems.length})
              </button>
            </div>

            <div className="gf-cmp-scroll">
              <table className="gf-cmp-matrix">
                <thead>
                  <tr>
                    <th>Thông số</th>
                    {compareItems.map((it) => (
                      <th key={it.id}>
                        <div className="gf-cmp-col-head">
                          <img src={it.image} alt={it.name} />
                          <a href={it.permalink || '#'}>{it.name}</a>
                          <button type="button" className="gf-tool-link-btn is-sm" onClick={() => void toggleCompare(it.id)}>
                            Bỏ khỏi so sánh
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SPEC_ROWS.map((row) => {
                    const vals = compareItems.map((it) => row.getValue(it));
                    const hasDiff = new Set(vals).size > 1;
                    if (diffOnly && !hasDiff) return null;
                    const isPriceRow = row.label.startsWith('Giá') || row.label.startsWith('Trả góp');
                    return (
                      <tr key={row.label} className={hasDiff ? 'is-diff' : ''}>
                        <th>{row.label}</th>
                        {vals.map((val, idx) => {
                          const isBest = row.label === 'Giá bán' && minPrice > 0 && parsePrice(compareItems[idx]) === minPrice;
                          return (
                            <td key={idx} className={isPriceRow ? 'gf-cmp-price-cell' : undefined}>
                              <span>{val}</span>
                              {isBest && <span className="gf-cmp-best-pill">Giá tốt nhất</span>}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                  <tr>
                    <th>Thao tác</th>
                    {compareItems.map((it) => (
                      <td key={it.id}>
                        <div className="gf-cmp-row-actions">
                          <button type="button" className="gf-tool-btn-primary is-compact" onClick={() => void addToCart(it.id, 1)}>
                            Thêm vào giỏ
                          </button>
                          <button type="button" className="gf-tool-link-btn" onClick={() => openDrawer('installment', it.id)}>
                            Trả góp 0%
                          </button>
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <SubpageMediaBand
        kicker={COMPARE_MEDIA_DATA.kicker}
        heading={COMPARE_MEDIA_DATA.heading}
        desc={COMPARE_MEDIA_DATA.desc}
        videoSrc={COMPARE_MEDIA_DATA.videoSrc}
        posterSrc={COMPARE_MEDIA_DATA.posterSrc}
        verticalReel
        facts={COMPARE_MEDIA_DATA.facts}
        ctaLabel="Thêm cấu hình từ Kho Sản Phẩm"
        onCta={() => navigateToPage('shop')}
      />
    </main>
  );
}
