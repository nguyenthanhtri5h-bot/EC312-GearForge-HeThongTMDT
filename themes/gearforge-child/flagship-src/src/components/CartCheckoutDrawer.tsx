import { useEffect, useState, type FormEvent } from 'react';
import { formatVnd, useGearForgeStore } from '../hooks/useGearForgeStore';
import './drawers/drawers-extra.css';

export function CartCheckoutDrawer() {
  const {
    boot,
    cart,
    activeDrawer,
    closeDrawer,
    updateCartItem,
    removeCartItem,
    applyCoupon,
  } = useGearForgeStore();
  const [couponInput, setCouponInput] = useState('');
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (activeDrawer !== 'cart') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDrawer();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeDrawer, closeDrawer]);

  if (activeDrawer !== 'cart') return null;

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
    <div
      className="gf-drawer-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="gf-cart-drawer-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeDrawer();
      }}
    >
      <div className="gf-drawer-panel" style={{ width: 'min(540px, 100vw)' }}>
        <div className="gf-drawer-head">
          <div>
            <h3 id="gf-cart-drawer-title">Giỏ hàng ({cart.count})</h3>
            <span style={{ fontSize: 12.5, color: '#52525B' }}>
              Giao hỏa tốc KTX ĐHQG trong 2h · Hỗ trợ trả góp 0%
            </span>
          </div>
          <button type="button" className="gf-drawer-close" aria-label="Đóng giỏ hàng" onClick={closeDrawer}>
            &times;
          </button>
        </div>

        <div className="gf-drawer-body">
          {cart.items.length === 0 ? (
            <div className="gf-alert-box is-warn">
              Giỏ hàng đang trống. Chọn Laptop hoặc PC trong{' '}
              <a
                href="/shop/"
                style={{ color: '#D13639', fontWeight: 800, textDecoration: 'underline' }}
                onClick={closeDrawer}
              >
                Cửa hàng sản phẩm
              </a>{' '}
              để thêm vào giỏ.
            </div>
          ) : (
            <div className="gf-field-col" style={{ gap: 10 }}>
              {cart.items.map((it) => (
                <div key={it.key} className="gf-cart-row">
                  <img src={it.image} alt={it.name} />
                  <div style={{ minWidth: 0 }}>
                    <a href={it.permalink} style={{ color: '#0A0A0A', fontWeight: 800, fontSize: 14, display: 'block' }}>
                      {it.name}
                    </a>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: '#52525B' }}>
                      {formatVnd(it.price)} &times; {it.qty} = {formatVnd(it.lineTotal)}
                    </span>
                  </div>
                  <div className="gf-qty-box">
                    <button
                      type="button"
                      className="gf-qty-btn"
                      aria-label={`Giảm số lượng ${it.name}`}
                      onClick={() => void updateCartItem(it.key, it.qty - 1)}
                    >
                      −
                    </button>
                    <span style={{ minWidth: 20, textAlign: 'center', fontWeight: 800 }}>{it.qty}</span>
                    <button
                      type="button"
                      className="gf-qty-btn"
                      aria-label={`Tăng số lượng ${it.name}`}
                      onClick={() => void updateCartItem(it.key, it.qty + 1)}
                    >
                      +
                    </button>
                    <button
                      type="button"
                      className="gf-cmp-rm"
                      aria-label={`Xóa ${it.name}`}
                      onClick={() => void removeCartItem(it.key)}
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <form className="gf-field-col" style={{ gap: 8 }} onSubmit={handleFormCoupon}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              <label htmlFor="gf-coupon-code" className="gf-field-label">Mã ưu đãi Sinh viên</label>
              <button
                type="button"
                className="gf-mini-pill is-active"
                onClick={() => void submitCoupon('BACKTOSCHOOL')}
              >
                Dùng mã BACKTOSCHOOL (-5%)
              </button>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                id="gf-coupon-code"
                type="text"
                className="gf-dark-input"
                placeholder="Nhập BACKTOSCHOOL..."
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
              />
              <button
                type="submit"
                className="gf-act-btn is-primary"
                style={{ whiteSpace: 'nowrap', flexShrink: 0 }}
                disabled={applying || !couponInput.trim()}
              >
                {applying ? 'Đang áp...' : 'Áp dụng'}
              </button>
            </div>
            {cart.coupons.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {cart.coupons.map((c) => (
                  <span key={c} className="gf-spec-chip" style={{ background: '#ecfdf5', color: '#047857', borderColor: '#a7f3d0' }}>
                    Đã áp mã: {c.toUpperCase()}
                  </span>
                ))}
              </div>
            )}
          </form>

          <div className="gf-cart-totals">
            <div className="gf-cart-line">
              <span>Tạm tính</span>
              <strong style={{ fontFamily: "'JetBrains Mono', monospace" }}>{formatVnd(cart.subtotal)}</strong>
            </div>
            {cart.discount > 0 && (
              <div className="gf-cart-line" style={{ color: '#047857', fontWeight: 700 }}>
                <span>Giảm giá ưu đãi</span>
                <strong style={{ fontFamily: "'JetBrains Mono', monospace" }}>−{formatVnd(cart.discount)}</strong>
              </div>
            )}
            <div className="gf-cart-line is-grand">
              <span>Tổng thanh toán</span>
              <strong style={{ fontFamily: "'JetBrains Mono', monospace" }}>{formatVnd(cart.total)}</strong>
            </div>
          </div>
        </div>

        <div className="gf-drawer-foot" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <a href={boot.routes.cart} className="gf-act-btn" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            Mở trang giỏ hàng
          </a>
          <a href={boot.routes.checkout} className="gf-act-btn is-primary" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            Thanh toán ngay →
          </a>
        </div>
      </div>
    </div>
  );
}
