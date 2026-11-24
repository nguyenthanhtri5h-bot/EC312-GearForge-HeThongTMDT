import { useMemo, useState } from 'react';
import { useGearForgeStore } from '../../hooks/useGearForgeStore';
import type { GearForgeProduct } from '../../types/gearforge';
import { StorefrontProductCard } from './StorefrontProductCard';

const CATEGORY_TABS = [
  { key: 'laptop-gaming', label: 'Laptop Gaming RTX' },
  { key: 'laptop-ultrabook', label: 'Ultrabook & Đồ họa' },
  { key: 'pc-workstation', label: 'PC Workstation' },
  { key: 'gear', label: 'Gaming Gear & Màn' },
];

const CAT_SLUGS: Record<string, string[]> = {
  'laptop-gaming': ['laptop-gaming'],
  'laptop-ultrabook': ['laptop-van-phong', 'laptop-do-hoa', 'laptop-ultrabook'],
  'pc-workstation': ['pc-nguyen-bo', 'pc-gaming', 'pc-van-phong-do-hoa', 'pc-workstation'],
  gear: ['phu-kien', 'balo-de-tan-nhiet', 'ban-phim-co', 'chuot-gaming', 'ram-ssd', 'tai-nghe', 'gear'],
};

function matchesCat(p: GearForgeProduct, catKey: string): boolean {
  const targets = CAT_SLUGS[catKey] || [catKey];
  return targets.some((t) => p.categorySlug.includes(t));
}

export function CategoryShelvesSection() {
  const { boot, products, navigateToPage } = useGearForgeStore();
  const [activeTab, setActiveTab] = useState('laptop-gaming');
  const pool = boot.products?.length ? boot.products : products;

  const shown = useMemo(() => {
    const matched = pool.filter((p) => matchesCat(p, activeTab));
    return (matched.length ? matched : pool).slice(0, 4);
  }, [pool, activeTab]);

  if (!shown.length) return null;

  return (
    <section className="gf-cat-sec" style={{ paddingBlock: '64px 76px', background: '#ffffff' }} aria-labelledby="gf-showcase-shelf-title">
      <div className="tc-wrap">
        <div className="gf-riot-head">
          <h2 id="gf-showcase-shelf-title" className="gf-riot-h2">
            Cấu Hình Sẵn Kho ĐHQG-HCM
          </h2>
          <button
            type="button"
            className="gf-riot-all-btn"
            onClick={() => navigateToPage('shop', { category: activeTab, page: 1 })}
          >
            Xem toàn bộ danh mục →
          </button>
        </div>

        <div className="xg-brand-tabs" role="tablist" aria-label="Nhóm sản phẩm nổi bật" style={{ marginBottom: 22 }}>
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.key}
              className={`gf-mini-pill ${activeTab === tab.key ? 'is-active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="xg-shelf-grid">
          {shown.map((item) => (
            <StorefrontProductCard key={item.id} product={item} compact />
          ))}
        </div>
      </div>
    </section>
  );
}
