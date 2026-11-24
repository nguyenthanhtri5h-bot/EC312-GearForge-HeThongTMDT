import type { FilterParams } from '../../types/gearforge';

const SORT_OPTIONS = [
  { key: 'featured', label: 'Mặc định' },
  { key: 'price_asc', label: 'Giá tăng dần' },
  { key: 'price_desc', label: 'Giá giảm dần' },
  { key: 'newest', label: 'Mới nhất' },
  { key: 'popularity', label: 'Bán chạy' },
];

interface Props {
  sort: string;
  onChange: (patch: Partial<FilterParams>) => void;
}

export function ShopSortBar({ sort, onChange }: Props) {
  const normalized = !sort || sort === 'menu_order' ? 'featured' : sort;

  return (
    <div className="gf-sort-bar" role="group" aria-label="Sắp xếp sản phẩm">
      <span className="gf-sort-label">Sắp xếp:</span>
      <div className="gf-sort-btns">
        {SORT_OPTIONS.map((opt) => {
          const active = normalized === opt.key;
          return (
            <button
              key={opt.key}
              type="button"
              aria-pressed={active}
              className={`gf-sort-btn ${active ? 'is-active' : ''}`}
              onClick={() => onChange({ sort: opt.key, page: 1 })}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
