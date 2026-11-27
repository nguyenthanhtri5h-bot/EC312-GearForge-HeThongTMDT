import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { SIMPLE_DROPDOWNS, TOP_NAV_ITEMS } from '../data/navigation';
import { useGearForgeStore } from '../hooks/useGearForgeStore';
import { BrandLogo } from './BrandLogo';
import { ProductMegaMenu } from './ProductMegaMenu';
import { RiotBrandSwitcher } from './RiotBrandSwitcher';

export function Header() {
  const { boot, cart, openDrawer, setSearchOpen, pageMode, navigateToPage } = useGearForgeStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const closeTimerRef = useRef<number | null>(null);

  const openMenu = (id: string) => {
    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    setOpenMenuId(id);
  };

  const scheduleCloseMenu = () => {
    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = window.setTimeout(() => setOpenMenuId(null), 80);
  };

  const closeMenuNow = () => {
    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    setOpenMenuId(null);
    (document.activeElement as HTMLElement | null)?.blur?.();
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string, href: string) => {
    closeMenuNow();
    if (id === 'catalog') { e.preventDefault(); navigateToPage('shop'); return; }
    if (id === 'services') { e.preventDefault(); navigateToPage('ecosystem'); return; }
    if (id === 'gallery') { e.preventDefault(); navigateToPage('gallery'); return; }
    if (id === 'oms') { e.preventDefault(); navigateToPage('tracking'); return; }
    if (href.startsWith('#')) { e.preventDefault(); navigateToPage('showcase', undefined, href); }
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 36);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setOpenMenuId(null); }, [pageMode]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpenMenuId(null); };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    };
  }, []);

  const isTransparent = !scrolled && !mobileOpen;

  return (
    <>
      <header className={`header gf-riot-header${isTransparent ? ' is-transparent' : ' is-solid'}`}>
        <div className="container-fluid gf-riot-header-in">
          <div className="gf-hd-left">
            <BrandLogo
              height={30}
              tone="light"
              stacked={false}
              onClick={(e) => {
                e.preventDefault();
                setSwitcherOpen(false);
                navigateToPage('showcase');
              }}
            />
            <button
              type="button"
              className={`gf-brand-caret-btn${switcherOpen ? ' is-open' : ''}`}
              aria-expanded={switcherOpen}
              aria-label="Mở menu hệ sinh thái GearForge"
              title="Mở menu hệ sinh thái"
              onClick={() => setSwitcherOpen((v) => !v)}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M2.5 4.25L6 7.75L9.5 4.25" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          <nav className="menu gf-riot-nav" aria-label="Điều hướng chính">
            <ul className="menu-list gf-riot-nav-list">
              {TOP_NAV_ITEMS.map((item) => {
                const subItems = item.dropdownKey ? SIMPLE_DROPDOWNS[item.dropdownKey] : null;
                const hasDropdown = Boolean(item.isProductMega || subItems);
                const isActive =
                  (item.id === 'catalog' && pageMode === 'shop') ||
                  (item.id === 'services' && pageMode === 'ecosystem') ||
                  (item.id === 'gallery' && pageMode === 'gallery') ||
                  (item.id === 'oms' && pageMode === 'tracking');
                const isMenuOpen = hasDropdown && openMenuId === item.id;
                return (
                  <li
                    key={item.id}
                    className={`menu-item${hasDropdown ? ' has-dropdown' : ''}${isMenuOpen ? ' is-open' : ''}`}
                    onMouseEnter={hasDropdown ? () => openMenu(item.id) : undefined}
                    onMouseLeave={hasDropdown ? scheduleCloseMenu : undefined}
                    onBlur={hasDropdown ? (e) => {
                      if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpenMenuId(null);
                    } : undefined}
                  >
                    <a
                      href={item.href}
                      className={`nav-item${isActive ? ' is-active' : ''}`}
                      onClick={(e) => handleNavClick(e, item.id, item.href)}
                    >
                      <span>{item.label}</span>
                      {hasDropdown && <span className="gf-nav-caret" aria-hidden="true">&#9662;</span>}
                    </a>
                    {item.isProductMega && <ProductMegaMenu onSelect={closeMenuNow} />}
                    {subItems && (
                      <div className="dropdown">
                        <div className="dropdown-content">
                          {subItems.map((sub) => (
                            <a
                              key={sub.label}
                              href={sub.href}
                              className="dropdown-item"
                              onClick={(e) => {
                                closeMenuNow();
                                if (sub.drawer) {
                                  e.preventDefault();
                                  openDrawer(sub.drawer);
                                } else if (sub.href === '/he-sinh-thai/') {
                                  e.preventDefault();
                                  navigateToPage('ecosystem');
                                } else if (sub.href === '/cau-hinh-mau/') {
                                  e.preventDefault();
                                  navigateToPage('gallery');
                                } else if (sub.href === '/tra-cuu-don-hang/') {
                                  e.preventDefault();
                                  navigateToPage('tracking');
                                }
                              }}
                            >
                              {sub.label}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="gf-hd-right">
            <button type="button" className="gf-riot-icon-btn hide-mob" onClick={() => navigateToPage('tracking')} aria-label="Tra cứu đơn hàng và bảo hành ĐHQG" title="Tra cứu OMS ĐHQG-HCM">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><circle cx="12" cy="12" r="9.5" /><path d="M2.5 12h19M12 2.5a14.5 14.5 0 0 1 0 19M12 2.5a14.5 14.5 0 0 0 0 19" /></svg>
            </button>

            <button type="button" className="gf-riot-search-pill hide-mob" onClick={() => setSearchOpen(true)} aria-label="Tìm kiếm cấu hình và linh kiện">
              <span>TÌM KIẾM</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
            </button>

            <button type="button" className="gf-riot-cart-btn" onClick={() => openDrawer('cart')} aria-label="Mở giỏ hàng">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1"><circle cx="9" cy="20" r="1.5" /><circle cx="18" cy="20" r="1.5" /><path d="M2 3h3l2.4 12.2a2 2 0 0 0 2 1.6h8.8a2 2 0 0 0 2-1.6L22 7H6" /></svg>
              {cart.count > 0 && <span className="gf-hd-badge">{cart.count}</span>}
            </button>

            <button type="button" className="gf-riot-cta-pill hide-mob" onClick={() => openDrawer('installment')}>TRẢ GÓP 0%</button>

            <button type="button" className="menu-toggle" aria-label="Mở thực đơn di động" onClick={() => setMobileOpen((v) => !v)}>
              {mobileOpen ? '\u2715' : '\u2630'}
            </button>
          </div>
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
          <div className="gf-mob-actions">
            <button type="button" className="gf-hd-pill" onClick={() => { setMobileOpen(false); setSearchOpen(true); }}>
              Tìm kiếm nhanh sản phẩm
            </button>
            <button type="button" className="gf-hd-pill" onClick={() => { setMobileOpen(false); openDrawer('compare'); }}>
              So sánh cấu hình (3 máy)
            </button>
            <button type="button" className="gf-riot-cta-pill" onClick={() => { setMobileOpen(false); openDrawer('installment'); }}>
              TRẢ GÓP 0% SINH VIÊN
            </button>
            <a href={boot.routes.myAccount} className="gf-hd-pill">
              Tài khoản sinh viên
            </a>
          </div>
        </div>
      )}

      <RiotBrandSwitcher open={switcherOpen} onClose={() => setSwitcherOpen(false)} />
    </>
  );
}
