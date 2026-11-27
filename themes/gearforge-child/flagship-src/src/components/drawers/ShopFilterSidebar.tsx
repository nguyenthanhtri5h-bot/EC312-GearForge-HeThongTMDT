import { useEffect, useState } from 'react';
import type { FilterParams } from '../../types/gearforge';

const PRICE_OPTIONS = [
  { id: 'all', label: 'Tất cả', maxPrice: 80000000 },
  { id: 'lt20', label: '< 20tr', maxPrice: 20000000 },
  { id: '20to30', label: '20–30tr', maxPrice: 30000000 },
  { id: '30to50', label: '30–50tr', maxPrice: 50000000 },
];

const FACET_GROUPS: Array<{
  key: 'cpu' | 'gpu' | 'ram' | 'storage';
  title: string;
  options: Array<{ label: string; value: string }>;
}> = [
  {
    key: 'cpu',
    title: 'CPU',
    options: [
      { label: 'Tất cả', value: '' },
      { label: 'Core i5', value: 'Core i5' },
      { label: 'Core i7/i9', value: 'Core i7/i9' },
      { label: 'Ryzen', value: 'Ryzen' },
      { label: 'Apple M', value: 'Apple M' },
    ],
  },
  {
    key: 'gpu',
    title: 'GPU / VGA',
    options: [
      { label: 'Tất cả', value: '' },
      { label: 'RTX 3050/4050', value: 'RTX 3050/4050' },
      { label: 'RTX 4060', value: 'RTX 4060' },
      { label: 'RTX 4070+', value: 'RTX 4070+' },
      { label: 'Card tích hợp', value: 'Integrated' },
    ],
  },
  {
    key: 'ram',
    title: 'RAM',
    options: [
      { label: 'Tất cả', value: '' },
      { label: '16GB', value: '16GB' },
      { label: '32GB', value: '32GB' },
      { label: '64GB+', value: '64GB+' },
    ],
  },
  {
    key: 'storage',
    title: 'Ổ cứng',
    options: [
      { label: 'Tất cả', value: '' },
      { label: '512GB', value: '512GB' },
      { label: '1TB', value: '1TB' },
      { label: '2TB+', value: '2TB+' },
    ],
  },
];

interface Props {
  filters: FilterParams;
  onUpdate: (patch: Partial<FilterParams>) => void;
  onResetAll: () => void;
}

export function ShopFilterSidebar({ filters, onUpdate, onResetAll }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [priceId, setPriceId] = useState('all');

  useEffect(() => {
    if (filters.maxPrice === 20000000) setPriceId('lt20');
    else if (filters.maxPrice === 30000000) setPriceId('20to30');
    else if (filters.maxPrice === 50000000) setPriceId('30to50');
    else setPriceId('all');
  }, [filters.maxPrice]);

  const activeCount = [
    filters.cpu,
    filters.gpu,
    filters.ram,
    filters.storage,
    filters.maxPrice < 80000000 ? 'price' : '',
  ].filter(Boolean).length;

  const hasAnyFilter = Boolean(
    activeCount > 0 || filters.category || filters.search
  );

  return (
    <aside className="gf-shop-aside" aria-label="Bộ lọc thông số chi tiết">
      <button
        type="button"
        className="gf-filter-mobile-btn"
        aria-expanded={mobileOpen}
        onClick={() => setMobileOpen((prev) => !prev)}
      >
        <span className="gf-filter-mobile-label">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
            <path d="M3 5h18M6 12h12M10 19h4" />
          </svg>
          Bộ lọc thông số
          {activeCount > 0 && <b className="gf-filter-badge">{activeCount}</b>}
        </span>
        <span className="gf-filter-chevron">{mobileOpen ? 'Thu gọn −' : 'Mở bộ lọc +'}</span>
      </button>

      <div className={`gf-shop-sidebar ${mobileOpen ? 'is-open' : ''}`}>
        <div className="gf-sidebar-head">
          <h3>Bộ lọc cấu hình</h3>
          {activeCount > 0 && <span className="gf-filter-badge">{activeCount}</span>}
        </div>

        <div className="gf-facet-group">
          <span className="gf-facet-title">Mức giá</span>
          <div className="gf-facet-pills" role="radiogroup" aria-label="Mức giá">
            {PRICE_OPTIONS.map((opt) => {
              const active = priceId === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  className={`gf-facet-chip ${active ? (opt.id === 'all' ? 'is-neutral-on' : 'is-active') : ''}`}
                  onClick={() => {
                    setPriceId(opt.id);
                    onUpdate({ maxPrice: opt.maxPrice, page: 1 });
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {FACET_GROUPS.map((group) => {
          const current = filters[group.key] || '';
          return (
            <div key={group.key} className="gf-facet-group">
              <span className="gf-facet-title">{group.title}</span>
              <div className="gf-facet-pills" role="radiogroup" aria-label={group.title}>
                {group.options.map((opt) => {
                  const active = current === opt.value;
                  return (
                    <button
                      key={opt.label}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      className={`gf-facet-chip ${active ? (opt.value === '' ? 'is-neutral-on' : 'is-active') : ''}`}
                      onClick={() => {
                        const nextVal = active && opt.value !== '' ? '' : opt.value;
                        onUpdate({ [group.key]: nextVal, page: 1 });
                      }}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        <button
          type="button"
          className="gf-clear-filters-btn"
          disabled={!hasAnyFilter}
          onClick={() => {
            setPriceId('all');
            onResetAll();
          }}
        >
          Xóa tất cả bộ lọc
        </button>
      </div>
    </aside>
  );
}
