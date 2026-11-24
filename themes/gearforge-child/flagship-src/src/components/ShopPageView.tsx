import { useEffect, useRef } from 'react';
import { useGearForgeStore } from '../hooks/useGearForgeStore';
import { CatalogSection } from './CatalogSection';
import './drawers/drawers-extra.css';

const SHOP_TABS = [
  { label: 'TẤT CẢ', slug: '' },
  { label: 'LAPTOP GAMING', slug: 'laptop-gaming' },
  { label: 'ULTRABOOK & ĐỒ HỌA', slug: 'laptop-ultrabook' },
  { label: 'PC WORKSTATION', slug: 'pc-workstation' },
  { label: 'GEAR & PHỤ KIỆN', slug: 'gear' },
];

function resolveInitialCategoryFromUrl(): string {
  if (typeof window === 'undefined') return '';
  const q = new URLSearchParams(window.location.search);
  const qCat = q.get('category') || '';
  if (qCat) return qCat;
  const path = window.location.pathname.toLowerCase();
  if (path.includes('laptop-gaming')) return 'laptop-gaming';
  if (path.includes('laptop-do-hoa') || path.includes('laptop-van-phong')) return 'laptop-ultrabook';
  if (path.includes('pc-nguyen-bo') || path.includes('pc-gaming')) return 'pc-workstation';
  if (path.includes('phu-kien')) return 'gear';
  return '';
}

export function ShopPageView() {
  const { openDrawer, navigateToPage, fetchCatalog, filters } = useGearForgeStore();
  const syncedUrlRef = useRef(false);

  useEffect(() => {
    if (syncedUrlRef.current) return;
    syncedUrlRef.current = true;
    const initCat = resolveInitialCategoryFromUrl();
    if (initCat && filters.category !== initCat) {
      void fetchCatalog({ category: initCat, page: 1 });
    }
  }, [fetchCatalog, filters.category]);

  return (
    <main className="tc" id="tc-shop" style={{ paddingTop: 78, background: '#F1F0EC', color: '#0A0A0A' }}>
      <section
        className="gf-riot-topo"
        style={{
          backgroundColor: '#0A0A0A',
          color: '#FFFFFF',
          padding: '44px 0 34px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div className="tc-wrap">
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 18 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: '#A1A1AA', marginBottom: 10 }}>
                <button
                  type="button"
                  onClick={() => navigateToPage('showcase')}
                  style={{ background: 'none', border: 0, color: '#FFFFFF', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                >
                  &larr; Trang chủ
                </button>
                <span>/</span>
                <span>Kho Sản Phẩm</span>
              </div>
              <h1
                style={{
                  margin: 0,
                  fontFamily: "'Be Vietnam Pro', 'Inter', sans-serif",
                  fontSize: 'clamp(2.1rem, 3.6vw, 3.25rem)',
                  fontWeight: 900,
                  lineHeight: 1.08,
                  letterSpacing: '-0.03em',
                  color: '#FFFFFF',
                }}
              >
                Kho Cấu Hình ĐHQG
              </h1>
            </div>

            <button
              type="button"
              className="gf-riot-red-pill"
              style={{ height: 46, padding: '0 24px', fontSize: 14 }}
              onClick={() => openDrawer('installment')}
            >
              Trả góp 0% · Duyệt .edu.vn
            </button>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 22, marginTop: 28 }}>
            {SHOP_TABS.map((t) => {
              const isOn = (filters.category || '') === t.slug;
              return (
                <button
                  key={t.label}
                  type="button"
                  onClick={() => void fetchCatalog({ category: t.slug, page: 1 })}
                  style={{
                    background: 'none',
                    border: 0,
                    padding: '6px 0',
                    borderBottom: isOn ? '2px solid #EB0029' : '2px solid transparent',
                    color: isOn ? '#FFFFFF' : '#A1A1AA',
                    fontSize: 12,
                    fontWeight: 800,
                    letterSpacing: '0.1em',
                    cursor: 'pointer',
                  }}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <div style={{ background: '#F1F0EC', paddingBlock: 16 }}>
        <CatalogSection hideCategoryTabs />
      </div>
    </main>
  );
}
