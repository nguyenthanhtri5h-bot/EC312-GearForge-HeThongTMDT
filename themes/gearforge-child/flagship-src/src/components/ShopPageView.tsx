import { useEffect, useRef } from 'react';
import { SHOP_BRANCH_CARDS, SHOP_MEDIA_DATA } from '../data/subpageBandsData';
import { useGearForgeStore } from '../hooks/useGearForgeStore';
import { CatalogSection } from './CatalogSection';
import { RiotSubpageHero } from './RiotSubpageHero';
import { SubpageCardsBand } from './subpages/SubpageCardsBand';
import { SubpageMediaBand } from './subpages/SubpageMediaBand';
import './drawers/drawers-extra.css';

const SHOP_TABS = [
  { label: 'TẤT CẢ', slug: '' },
  { label: 'LAPTOP GAMING', slug: 'laptop-gaming' },
  { label: 'ULTRABOOK & ĐỒ HỌA', slug: 'laptop-ultrabook' },
  { label: 'PC WORKSTATION', slug: 'pc-workstation' },
  { label: 'LINH KIỆN PC', slug: 'linh-kien' },
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
  if (path.includes('linh-kien')) return 'linh-kien';
  if (path.includes('phu-kien')) return 'gear';
  return '';
}

export function ShopPageView() {
  const { openDrawer, fetchCatalog, filters, products, totalPages, navigateToPage } = useGearForgeStore();
  const syncedUrlRef = useRef(false);

  useEffect(() => {
    if (syncedUrlRef.current) return;
    syncedUrlRef.current = true;
    const initCat = resolveInitialCategoryFromUrl();
    if (initCat && filters.category !== initCat) {
      void fetchCatalog({ category: initCat, page: 1, perPage: 24 });
    } else if (!initCat && (products.length !== 24 || totalPages <= 1)) {
      void fetchCatalog({ category: '', page: 1, perPage: 24 });
    }
  }, [fetchCatalog, filters.category, products.length, totalPages]);

  return (
    <main className="tc" id="tc-shop" style={{ paddingTop: 0, background: '#F1F0EC', color: '#0A0A0A' }}>
      <RiotSubpageHero
        crumbLabel="Trang chủ / Kho Sản Phẩm"
        title="Kho Cấu Hình ĐHQG"
        action={
          <button
            type="button"
            className="gf-shop-hero-cta"
            onClick={() => openDrawer('installment')}
          >
            Trả góp 0% · Duyệt .edu.vn
          </button>
        }
      >
        <div className="gf-shop-tabs">
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
                  minHeight: 44,
                  padding: '8px 0',
                  borderBottom: isOn ? '2px solid #D13639' : '2px solid transparent',
                  color: isOn ? '#FFFFFF' : '#A1A1AA',
                  fontSize: 12,
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  cursor: 'pointer',
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </RiotSubpageHero>

      <div style={{ background: '#F1F0EC', paddingBlock: 12 }}>
        <CatalogSection hideCategoryTabs />
      </div>

      <SubpageMediaBand
        kicker={SHOP_MEDIA_DATA.kicker}
        heading={SHOP_MEDIA_DATA.heading}
        desc={SHOP_MEDIA_DATA.desc}
        videoSrc={SHOP_MEDIA_DATA.videoSrc}
        posterSrc={SHOP_MEDIA_DATA.posterSrc}
        facts={SHOP_MEDIA_DATA.facts}
        ctaLabel="Chọn máy theo ngành học"
        onCta={() => navigateToPage('ecosystem')}
      />

      <SubpageCardsBand
        kicker="CHỌN NHANH THEO NHÓM NGÀNH ĐHQG"
        heading="Lọc Bộ Sưu Tập Theo Nhu Cầu Giảng Đường"
        cards={SHOP_BRANCH_CARDS.map((b) => ({
          id: b.id,
          tag: b.tag,
          title: b.title,
          img: b.img,
          onClick: () => {
            void fetchCatalog({ category: b.category, page: 1 });
            window.scrollTo({ top: 0, behavior: 'smooth' });
          },
        }))}
      />
    </main>
  );
}
