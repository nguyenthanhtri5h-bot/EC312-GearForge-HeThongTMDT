import type { FilterParams } from '../../types/gearforge';

const CATEGORY_TABS = [
  { key: '', label: 'Tất cả', aliases: [''] },
  { key: 'laptop-gaming', label: 'Laptop Gaming', aliases: ['laptop-gaming', 'gaming'] },
  { key: 'laptop-ultrabook', label: 'Ultrabook & Đồ họa', aliases: ['laptop-ultrabook', 'ultrabook', 'laptop-van-phong', 'laptop-do-hoa', 'creator', 'dev'] },
  { key: 'pc-workstation', label: 'PC Workstation', aliases: ['pc-workstation', 'workstation', 'pc-nguyen-bo', 'pc', 'pc-gaming'] },
  { key: 'linh-kien', label: 'Linh kiện PC', aliases: ['linh-kien'] },
  { key: 'gear', label: 'Gear & Phụ kiện', aliases: ['gear', 'phu-kien', 'accessories'] },
];

interface BrandChip {
  id: string;
  label: string;
  search?: string;
  gpu?: string;
  category?: string;
}

const BRAND_NEED_CHIPS: BrandChip[] = [
  { id: 'all', label: 'Tất cả' },
  { id: 'asus', label: 'ASUS', search: 'ASUS' },
  { id: 'lenovo', label: 'LENOVO', search: 'Lenovo' },
  { id: 'msi', label: 'MSI', search: 'MSI' },
  { id: 'acer', label: 'ACER', search: 'Acer' },
  { id: 'hp', label: 'HP', search: 'HP' },
  { id: 'macbook', label: 'MacBook', search: 'MacBook' },
];

interface Props {
  filters: FilterParams;
  searchInput: string;
  totalProducts: number;
  hideCategoryTabs?: boolean;
  onSearchChange: (val: string) => void;
  onUpdate: (patch: Partial<FilterParams>) => void;
}

export function CatalogFilterBar({
  filters,
  searchInput,
  totalProducts,
  hideCategoryTabs = false,
  onSearchChange,
  onUpdate,
}: Props) {
  const isChipActive = (chip: BrandChip): boolean => {
    if (chip.id === 'all') {
      return !filters.search && !filters.gpu && filters.category !== 'linh-kien';
    }
    if (chip.search) return filters.search.trim().toLowerCase() === chip.search.toLowerCase();
    if (chip.gpu) return filters.gpu === chip.gpu;
    if (chip.category) return filters.category === chip.category;
    return false;
  };

  const handleChipClick = (chip: BrandChip) => {
    if (chip.id === 'all') {
      onSearchChange('');
      onUpdate({ search: '', category: '', gpu: '', page: 1 });
      return;
    }
    if (chip.search) {
      const nextSearch = isChipActive(chip) ? '' : chip.search;
      onSearchChange(nextSearch);
      onUpdate({ search: nextSearch, page: 1 });
      return;
    }
    if (chip.gpu) {
      const nextGpu = isChipActive(chip) ? '' : chip.gpu;
      onUpdate({ gpu: nextGpu, page: 1 });
      return;
    }
    if (chip.category) {
      const nextCat = isChipActive(chip) ? '' : chip.category;
      onSearchChange('');
      onUpdate({ category: nextCat, search: '', page: 1 });
    }
  };

  return (
    <div className="gf-cat-bar" role="search" aria-label="Tìm kiếm và thẻ thương hiệu">
      {!hideCategoryTabs && (
        <div className="gf-cat-pills" role="tablist" aria-label="Phân loại chính">
          {CATEGORY_TABS.map((tab) => {
            const active = tab.aliases.includes(filters.category);
            return (
              <button
                key={tab.key || 'all'}
                type="button"
                role="tab"
                aria-selected={active}
                className={`gf-cat-pill ${active ? 'is-active' : ''}`}
                onClick={() => {
                  onSearchChange('');
                  onUpdate({ category: tab.key, search: '', cpu: '', ram: '', gpu: '', storage: '', page: 1 });
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      )}

      <div className="gf-brand-chip-row" aria-label="Thương hiệu và nhu cầu nổi bật">
        {BRAND_NEED_CHIPS.map((chip) => {
          const active = isChipActive(chip);
          return (
            <button
              key={chip.id}
              type="button"
              aria-pressed={active}
              className={`gf-mini-pill ${active ? 'is-active' : ''}`}
              onClick={() => handleChipClick(chip)}
            >
              {chip.label}
            </button>
          );
        })}
      </div>

      <div className="gf-search-count-row">
        <div className="gf-search-field-wrap">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            type="search"
            className="gf-cat-input"
            aria-label="Tìm theo tên máy, CPU, GPU, linh kiện"
            placeholder="Tìm ASUS ROG, Lenovo Legion, MacBook, RTX 4060, RAM DDR5..."
            value={searchInput}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <span className="gf-cat-count" aria-live="polite">
          Tìm thấy <strong>{totalProducts}</strong> sản phẩm
        </span>
      </div>
    </div>
  );
}
