import { VIBE_BEAR_GUIDE, VIBE_PORTFOLIO_CARDS } from '../../data/vibeAssets';
import { useGearForgeStore } from '../../hooks/useGearForgeStore';
import './xgear-shelves.css';

const hw = VIBE_PORTFOLIO_CARDS.hardware;

const QUICK_TILES = [
  { label: 'Laptop Gaming', img: hw.laptopGaming, action: { page: 'shop' as const, category: 'laptop-gaming' } },
  { label: 'Ultrabook / Đồ họa', img: hw.laptopCreator, action: { page: 'shop' as const, category: 'laptop-ultrabook' } },
  { label: 'PC Workstation', img: hw.pcWorkstation, action: { page: 'shop' as const, category: 'pc-workstation' } },
  { label: 'Màn hình OLED', img: hw.monitorOled, action: { page: 'shop' as const, search: 'OLED' } },
  { label: 'Gaming Gear', img: hw.galleryEsportsDesk, action: { page: 'shop' as const, category: 'gear' } },
  { label: 'Laptop RTX 4060', img: hw.laptopRogRgb, action: { page: 'shop' as const, gpu: 'RTX 4060' } },
  { label: 'MacBook M3 / M4', img: hw.laptopUltrabook, action: { page: 'shop' as const, search: 'MacBook' } },
  { label: 'Nâng cấp RAM/SSD', img: hw.gearAudioHub, action: { page: 'shop' as const, storage: '1TB' } },
  { label: 'Tự chọn theo ngành', img: VIBE_BEAR_GUIDE.ecosystemHub, action: { page: 'ecosystem' as const } },
];

const PROMO_CARDS = [
  {
    badge: 'ĐẶC QUYỀN ĐHQG',
    title: 'PC AI & Workstation RTX',
    desc: 'Lắp ráp gọn, tản nhiệt mát và cài sẵn môi trường Python/CAD.',
    img: hw.campusBkCad,
    onClickType: 'pc-workstation',
  },
  {
    badge: 'VOUCHER BACKTOSCHOOL',
    title: 'Laptop Gaming RTX 4060',
    desc: 'Giảm thẳng 500.000đ + hỗ trợ trả góp 0% kỳ hạn 3 tháng.',
    img: hw.laptopRogRgb,
    onClickType: 'laptop-gaming',
  },
  {
    badge: 'GIAO KTX 2 GIỜ',
    title: 'Combo Phím Cơ & Gear KTX',
    desc: 'Switch êm chuẩn phòng học tập, chuột không dây & tai nghe RGB.',
    img: hw.galleryEsportsDesk,
    onClickType: 'gear',
  },
];

export function XgearCategoryStrip() {
  const { navigateToPage, openDrawer } = useGearForgeStore();

  return (
    <section className="xg-strip-sec" aria-label="Danh mục nhanh & Khuyến mãi">
      <div className="tc-wrap">
        <div className="xg-quick-grid">
          {QUICK_TILES.map((tile) => (
            <button
              key={tile.label}
              type="button"
              className="xg-quick-tile"
              onClick={() => {
                if (tile.action.page === 'ecosystem') {
                  navigateToPage('ecosystem');
                } else {
                  navigateToPage('shop', {
                    category: tile.action.category || '',
                    search: tile.action.search || '',
                    gpu: tile.action.gpu || '',
                    storage: tile.action.storage || '',
                    page: 1,
                  });
                }
              }}
            >
              <div className="xg-quick-thumb">
                <img src={tile.img} alt={tile.label} loading="lazy" />
              </div>
              <span>{tile.label}</span>
            </button>
          ))}
        </div>

        <div className="xg-promo-row">
          {PROMO_CARDS.map((card) => (
            <button
              key={card.title}
              type="button"
              className="xg-promo-card"
              onClick={() => navigateToPage('shop', { category: card.onClickType, page: 1 })}
            >
              <div>
                <span className="xg-promo-badge">{card.badge}</span>
                <h3>{card.title}</h3>
                <p>{card.desc}</p>
              </div>
              <img className="xg-promo-img" src={card.img} alt={card.title} loading="lazy" />
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
          <button
            type="button"
            className="gf-mini-pill xg-link-pill"
            onClick={() => openDrawer('installment')}
          >
            Xem chính sách trả góp 0% sinh viên →
          </button>
        </div>
      </div>
    </section>
  );
}
