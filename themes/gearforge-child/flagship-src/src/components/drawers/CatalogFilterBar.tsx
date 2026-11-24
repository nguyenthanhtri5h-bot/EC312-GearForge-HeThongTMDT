import { useEffect, useRef, useState } from 'react';
import type { FilterParams } from '../../types/gearforge';

const CATEGORY_TABS = [
  { key: '', label: 'Tất cả', aliases: [''] },
  { key: 'laptop-gaming', label: 'Laptop Gaming', aliases: ['laptop-gaming', 'gaming'] },
  { key: 'laptop-ultrabook', label: 'Ultrabook & Đồ họa', aliases: ['laptop-ultrabook', 'ultrabook', 'laptop-van-phong', 'laptop-do-hoa', 'creator', 'dev'] },
  { key: 'pc-workstation', label: 'PC Workstation', aliases: ['pc-workstation', 'workstation', 'pc-nguyen-bo', 'pc', 'pc-gaming'] },
  { key: 'gear', label: 'Gear & Phụ kiện', aliases: ['gear', 'phu-kien', 'accessories'] },
];

const CONTEXT_SUB_TABS: Record<string, { label: string; patch: Partial<FilterParams> }[]> = {
  'laptop-gaming': [
    { label: 'RTX 4060 hiệu năng cao', patch: { gpu: 'RTX 4060' } },
    { label: 'RTX 4070+ / 50-Series', patch: { gpu: 'RTX 4070+' } },
    { label: 'ASUS ROG / TUF', patch: { search: 'ASUS' } },
    { label: 'MSI Katana / Cyborg', patch: { search: 'MSI' } },
  ],
  'laptop-ultrabook': [
    { label: 'Đồ họa chuyên sâu', patch: { category: 'laptop-do-hoa' } },
    { label: 'Văn phòng gọn nhẹ', patch: { category: 'laptop-van-phong' } },
    { label: 'MacBook Apple M3/M4', patch: { search: 'MacBook' } },
    { label: 'SSD 1TB rộng rãi', patch: { storage: '1TB' } },
  ],
  'pc-workstation': [
    { label: 'PC Gaming RTX', patch: { category: 'pc-gaming' } },
    { label: 'PC Đồ họa & AI 32GB+', patch: { ram: '32GB' } },
    { label: 'PC dưới 25 triệu', patch: { maxPrice: 25000000 } },
  ],
  gear: [
    { label: 'Bàn phím cơ', patch: { search: 'Bàn phím' } },
    { label: 'Chuột Gaming', patch: { search: 'Chuột' } },
    { label: 'Tai nghe & Hub', patch: { search: 'Tai nghe' } },
    { label: 'RAM & SSD nâng cấp', patch: { search: 'RAM' } },
    { label: 'Balo & Tản nhiệt', patch: { search: 'Balo' } },
  ],
};

const QUICK_STUDENT_TAGS: { label: string; patch: Partial<FilterParams> }[] = [
  { label: 'Code & AI RTX 4060', patch: { category: 'laptop-gaming', gpu: 'RTX 4060', search: '' } },
  { label: 'Đồ họa & Render 32GB', patch: { category: 'laptop-ultrabook', ram: '32GB', search: '' } },
  { label: 'Dưới 25 triệu', patch: { maxPrice: 25000000 } },
  { label: 'Ổ cứng 1TB+', patch: { storage: '1TB' } },
  { label: 'Phím & Chuột KTX', patch: { category: 'gear', search: 'Bàn phím' } },
];

const BUDGET_PRESETS = [
  { label: 'Tất cả mức giá', value: 80000000 },
  { label: '≤ 25 triệu', value: 25000000 },
  { label: '≤ 35 triệu', value: 35000000 },
  { label: '≤ 50 triệu', value: 50000000 },
];

interface Props {
  filters: FilterParams;
  searchInput: string;
  onSearchChange: (val: string) => void;
  onUpdate: (patch: Partial<FilterParams>) => void;
}

