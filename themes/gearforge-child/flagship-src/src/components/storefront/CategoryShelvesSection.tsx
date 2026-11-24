import { useEffect, useMemo, useState } from 'react';
import { apiFetchCatalog } from '../../hooks/apiClient';
import { useGearForgeStore } from '../../hooks/useGearForgeStore';
import type { GearForgeProduct } from '../../types/gearforge';
import { StorefrontProductCard } from './StorefrontProductCard';

interface ShelfConfig {
  id: string;
  title: string;
  category: string;
  viewAllLabel: string;
  tabs: { key: string; label: string; category?: string; search?: string }[];
}

const SHELVES: ShelfConfig[] = [
  {
    id: 'laptop-gaming',
    title: 'LAPTOP GAMING & AI',
    category: 'laptop-gaming',
    viewAllLabel: 'Xem tất cả Laptop Gaming »',
    tabs: [
      { key: 'all', label: 'Tất cả' },
      { key: 'asus', label: 'ASUS ROG / TUF', search: 'ASUS' },
      { key: 'msi', label: 'MSI', search: 'MSI' },
      { key: 'lenovo', label: 'Lenovo Legion / LOQ', search: 'Lenovo' },
      { key: 'acer', label: 'Acer Nitro', search: 'Acer' },
      { key: 'hp', label: 'HP Victus', search: 'HP' },
    ],
  },
  {
    id: 'laptop-ultrabook',
    title: 'ULTRABOOK & ĐỒ HỌA CREATOR',
    category: 'laptop-ultrabook',
    viewAllLabel: 'Xem tất cả Ultrabook & Đồ họa »',
    tabs: [
      { key: 'all', label: 'Tất cả' },
      { key: 'macbook', label: 'Apple MacBook', search: 'MacBook' },
      { key: 'asus', label: 'ASUS Zenbook / Vivobook', search: 'ASUS' },
      { key: 'dell', label: 'Dell XPS / Inspiron', search: 'Dell' },
      { key: 'lenovo', label: 'ThinkPad / IdeaPad', search: 'Lenovo' },
    ],
  },
  {
    id: 'pc-gear',
    title: 'PC WORKSTATION & GAMING GEAR',
    category: 'pc-workstation',
    viewAllLabel: 'Xem tất cả PC & Phụ kiện »',
    tabs: [
      { key: 'all', label: 'Tất cả PC', category: 'pc-workstation' },
      { key: 'rtx', label: 'PC Gaming RTX', category: 'pc-gaming' },
      { key: 'gear', label: 'Bàn phím & Chuột', category: 'gear', search: 'Bàn phím' },
      { key: 'audio', label: 'Tai nghe & Màn hình', category: 'gear', search: 'Tai nghe' },
    ],
  },
];

const CAT_SLUGS: Record<string, string[]> = {
  'laptop-gaming': ['laptop-gaming'],
  'laptop-ultrabook': ['laptop-van-phong', 'laptop-do-hoa', 'laptop-ultrabook'],
  'pc-workstation': ['pc-nguyen-bo', 'pc-gaming', 'pc-van-phong-do-hoa', 'pc-workstation'],
  'pc-gaming': ['pc-gaming'],
  gear: ['phu-kien', 'balo-de-tan-nhiet', 'ban-phim-co', 'chuot-gaming', 'ram-ssd', 'tai-nghe', 'gear'],
};

function matchesCat(p: GearForgeProduct, catKey: string): boolean {
  const targets = CAT_SLUGS[catKey] || [catKey];
  return targets.some((t) => p.categorySlug.includes(t));
}

