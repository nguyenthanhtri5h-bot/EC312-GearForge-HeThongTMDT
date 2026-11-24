import { useEffect, useState } from 'react';
import { SIMPLE_DROPDOWNS, TOP_NAV_ITEMS } from '../data/navigation';
import { useGearForgeStore } from '../hooks/useGearForgeStore';
import { BrandLogo } from './BrandLogo';
import { ProductMegaMenu } from './ProductMegaMenu';

export function Header() {
  const { boot, cart, compareIds, openDrawer, setSearchOpen, pageMode, navigateToPage } = useGearForgeStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hidden, setHidden] = useState(false);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string, href: string) => {
    if (id === 'showcase' || href === '/') {
      e.preventDefault();
      setMobileOpen(false);
      navigateToPage('showcase');
    } else if (id === 'catalog' || href.startsWith('/shop')) {
      e.preventDefault();
      setMobileOpen(false);
      navigateToPage('shop');
    } else if (id === 'services' || href.startsWith('/he-sinh-thai')) {
      e.preventDefault();
      setMobileOpen(false);
      navigateToPage('ecosystem');
    } else if (id === 'gallery' || href.startsWith('/cau-hinh-mau')) {
      e.preventDefault();
      setMobileOpen(false);
      navigateToPage('gallery');
    } else if (href.startsWith('#') && pageMode !== 'showcase') {
      e.preventDefault();
      setMobileOpen(false);
      navigateToPage('showcase', undefined, href);
    }
  };

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (y > 140 && y > lastY + 4) setHidden(true);
      else if (y < lastY - 4 || y <= 80) setHidden(false);
      lastY = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <header className={`header header-height small out ${hidden && !mobileOpen ? 'hd-hide' : ''}`}>
      <div className="header-ctn">
        <div className="header-left">
          <div className="header-logo">
            <BrandLogo
              subLabel="ĐHQG-HCM"
              height={42}
              onClick={(e) => {
                e.preventDefault();
                navigateToPage('showcase');
              }}
            />
          </div>
        </div>

        <div className="header-mid">
          <div className="header-mid-flex">
            <nav className="header-menu" aria-label="Menu chính">
              <div className="menu-list">
                {TOP_NAV_ITEMS.map((item) => {
                  const subItems = item.dropdownKey ? SIMPLE_DROPDOWNS[item.dropdownKey] : null;
                  const isActive =
                    (item.id === 'showcase' && pageMode === 'showcase') ||
                    (item.id === 'catalog' && pageMode === 'shop') ||
                    (item.id === 'services' && pageMode === 'ecosystem') ||
                    (item.id === 'gallery' && pageMode === 'gallery');
                  return (
                    <div key={item.id} className="menu-item">
                      <a
                        className="menu-item-link"
                        href={item.href}
                        onClick={(e) => handleNavClick(e, item.id, item.href)}
                        style={isActive ? { color: '#09090b', background: '#f4f4f5', fontWeight: 700 } : undefined}
                      >
                        <span className="txt">{item.label}</span>
                      </a>

                      {item.isProductMega && <ProductMegaMenu />}

                      {subItems && (
                        <ul className="submenu-simple">
                          {subItems.map((sub) => (
                            <li key={sub.label}>
                              <a
                                href={sub.href}
                                onClick={(e) => {
                                  if (sub.category) {
                                    e.preventDefault();
                                    navigateToPage('shop', { category: sub.category });
                                  }
                                }}
                              >
                                {sub.icon && (
                                  <img
                                    src={sub.icon}
                                    alt=""
                                    style={{ width: 22, height: 22, objectFit: 'cover', borderRadius: 6 }}
                                  />
                                )}
                                <span>{sub.label}</span>
                              </a>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            </nav>
          </div>
        </div>

        <div className="header-right">
          <button type="button" className="gf-hd-pill hide-mob" onClick={() => setSearchOpen(true)} aria-label="Tìm kiếm nhanh (Ctrl+K)" title="Tìm kiếm nhanh (Ctrl+K)">
            <span>Tìm nhanh</span>
            <span className="gf-hd-badge" style={{ background: '#f4f4f5', color: '#09090b', border: '1px solid #d4d4d8', fontSize: 10 }}>⌘K</span>
          </button>
          <button type="button" className="gf-hd-pill hide-mob" onClick={() => openDrawer('compare')} aria-label="Mở khay so sánh cấu hình">
            <span>So sánh</span>
            <span className="gf-hd-badge">{compareIds.length}</span>
          </button>
          <button type="button" className="gf-hd-pill is-primary hide-mob" onClick={() => openDrawer('installment')}>Trả góp 0%</button>
          <button type="button" className="gf-hd-pill" onClick={() => openDrawer('cart')} aria-label="Mở giỏ hàng">
            <span>Giỏ hàng</span>
            <span className="gf-hd-badge">{cart.count}</span>
          </button>
          <a href={boot.routes.myAccount} className="gf-hd-pill hide-mob">{boot.user.loggedIn ? boot.user.name || 'Tài khoản' : 'Tài khoản'}</a>
        </div>
        <button type="button" className="hd-burger" aria-label={mobileOpen ? 'Đóng menu' : 'Mở menu'} onClick={() => setMobileOpen((v) => !v)}>
          {mobileOpen ? '✕' : '☰'}
        </button>
      </div>
      </header>

      {mobileOpen && (
        <div className="mobile-drawer">
          {TOP_NAV_ITEMS.map((item) => (
            <a
              key={item.id}
              href={item.href}
              className="mobile-drawer-item"
              onClick={(e) => {
                setMobileOpen(false);
                handleNavClick(e, item.id, item.href);
              }}
            >
              <span>{item.label}</span>
            </a>
          ))}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 18 }}>
            <button
              type="button"
              className="gf-hd-pill"
              style={{ minHeight: 44, justifyContent: 'center' }}
              onClick={() => {
                setMobileOpen(false);
                setSearchOpen(true);
              }}
            >
              Tìm kiếm nhanh sản phẩm
            </button>
            <button
              type="button"
              className="gf-hd-pill"
              style={{ minHeight: 44, justifyContent: 'space-between' }}
              onClick={() => {
                setMobileOpen(false);
                openDrawer('compare');
              }}
            >
              <span>So sánh cấu hình</span>
              <span className="gf-hd-badge">{compareIds.length}/3</span>
            </button>
            <button
              type="button"
              className="gf-hd-pill is-primary"
              style={{ minHeight: 44, justifyContent: 'center' }}
              onClick={() => {
                setMobileOpen(false);
                openDrawer('installment');
              }}
            >
              Đăng ký Trả góp 0%
            </button>
            <a
              href={boot.routes.myAccount}
              className="gf-hd-pill"
              style={{ minHeight: 44, justifyContent: 'center' }}
            >
              Tài khoản
            </a>
          </div>
        </div>
      )}
    </>
  );
}