export function CatalogFilterBar({ filters, searchInput, onSearchChange, onUpdate }: Props) {
  const [budgetDraft, setBudgetDraft] = useState(filters.maxPrice);
  const budgetTimerRef = useRef<number | null>(null);

  useEffect(() => {
    setBudgetDraft(filters.maxPrice);
  }, [filters.maxPrice]);

  const handleBudgetDrag = (val: number) => {
    setBudgetDraft(val);
    if (budgetTimerRef.current) window.clearTimeout(budgetTimerRef.current);
    budgetTimerRef.current = window.setTimeout(() => {
      onUpdate({ maxPrice: val, page: 1 });
    }, 180);
  };

  const activeGroup = CATEGORY_TABS.find((t) => t.aliases.includes(filters.category))?.key || '';
  const subTabs = CONTEXT_SUB_TABS[activeGroup] || QUICK_STUDENT_TAGS;
  const hasFilters = Boolean(
    filters.category || filters.search || filters.cpu || filters.ram || filters.gpu || filters.storage || filters.maxPrice < 80000000
  );

  return (
    <div className="gf-cat-bar" role="search" aria-label="Bộ lọc sản phẩm GearForge">
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
              onClick={() => onUpdate({ category: tab.key, search: '', cpu: '', ram: '', gpu: '', storage: '', page: 1 })}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10, alignItems: 'center' }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#475569', marginRight: 4 }}>
          {activeGroup ? 'Chọn nhanh theo nhóm:' : 'Gợi ý theo nhu cầu SV:'}
        </span>
        {subTabs.map((st) => (
          <button
            key={st.label}
            type="button"
            className="gf-mini-pill"
            onClick={() => {
              if (st.patch.search !== undefined) onSearchChange(st.patch.search);
              onUpdate({ ...st.patch, page: 1 });
            }}
          >
            {st.label}
          </button>
        ))}
        {hasFilters && (
          <button
            type="button"
            className="gf-mini-pill"
            style={{ borderColor: '#2563eb', color: '#2563eb', background: '#eff6ff' }}
            onClick={() => {
              onSearchChange('');
              onUpdate({ search: '', category: '', cpu: '', ram: '', gpu: '', storage: '', maxPrice: 80000000, page: 1 });
            }}
          >
            ✕ Xóa lọc
          </button>
        )}
      </div>

      <div className="gf-cat-controls" style={{ marginTop: 12 }}>
        <input
          type="search"
          className="gf-cat-input"
          aria-label="Tìm theo tên máy, CPU, GPU"
          placeholder="Tìm ROG, Katana, MacBook, RTX 4060..."
          value={searchInput}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <select aria-label="Lọc theo CPU" className="gf-cat-select" value={filters.cpu} onChange={(e) => onUpdate({ cpu: e.target.value, page: 1 })}>
          <option value="">Tất cả CPU</option>
          <option value="Core Ultra">Intel Core Ultra</option>
          <option value="Core i5">Intel Core i5</option>
          <option value="Core i7/i9">Intel Core i7 / i9</option>
          <option value="Ryzen AI">AMD Ryzen AI</option>
          <option value="Apple M">Apple M3 / M4</option>
        </select>
        <select aria-label="Lọc theo RAM" className="gf-cat-select" value={filters.ram} onChange={(e) => onUpdate({ ram: e.target.value, page: 1 })}>
          <option value="">Tất cả RAM</option>
          <option value="8GB">8GB RAM</option>
          <option value="16GB">16GB RAM</option>
          <option value="24GB">24GB RAM</option>
          <option value="32GB">32GB RAM</option>
          <option value="64GB+">64GB+ RAM</option>
        </select>
        <select aria-label="Lọc theo GPU" className="gf-cat-select" value={filters.gpu} onChange={(e) => onUpdate({ gpu: e.target.value, page: 1 })}>
          <option value="">Tất cả GPU</option>
          <option value="RTX 3050/4050">RTX 3050 / 4050</option>
          <option value="RTX 4060">RTX 4060</option>
          <option value="RTX 4070+">RTX 4070+ / 50-Series</option>
          <option value="Integrated">Card tích hợp (Onboard)</option>
        </select>
        <select aria-label="Lọc theo Ổ cứng" className="gf-cat-select" value={filters.storage || ''} onChange={(e) => onUpdate({ storage: e.target.value, page: 1 })}>
          <option value="">Tất cả Ổ cứng</option>
          <option value="256GB">256GB SSD</option>
          <option value="512GB">512GB NVMe</option>
          <option value="1TB">1TB NVMe</option>
          <option value="2TB+">2TB+ NVMe</option>
        </select>
        <select aria-label="Sắp xếp sản phẩm" className="gf-cat-select" value={filters.sort} onChange={(e) => onUpdate({ sort: e.target.value, page: 1 })}>
          <option value="menu_order">Đề xuất phù hợp</option>
          <option value="price_asc">Giá thấp đến cao</option>
          <option value="price_desc">Giá cao đến thấp</option>
          <option value="newest">Mới cập nhật</option>
          <option value="popularity">Phổ biến nhất</option>
        </select>
      </div>

      <div className="gf-budget-row">
        <div className="gf-budget-slider-wrap">
          <label htmlFor="gf-max-budget" className="gf-budget-label">
            Ngân sách tối đa: <strong>{Math.round(budgetDraft / 1000000)} triệu</strong>
          </label>
          <input
            id="gf-max-budget"
            type="range"
            className="gf-budget-range"
            min={10000000}
            max={80000000}
            step={5000000}
            value={budgetDraft}
            onChange={(e) => handleBudgetDrag(Number(e.target.value))}
          />
        </div>
        <div className="gf-budget-pills">
          {BUDGET_PRESETS.map((preset) => (
            <button
              key={preset.value}
              type="button"
              className={`gf-mini-pill ${filters.maxPrice === preset.value ? 'is-active' : ''}`}
              onClick={() => onUpdate({ maxPrice: preset.value, page: 1 })}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
