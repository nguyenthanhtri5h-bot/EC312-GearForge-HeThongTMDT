import { useMemo, useState } from 'react';
import { useGearForgeStore } from '../../hooks/useGearForgeStore';
import type { GearForgeProduct } from '../../types/gearforge';
import { StorefrontProductCard } from '../storefront/StorefrontProductCard';

interface ShelfTab {
  key: string;
  label: string;
  match: (p: GearForgeProduct) => boolean;
}

const SHELF_TABS: ShelfTab[] = [
  {
    key: 'laptop-gaming',
    label: 'Laptop Gaming',
    match: (p) => p.categorySlug.includes('gaming') && !p.categorySlug.includes('pc'),
  },
  {
    key: 'laptop-ultrabook',
    label: 'Ultrabook & AI',
    match: (p) => ['van-phong', 'do-hoa', 'sinh-vien', 'ultrabook'].some((k) => p.categorySlug.includes(k)),
  },
  {
    key: 'pc-workstation',
    label: 'PC Workstation',
    match: (p) => p.categorySlug === 'pc' || p.categorySlug.startsWith('pc-'),
  },
  {
    key: 'gear',
    label: 'Gaming Gear',
    match: (p) => ['gear', 'ban-phim', 'chuot', 'lot-chuot', 'phu-kien'].some((k) => p.categorySlug.includes(k)),
  },
];

export function RiotFeaturedShelf() {
  const { boot, products, totalProducts, navigateToPage } = useGearForgeStore();
  const [activeTab, setActiveTab] = useState<string>('laptop-gaming');

  const pool = useMemo(() => {
    const map = new Map<number, GearForgeProduct>();
    (boot.products || []).forEach((p) => map.set(p.id, p));
    products.forEach((p) => {
      if (!map.has(p.id)) map.set(p.id, p);
    });
    return Array.from(map.values());
  }, [boot.products, products]);

  const tabDef = SHELF_TABS.find((t) => t.key === activeTab) || SHELF_TABS[0];

  const shelfProducts = useMemo(() => {
    const matched = pool.filter(tabDef.match);
    return (matched.length > 0 ? matched : pool).slice(0, 8);
  }, [pool, tabDef]);

  if (shelfProducts.length === 0) return null;

  return (
    <section id="ke-san-pham" className="gf-home-shelf" aria-labelledby="gf-home-shelf-h">
      <div className="gf-riot-wrap">
        <div className="gf-home-shelf-head">
          <div>
            <span className="gf-home-shelf-kicker">SẴN KHO ĐHQG-HCM · GIAO KTX 2 GIỜ</span>
            <h2 id="gf-home-shelf-h" className="gf-home-shelf-h2">
              Sản Phẩm Chủ Lực Trong Kho
            </h2>
          </div>

          <div className="gf-home-shelf-tabs" role="tablist" aria-label="Lọc nhanh kệ sản phẩm trang chủ">
            {SHELF_TABS.map((t) => {
              const isOn = t.key === activeTab;
              return (
                <button
                  key={t.key}
                  type="button"
                  role="tab"
                  aria-selected={isOn}
                  className={`gf-home-shelf-tab ${isOn ? 'is-active' : ''}`}
                  onClick={() => setActiveTab(t.key)}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="gf-home-shelf-grid">
          {shelfProducts.map((p) => (
            <StorefrontProductCard key={p.id} product={p} />
          ))}
        </div>

        <div className="gf-home-shelf-foot">
          <button
            type="button"
            className="gf-home-shelf-cta"
            onClick={() => navigateToPage('shop', { category: activeTab, page: 1 })}
          >
            {`Xem toàn bộ ${totalProducts || boot.totalProducts || 590} sản phẩm`}
          </button>
        </div>
      </div>
    </section>
  );
}
