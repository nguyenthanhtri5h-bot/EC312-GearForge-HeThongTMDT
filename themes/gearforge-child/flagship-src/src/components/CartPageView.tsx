import { useState, type FormEvent } from 'react';
import { CART_MEDIA_DATA } from '../data/subpageBandsData';
import { formatVnd, useGearForgeStore } from '../hooks/useGearForgeStore';
import { CrestIcon } from './BrandLogo';
import { RiotSubpageHero } from './RiotSubpageHero';
import { SubpageMediaBand } from './subpages/SubpageMediaBand';
import '../styles/tool-pages.css';

export function CartPageView() {
  const { boot, cart, updateCartItem, removeCartItem, applyCoupon, navigateToPage } = useGearForgeStore();
  const [couponInput, setCouponInput] = useState('');
  const [applying, setApplying] = useState(false);

  const submitCoupon = async (code: string) => {
    if (!code.trim() || applying) return;
    setApplying(true);
    try {
      const ok = await applyCoupon(code);
      if (ok) setCouponInput('');
    } finally {
      setApplying(false);
    }
  };

  const handleFormCoupon = (e: FormEvent) => {
    e.preventDefault();
    void submitCoupon(couponInput);
  };

  return (
    <main className="tc gf-tool-page" id="tc-cart">
      <RiotSubpageHero
        crumbLabel="Kho sản phẩm / Giỏ hàng sinh viên"
        crumbTarget="shop"
        kicker="GIAO HỎA TỐC KTX 2 GIỜ · HÓA ĐƠN VAT"
        title={`Giỏ Hàng GearForge (${cart.count})`}
        sub="Kiểm tra cấu hình đã chọn, áp dụng mã ưu đãi sinh viên ĐHQG và tiến hành thanh toán hoặc đăng ký trả góp 0%."
      />

      <div className="tc-wrap">

        {cart.items.length === 0 ? (
          <div style={{ padding: '44px 28px', background: '#0B0B0D', color: '#F1F0EC', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 24 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18, maxWidth: 620 }}>
              <CrestIcon size={36} />
              <div>
                <h2 style={{ margin: '0 0 8px', fontFamily: 'var(--gf-font-display)', fontSize: 22, fontWeight: 800, color: '#FFFFFF' }}>
                  Giỏ Hàng Sinh Viên Đang Trống
                </h2>
                <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.55, color: 'rgba(241,240,236,0.78)' }}>
                  Giao hỏa tốc KTX Khu A &amp; B trong 2 giờ, miễn phí stress-test 30 phút &amp; áp mã <strong style={{ color: '#FFFFFF' }}>BACKTOSCHOOL</strong> giảm thêm 5%.
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              <button type="button" className="gf-tool-btn-primary" onClick={() => navigateToPage('shop')}>
                Khám phá Kho Sản Phẩm &rarr;
              </button>
              <button type="button" className="gf-tool-link-btn" style={{ color: '#FFFFFF', borderBottomColor: '#D13639' }} onClick={() => navigateToPage('installment')}>
                Tính Trả Góp 0% (.edu.vn)
              </button>
            </div>
          </div>
        ) : (
          <div className="gf-tool-split is-cart">
            <section aria-label="Danh sách thiết bị trong giỏ">
              {cart.items.map((it) => (
                <div key={it.key} className="gf-cart-list-item">
                  <img src={it.image} alt={it.name} />
                  <div style={{ minWidth: 0 }}>
                    <a href={it.permalink} style={{ color: '#0A0A0A', fontWeight: 800, fontSize: 15, textDecoration: 'none', display: 'block' }}>
                      {it.name}
                    </a>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: '#656462' }}>
                      {formatVnd(it.price)} &times; {it.qty} = <strong style={{ color: '#0A0A0A' }}>{formatVnd(it.lineTotal)}</strong>
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <button type="button" className="gf-cart-qty-btn" aria-label={`Giảm số lượng ${it.name}`} onClick={() => void updateCartItem(it.key, it.qty - 1)}>
                      &minus;
                    </button>
                    <strong style={{ minWidth: 20, textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>{it.qty}</strong>
                    <button type="button" className="gf-cart-qty-btn" aria-label={`Tăng số lượng ${it.name}`} onClick={() => void updateCartItem(it.key, it.qty + 1)}>
                      +
                    </button>
                    <button type="button" className="gf-tool-link-btn" onClick={() => void removeCartItem(it.key)}>
                      Xóa
                    </button>
                  </div>
                </div>
              ))}

              <form onSubmit={handleFormCoupon} style={{ paddingTop: 22, display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end' }}>
                <div style={{ flex: '1 1 220px' }}>
                  <label htmlFor="gf-cart-coupon" className="gf-tool-section-label">Mã ưu đãi sinh viên ĐHQG</label>
                  <input
                    id="gf-cart-coupon"
                    type="text"
                    className="gf-tool-input"
                    placeholder="Nhập BACKTOSCHOOL (-5%)..."
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                  />
                </div>
                <button type="submit" className="gf-tool-btn-primary" disabled={applying || !couponInput.trim()}>
                  {applying ? 'Đang áp...' : 'Áp mã ưu đãi'}
                </button>
                <button type="button" className="gf-tool-link-btn" onClick={() => void submitCoupon('BACKTOSCHOOL')}>
                  Dùng nhanh BACKTOSCHOOL (-5%)
                </button>
              </form>
            </section>

            <aside className="gf-cart-dark-summary" aria-label="Tổng kết đơn hàng">
              <span className="gf-tool-kicker" style={{ margin: 0 }}>TỔNG KẾT ĐƠN HÀNG</span>
              <div className="gf-cart-dark-row">
                <span>Tạm tính</span>
                <strong>{formatVnd(cart.subtotal)}</strong>
              </div>
              {cart.discount > 0 && (
                <div className="gf-cart-dark-row">
                  <span>Giảm giá ưu đãi</span>
                  <strong style={{ color: '#34D399' }}>−{formatVnd(cart.discount)}</strong>
                </div>
              )}
              <div className="gf-cart-dark-row is-total">
                <span>Tổng thanh toán</span>
                <strong>{formatVnd(cart.total)}</strong>
              </div>
              <a href={boot.routes.checkout} className="gf-tool-btn-primary" style={{ width: '100%' }}>
                Tiến hành thanh toán &rarr;
              </a>
              <button
                type="button"
                className="gf-tool-link-btn"
                style={{ alignSelf: 'center' }}
                onClick={() => navigateToPage('installment')}
              >
                Hoặc đăng ký Trả góp 0% (.edu.vn) &rarr;
              </button>
            </aside>
          </div>
        )}
      </div>

      <SubpageMediaBand
        kicker={CART_MEDIA_DATA.kicker}
        heading={CART_MEDIA_DATA.heading}
        desc={CART_MEDIA_DATA.desc}
        videoSrc={CART_MEDIA_DATA.videoSrc}
        posterSrc={CART_MEDIA_DATA.posterSrc}
        facts={CART_MEDIA_DATA.facts}
        ctaLabel="Chọn thêm thiết bị tại Kho"
        onCta={() => navigateToPage('shop')}
      />
    </main>
  );
}
