import { useEffect, useState } from 'react';
import { formatVnd, useGearForgeStore } from '../hooks/useGearForgeStore';
import type { CompareItem } from '../types/gearforge';
import './drawers/drawers-extra.css';

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

export function CompareDrawer() {
  const {
    boot,
    activeDrawer,
    compareItems,
    closeDrawer,
    toggleCompare,
    clearCompare,
    addToCart,
    openDrawer,
  } = useGearForgeStore();
  const [diffOnly, setDiffOnly] = useState(false);

  useEffect(() => {
    if (activeDrawer !== 'compare') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDrawer();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeDrawer, closeDrawer]);

  if (activeDrawer !== 'compare') return null;

  return (
    <div
      className="gf-drawer-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="gf-compare-drawer-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeDrawer();
      }}
    >
      <div className="gf-drawer-panel" style={{ width: 'min(820px, 100vw)' }}>
        <div className="gf-drawer-head">
          <div>
            <h3 id="gf-compare-drawer-title">So sánh cấu hình ({compareItems.length}/3)</h3>
            <span style={{ fontSize: 12.5, color: '#52525B' }}>
              Đối chiếu trực quan thông số kỹ thuật &amp; ước tính trả góp 0%
            </span>
          </div>
          <button type="button" className="gf-drawer-close" aria-label="Đóng so sánh" onClick={closeDrawer}>
            &times;
          </button>
        </div>

        <div className="gf-drawer-body">
          {compareItems.length === 0 ? (
            <div className="gf-alert-box is-warn">
              Khay so sánh đang trống. Hãy chọn tối đa 3 Laptop hoặc PC trong{' '}
              <a
                href="/shop/"
                style={{ color: '#D13639', fontWeight: 800, textDecoration: 'underline' }}
                onClick={closeDrawer}
              >
                Cửa hàng sản phẩm
              </a>{' '}
              để đối chiếu thông số.
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13.5, fontWeight: 700, cursor: 'pointer', color: '#0A0A0A' }}>
                  <input
                    type="checkbox"
                    checked={diffOnly}
                    onChange={(e) => setDiffOnly(e.target.checked)}
                    style={{ width: 18, height: 18, accentColor: '#D13639' }}
                  />
                  <span>Chỉ hiện điểm khác biệt</span>
                </label>
                <button type="button" className="gf-cmp-rm" onClick={() => void clearCompare()}>
                  Xóa tất cả
                </button>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table className="gf-cmp-table">
                  <thead>
                    <tr>
                      <th>Thông số</th>
                      {compareItems.map((it) => (
                        <th key={it.id} style={{ width: 'auto', minWidth: 165 }}>
                          <div className="gf-cmp-head-card">
                            <button type="button" className="gf-cmp-rm" onClick={() => void toggleCompare(it.id)}>
                              Xóa
                            </button>
                            <img src={it.image} alt={it.name} />
                            <a href={it.permalink || '#'} style={{ color: '#0A0A0A', fontWeight: 800, fontSize: 13, lineHeight: 1.35 }}>
                              {it.name}
                            </a>
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
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <button
                              type="button"
                              className="gf-act-btn is-primary"
                              onClick={() => void addToCart(it.id, 1)}
                            >
                              Thêm vào giỏ
                            </button>
                            <button
                              type="button"
                              className="gf-act-btn"
                              onClick={() => openDrawer('installment', it.id)}
                            >
                              Đăng ký trả góp 0%
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

        <div className="gf-drawer-foot" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 12.5, color: '#52525B' }}>Hỗ trợ tối đa 3 thiết bị cùng lúc</span>
          <a href={boot.routes.compare} className="gf-act-btn is-active" style={{ display: 'inline-flex', alignItems: 'center' }}>
            Mở bảng toàn trang →
          </a>
        </div>
      </div>
    </div>
  );
}
