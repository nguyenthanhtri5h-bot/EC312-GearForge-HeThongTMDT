import { useGearForgeStore } from '../hooks/useGearForgeStore';
import { CrestIcon } from './BrandLogo';

const FOOTER_LINKS = [
  { label: 'KHO SẢN PHẨM', mode: 'shop' as const },
  { label: 'TRẢ GÓP 0%', drawer: 'installment' as const },
  { label: 'TRA CỨU ĐƠN OMS', mode: 'tracking' as const },
  { label: 'GÓC MÁY SV ĐHQG', mode: 'gallery' as const },
  { label: 'HỆ SINH THÁI AI', mode: 'ecosystem' as const },
  { label: 'SO SÁNH CẤU HÌNH', drawer: 'compare' as const },
  { label: 'BẢO HÀNH ĐIỆN TỬ', mode: 'tracking' as const },
  { label: 'LIÊN HỆ 1900 6868', mode: 'ecosystem' as const },
];

export function FooterSection() {
  const { navigateToPage, openDrawer } = useGearForgeStore();

  return (
    <footer className="footer gf-riot-ft" id="lien-he">
      <div className="gf-riot-ft-wrap">
        <div className="gf-riot-ft-top">
          <button
            type="button"
            className="gf-riot-ft-mark"
            aria-label="Về trang chủ GearForge"
            onClick={() => navigateToPage('showcase')}
          >
            <CrestIcon size={36} />
          </button>

          <nav className="gf-riot-ft-nav" aria-label="Điều hướng chân trang">
            {FOOTER_LINKS.map((item) => (
              <button
                key={item.label}
                type="button"
                className="gf-riot-ft-link"
                onClick={() => {
                  if (item.mode) navigateToPage(item.mode);
                  if (item.drawer) openDrawer(item.drawer);
                }}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="gf-riot-ft-socials" aria-label="Kênh cộng đồng GearForge">
            <a href="/#diem-nong" onClick={(e) => { e.preventDefault(); navigateToPage('showcase', undefined, '#diem-nong'); }} aria-label="Tin tức">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a href="/he-sinh-thai/" onClick={(e) => { e.preventDefault(); navigateToPage('ecosystem'); }} aria-label="Instagram ĐHQG">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/></svg>
            </a>
            <a href="/cau-hinh-mau/" onClick={(e) => { e.preventDefault(); navigateToPage('gallery'); }} aria-label="TikTok Setup">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.81a8.26 8.26 0 0 0 4.76 1.52V6.89a4.84 4.84 0 0 1-1-.2z"/></svg>
            </a>
            <a href="/shop/" onClick={(e) => { e.preventDefault(); navigateToPage('shop'); }} aria-label="YouTube Review">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.38.55A3.02 3.02 0 0 0 .5 6.19 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.81 3.02 3.02 0 0 0 2.12 2.14c1.88.55 9.38.55 9.38.55s7.5 0 9.38-.55a3.02 3.02 0 0 0 2.12-2.14A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.81zM9.6 15.6V8.4l6.27 3.6-6.27 3.6z"/></svg>
            </a>
          </div>
        </div>

        <div className="gf-riot-ft-bottom">
          <p className="gf-riot-ft-copy">
            KTX Khu A/B ĐHQG-HCM &nbsp;|&nbsp; &copy; năm 2026 bởi GearForge Việt Nam. Đã đăng ký bản quyền.
          </p>
          <button
            type="button"
            className="gf-riot-ft-top-btn"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            TỚI ĐẦU TRANG &#9650;
          </button>
        </div>
      </div>
    </footer>
  );
}
