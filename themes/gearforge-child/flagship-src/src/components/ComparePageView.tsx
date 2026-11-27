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
  const { compareItems, toggleCompare, clearCompare, addToCart, openDrawer, navigateToPage } = useGearForgeStore();
  const [diffOnly, setDiffOnly] = useState(false);

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
          <div style={{ padding: '44px 28px', background: '#0B0B0D', color: '#F1F0EC', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 24 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18, maxWidth: 620 }}>
              <CrestIcon size={36} />
              <div>
                <h2 style={{ margin: '0 0 8px', fontFamily: 'var(--gf-font-display)', fontSize: 22, fontWeight: 800, color: '#FFFFFF' }}>
                  Khay So Sánh Cấu Hình Đang Trống (0/3)
                </h2>
                <p style={{ margin: '0 0 10px', fontSize: 14.5, lineHeight: 1.55, color: 'rgba(241,240,236,0.78)' }}>
                  Chọn tối đa 3 Laptop Gaming, Ultrabook hoặc PC AI cùng nhóm trong Kho Sản Phẩm để đối chiếu từng thông số CPU, TGP RTX, màn hình DCI-P3 và khoản góp 0%/tháng.
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              <button type="button" className="gf-tool-btn-primary" onClick={() => navigateToPage('shop')}>
                Mở Kho Sản Phẩm &rarr;
              </button>
              <button type="button" className="gf-tool-link-btn" style={{ color: '#FFFFFF', borderBottomColor: '#D13639' }} onClick={() => navigateToPage('ecosystem')}>
                Gợi ý máy theo ngành học
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="gf-cmp-toolbar">
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13.5, fontWeight: 700, cursor: 'pointer', color: '#0A0A0A' }}>
                <input
                  type="checkbox"
                  checked={diffOnly}
                  onChange={(e) => setDiffOnly(e.target.checked)}
                  style={{ width: 18, height: 18, accentColor: '#D13639' }}
                />
                <span>Chỉ hiện điểm khác biệt</span>
              </label>
              <button type="button" className="gf-tool-link-btn" onClick={() => void clearCompare()}>
                Xóa tất cả ({compareItems.length})
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="gf-cmp-matrix">
                <thead>
                  <tr>
                    <th>Thông số</th>
                    {compareItems.map((it) => (
                      <th key={it.id}>
                        <div className="gf-cmp-col-head">
                          <img src={it.image} alt={it.name} />
                          <a href={it.permalink || '#'}>{it.name}</a>
                          <button type="button" className="gf-tool-link-btn" style={{ alignSelf: 'flex-start' }} onClick={() => void toggleCompare(it.id)}>
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
                    return (
                      <tr key={row.label} className={hasDiff ? 'is-diff' : ''}>
                        <th>{row.label}</th>
                        {vals.map((val, idx) => (
                          <td
                            key={idx}
                            style={
                              row.label.startsWith('Giá') || row.label.startsWith('Trả góp')
                                ? { fontFamily: "'JetBrains Mono', monospace", fontWeight: 800, color: '#D13639' }
                                : undefined
                            }
                          >
                            {val}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                  <tr>
                    <th>Thao tác</th>
                    {compareItems.map((it) => (
                      <td key={it.id}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
                          <button type="button" className="gf-tool-btn-primary" style={{ minHeight: 38, padding: '0 14px', fontSize: 12 }} onClick={() => void addToCart(it.id, 1)}>
                            Thêm vào giỏ
                          </button>
                          <button type="button" className="gf-tool-link-btn" onClick={() => openDrawer('installment', it.id)}>
                            Trả góp 0% &rarr;
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
