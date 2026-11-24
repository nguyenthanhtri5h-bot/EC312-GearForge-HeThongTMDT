import { useEffect, useRef } from 'react';
import { VIBE_BEAR_GUIDE, VIBE_VIDEOS } from '../data/vibeAssets';
import { useGearForgeStore } from '../hooks/useGearForgeStore';
import { CatalogSection } from './CatalogSection';
import { ContactSection } from './ContactSection';
import { PartnersSection } from './PartnersSection';
import './drawers/drawers-extra.css';

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
  const { openDrawer, navigateToPage, fetchCatalog } = useGearForgeStore();
  const syncedUrlRef = useRef(false);

  useEffect(() => {
    if (syncedUrlRef.current) return;
    syncedUrlRef.current = true;
    const initCat = resolveInitialCategoryFromUrl();
    if (initCat) {
      void fetchCatalog({ category: initCat, page: 1 });
    }
  }, [fetchCatalog]);

  return (
    <main className="tc" id="tc-shop" style={{ paddingTop: 64, background: '#f8fafc', color: '#0f172a' }}>
      <section
        className="tc-navy tc-vu-tru"
        style={{
          position: 'relative',
          overflow: 'hidden',
          padding: '28px 0 22px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
          background: 'radial-gradient(75% 85% at 78% 35%, #1e293b 0%, #0f172a 72%)',
        }}
      >
        <video
          src={VIBE_VIDEOS.shopShowcase}
          poster={VIBE_VIDEOS.posterShopShowcase}
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: 0.24,
            pointerEvents: 'none',
          }}
        />
        <div className="tc-wrap" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 18 }}>
            <div style={{ flex: '1 1 420px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#cbd5e1', marginBottom: 8 }}>
                <button
                  type="button"
                  onClick={() => navigateToPage('showcase')}
                  style={{ background: 'none', border: 0, color: '#ffffff', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                >
                  ← Trang chủ
                </button>
                <span>/</span>
                <span style={{ color: '#cbd5e1', fontWeight: 600 }}>Cửa hàng</span>
              </div>
              <h1 style={{ margin: 0, fontFamily: "'Be Vietnam Pro', 'Inter', sans-serif", fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 800, lineHeight: 1.24, color: '#fff', letterSpacing: '-0.02em' }}>
                Laptop, PC Workstation &amp; Gaming Gear Chính Hãng
              </h1>
              <p style={{ margin: '8px 0 0', fontSize: 14.5, color: '#cbd5e1', maxWidth: 680 }}>
                So sánh tối đa 3 máy song song, ước tính trả góp 0% sinh viên và áp mã <strong style={{ color: '#ffffff' }}>BACKTOSCHOOL (-500.000đ)</strong>.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <img
                src={VIBE_BEAR_GUIDE.shopRig}
                alt="Cyber Bear Showroom GearForge"
                className="gf-shop-mascot"
                style={{ width: 96, height: 112, objectFit: 'contain', filter: 'drop-shadow(0 12px 24px rgba(15, 23, 42, 0.45))' }}
              />
              <button
                type="button"
                className="tc-btn tc-btn-cam"
                style={{ border: 0, cursor: 'pointer' }}
                onClick={() => openDrawer('installment')}
              >
                Trả góp 0% ngay →
              </button>
            </div>
          </div>
        </div>
      </section>

      <CatalogSection />
      <PartnersSection />
      <ContactSection />
    </main>
  );
}
