import { useGearForgeStore } from '../../hooks/useGearForgeStore';

export function MobileBottomBar() {
  const { pageMode, cart, navigateToPage, openDrawer, setSearchOpen } = useGearForgeStore();

  return (
    <nav className="xg-mob-nav" aria-label="Thanh điều hướng nhanh Mobile">
      <button
        type="button"
        className={`xg-mob-btn ${pageMode === 'showcase' ? 'is-active' : ''}`}
        onClick={() => navigateToPage('showcase')}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M3 10.5L12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
        </svg>
        <span>Trang chủ</span>
      </button>

      <button
        type="button"
        className={`xg-mob-btn ${pageMode === 'shop' ? 'is-active' : ''}`}
        onClick={() => navigateToPage('shop')}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <rect x="3" y="4" width="18" height="12" rx="2" />
          <path d="M2 20h20" />
        </svg>
        <span>Sản phẩm</span>
      </button>

      <button
        type="button"
        className="xg-mob-btn"
        onClick={() => setSearchOpen(true)}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <span>Tìm nhanh</span>
      </button>

      <button
        type="button"
        className="xg-mob-btn"
        onClick={() => openDrawer('cart')}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="9" cy="20" r="1.5" />
          <circle cx="18" cy="20" r="1.5" />
          <path d="M2 3h3l2.6 12.4a1 1 0 0 0 1 .8h9.8a1 1 0 0 0 1-.8L21 7H6" />
        </svg>
        <span>Giỏ hàng</span>
        {cart.count > 0 && <b className="xg-mob-badge">{cart.count}</b>}
      </button>
    </nav>
  );
}
