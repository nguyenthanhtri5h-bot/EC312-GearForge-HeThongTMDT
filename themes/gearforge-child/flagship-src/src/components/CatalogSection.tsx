import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { useGearForgeStore } from '../hooks/useGearForgeStore';
import { CatalogFilterBar } from './drawers/CatalogFilterBar';
import { ShopFilterSidebar } from './drawers/ShopFilterSidebar';
import { ShopSortBar } from './drawers/ShopSortBar';
import { StorefrontProductCard } from './storefront/StorefrontProductCard';
import './drawers/drawers-extra.css';

export function CatalogSection({ hideCategoryTabs = false }: { hideCategoryTabs?: boolean }) {
  const {
    products,
    totalProducts,
    totalPages,
    catalogLoading,
    filters,
    compareIds,
    cart,
    fetchCatalog,
    openDrawer,
  } = useGearForgeStore();

  const [searchInput, setSearchInput] = useState(filters.search);
  const firstRender = useRef(true);

  useEffect(() => {
    setSearchInput(filters.search);
  }, [filters.search]);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const timer = window.setTimeout(() => {
      if (searchInput !== filters.search) {
        void fetchCatalog({ search: searchInput, page: 1 });
      }
    }, 280);
    return () => window.clearTimeout(timer);
  }, [searchInput, filters.search, fetchCatalog]);

  const handleResetAll = () => {
    setSearchInput('');
    void fetchCatalog({
      search: '',
      category: '',
      cpu: '',
      ram: '',
      gpu: '',
      storage: '',
      maxPrice: 80000000,
      sort: 'featured',
      page: 1,
    });
  };

  return (
    <section id="gf-catalog" className="tc-sec gf-cat-sec" aria-labelledby="gf-catalog-heading">
      <div className="tc-wrap">
        <div className={`gf-cat-head ${hideCategoryTabs ? 'is-compact' : ''}`}>
          <div>
            <h2 id="gf-catalog-heading" className="tc-h2">
              {hideCategoryTabs ? 'Bộ lọc & Danh sách Thiết bị' : 'Danh mục Sản phẩm & Bộ lọc Thông số'}
            </h2>
            {!hideCategoryTabs && (
              <p className="gf-cat-sub">
                Tìm đúng máy theo nhu cầu học tập, CPU, RAM, GPU, ổ cứng SSD &amp; mức ngân sách phù hợp.
              </p>
            )}
          </div>
          <div className="gf-cat-toolbar">
            <div className="gf-drawer-triggers">
              <button type="button" className="gf-pill-trigger" onClick={() => openDrawer('compare')}>
                <span>So sánh</span>
                <b>{compareIds.length}/3</b>
              </button>
              <button type="button" className="gf-pill-trigger" onClick={() => openDrawer('cart')}>
                <span>Giỏ hàng</span>
                <b>{cart.count}</b>
              </button>
            </div>
          </div>
        </div>

        <div className="gf-shop-layout">
          <ShopFilterSidebar
            filters={filters}
            onUpdate={(patch) => void fetchCatalog(patch)}
            onResetAll={handleResetAll}
          />

          <div className="gf-shop-main">
            <CatalogFilterBar
              filters={filters}
              searchInput={searchInput}
              totalProducts={totalProducts}
              hideCategoryTabs={hideCategoryTabs}
              onSearchChange={setSearchInput}
              onUpdate={(patch) => void fetchCatalog(patch)}
            />

            <ShopSortBar
              sort={filters.sort}
              onChange={(patch) => void fetchCatalog(patch)}
            />

            {catalogLoading ? (
              <div className="gf-cat-grid" aria-busy="true" aria-label="Đang tải sản phẩm">
                {Array.from({ length: 8 }).map((_, idx) => (
                  <div key={idx} className="gf-skel-card" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="gf-empty-state">
                <p>Không tìm thấy sản phẩm khớp bộ lọc hiện tại.</p>
                <button
                  type="button"
                  className="gf-mini-pill is-active"
                  onClick={handleResetAll}
                >
                  Đặt lại bộ lọc
                </button>
              </div>
            ) : (
              <div className="gf-cat-grid">
                {products.map((p, idx) => (
                  <StorefrontProductCard key={p.id} product={p} eagerImage={idx < 24} />
                ))}
                {!catalogLoading && products.length > 0 && products.length % 4 !== 0 && (
                  <a
                    href="/he-sinh-thai/"
                    className="gf-grid-helper-card"
                    style={{ '--gf-span': 4 - (products.length % 4) } as CSSProperties}
                  >
                    <span className="gf-grid-helper-badge">TƯ VẤN SINH VIÊN ĐHQG</span>
                    <strong>Chưa chắc cấu hình phù hợp ngành học?</strong>
                    <span>Mở Dự Toán Trả Góp 0% &amp; Gợi Ý Theo Ngành (CNTT, AI, Đồ họa) →</span>
                  </a>
                )}
              </div>
            )}

            {totalPages > 1 && (
              <div className="gf-pagination" role="navigation" aria-label="Phân trang sản phẩm">
                <button
                  type="button"
                  className="gf-page-btn"
                  disabled={filters.page <= 1 || catalogLoading}
                  onClick={() => void fetchCatalog({ page: Math.max(1, filters.page - 1) })}
                >
                  ← Trước
                </button>
                <span className="gf-page-status">
                  Trang <strong>{filters.page}</strong> / {totalPages}
                </span>
                <button
                  type="button"
                  className="gf-page-btn"
                  disabled={filters.page >= totalPages || catalogLoading}
                  onClick={() => void fetchCatalog({ page: Math.min(totalPages, filters.page + 1) })}
                >
                  Sau →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
