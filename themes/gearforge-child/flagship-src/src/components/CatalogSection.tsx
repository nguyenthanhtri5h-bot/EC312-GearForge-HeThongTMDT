import { useEffect, useRef, useState } from 'react';
import { useGearForgeStore } from '../hooks/useGearForgeStore';
import { CatalogFilterBar } from './drawers/CatalogFilterBar';
import { StorefrontProductCard } from './storefront/StorefrontProductCard';
import './drawers/drawers-extra.css';

export function CatalogSection() {
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

  return (
    <section id="gf-catalog" className="tc-sec gf-cat-sec" aria-labelledby="gf-catalog-heading">
      <div className="tc-wrap">
        <div className="gf-cat-head">
          <div>
            <h2 id="gf-catalog-heading" className="tc-h2">
              Danh mục Sản phẩm &amp; Bộ lọc Thông số
            </h2>
            <p className="gf-cat-sub">
              Tìm đúng máy theo nhu cầu học tập, CPU, RAM, GPU, ổ cứng SSD &amp; mức ngân sách phù hợp.
            </p>
          </div>
          <div className="gf-cat-toolbar">
            <span className="gf-cat-count">Tìm thấy {totalProducts} sản phẩm</span>
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

        <CatalogFilterBar
          filters={filters}
          searchInput={searchInput}
          onSearchChange={setSearchInput}
          onUpdate={(patch) => void fetchCatalog(patch)}
        />

        {catalogLoading ? (
          <div className="gf-cat-grid" aria-busy="true" aria-label="Đang tải sản phẩm">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="gf-skel-card" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="gf-alert-box is-warn">
            Không tìm thấy sản phẩm khớp bộ lọc.{' '}
            <button
              type="button"
              className="gf-mini-pill is-active"
              style={{ marginLeft: 8 }}
              onClick={() => {
                setSearchInput('');
                void fetchCatalog({ search: '', category: '', cpu: '', ram: '', gpu: '', storage: '', maxPrice: 80000000, page: 1 });
              }}
            >
              Đặt lại bộ lọc
            </button>
          </div>
        ) : (
          <div className="gf-cat-grid">
            {products.map((p, idx) => (
              <StorefrontProductCard key={p.id} product={p} eagerImage={idx < 6} />
            ))}
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
    </section>
  );
}