function ShelfRow({ cfg, pool }: { cfg: ShelfConfig; pool: GearForgeProduct[] }) {
  const { boot, navigateToPage } = useGearForgeStore();
  const [tabKey, setTabKey] = useState('all');
  const [remoteItems, setRemoteItems] = useState<GearForgeProduct[] | null>(null);

  const activeTab = cfg.tabs.find((t) => t.key === tabKey) || cfg.tabs[0];
  const targetCat = activeTab.category || cfg.category;

  const localMatches = useMemo(() => {
    const byCat = pool.filter((p) => matchesCat(p, targetCat));
    const base = byCat.length ? byCat : pool;
    const q = (activeTab.search || '').toLowerCase();
    return (q ? base.filter((p) => p.name.toLowerCase().includes(q)) : base).slice(0, 4);
  }, [pool, targetCat, activeTab.search]);

  useEffect(() => {
    if (localMatches.length >= 4 || tabKey === 'all') {
      setRemoteItems(null);
      return;
    }
    let alive = true;
    void apiFetchCatalog(boot.ajaxUrl, {
      category: targetCat,
      search: activeTab.search || '',
      cpu: '',
      ram: '',
      gpu: '',
      storage: '',
      maxPrice: 80000000,
      sort: 'menu_order',
      page: 1,
      perPage: 4,
    }).then((res) => {
      if (alive && res?.items?.length) setRemoteItems(res.items.slice(0, 4));
    }).catch(() => undefined);
    return () => { alive = false; };
  }, [boot.ajaxUrl, tabKey, targetCat, activeTab.search, localMatches.length]);

  const shown = remoteItems ?? localMatches;

  return (
    <div className="xg-shelf-block" style={{ marginTop: 22 }}>
      <div className="xg-shelf-head">
        <h2 className="xg-shelf-heading">{cfg.title}</h2>
        <div className="xg-brand-tabs" role="tablist" aria-label={cfg.title}>
          {cfg.tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={tabKey === tab.key}
              className={`gf-mini-pill ${tabKey === tab.key ? 'is-active' : ''}`}
              onClick={() => setTabKey(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="xg-shelf-grid">
        {shown.map((item) => (
          <StorefrontProductCard key={item.id} product={item} compact />
        ))}
      </div>

      <div className="xg-shelf-footer">
        <button
          type="button"
          className="xg-link-pill"
          onClick={() => navigateToPage('shop', { category: targetCat, search: activeTab.search || '', page: 1 })}
        >
          {cfg.viewAllLabel}
        </button>
      </div>
    </div>
  );
}

export function CategoryShelvesSection() {
  const { boot, products, navigateToPage } = useGearForgeStore();
  const pool = boot.products?.length ? boot.products : products;

  const newArrivals = useMemo(() => pool.slice(0, 2), [pool]);
  const popularPicks = useMemo(() => pool.slice(2, 4), [pool]);

  if (!pool.length) return null;

  return (
    <section className="gf-cat-sec" style={{ paddingTop: 10, paddingBottom: 42 }} aria-label="Kệ sản phẩm theo danh mục">
      <div className="tc-wrap">
        <div className="xg-split-grid">
          <div className="xg-shelf-block">
            <div className="xg-shelf-head">
              <h2 className="xg-shelf-heading">MÁY MỚI CẬP NHẬT</h2>
              <button type="button" className="xg-link-pill" onClick={() => navigateToPage('shop', { sort: 'date', page: 1 })}>
                Xem tất cả »
              </button>
            </div>
            <div className="xg-split-cards">
              {newArrivals.map((item) => (
                <StorefrontProductCard key={item.id} product={item} compact />
              ))}
            </div>
          </div>

          <div className="xg-shelf-block">
            <div className="xg-shelf-head">
              <h2 className="xg-shelf-heading">SINH VIÊN CHỌN NHIỀU</h2>
              <button type="button" className="xg-link-pill" onClick={() => navigateToPage('shop', { page: 1 })}>
                Xem tất cả »
              </button>
            </div>
            <div className="xg-split-cards">
              {popularPicks.map((item) => (
                <StorefrontProductCard key={item.id} product={item} compact />
              ))}
            </div>
          </div>
        </div>

        {SHELVES.map((cfg) => (
          <ShelfRow key={cfg.id} cfg={cfg} pool={pool} />
        ))}
      </div>
    </section>
  );
}
