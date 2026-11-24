import { useEffect, useMemo, useState } from 'react';
import { useGearForgeStore } from '../../hooks/useGearForgeStore';
import { StorefrontProductCard } from './StorefrontProductCard';

function getRemainingToMidnight(): { d: string; h: string; m: string; s: string } {
  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  const diff = Math.max(0, Math.floor((end.getTime() - now.getTime()) / 1000));
  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  const s = diff % 60;
  return {
    d: '00',
    h: String(h).padStart(2, '0'),
    m: String(m).padStart(2, '0'),
    s: String(s).padStart(2, '0'),
  };
}

export function FlashDealsShelf() {
  const { boot, products, navigateToPage } = useGearForgeStore();
  const [clock, setClock] = useState(getRemainingToMidnight);

  useEffect(() => {
    const id = window.setInterval(() => setClock(getRemainingToMidnight()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const flashItems = useMemo(() => {
    const pool = boot.products?.length ? boot.products : products;
    const discounted = pool.filter((p) => (p.regularPrice ?? 0) > p.price || (p.salePrice && p.salePrice > 0));
    const list = discounted.length >= 4 ? discounted : pool;
    return list.slice(0, 4);
  }, [boot.products, products]);

  if (!flashItems.length) return null;

  return (
    <section className="xg-flash-sec" aria-labelledby="xg-flash-heading">
      <div className="tc-wrap">
        <div className="xg-flash-box">
          <div className="xg-flash-head">
            <div className="xg-flash-title">
              <span className="xg-promo-badge" style={{ fontSize: 12 }}>DEAL HÔM NAY</span>
              <h2 id="xg-flash-heading">ƯU ĐÃI TỰU TRƯỜNG ĐHQG-HCM</h2>
            </div>

            <div className="xg-timer" aria-label="Thời gian ưu đãi còn lại trong ngày">
              <div className="xg-timer-box"><strong>{clock.d}</strong><span>Ngày</span></div>
              <div className="xg-timer-box"><strong>{clock.h}</strong><span>Giờ</span></div>
              <div className="xg-timer-box"><strong>{clock.m}</strong><span>Phút</span></div>
              <div className="xg-timer-box"><strong>{clock.s}</strong><span>Giây</span></div>
            </div>
          </div>

          <div className="xg-shelf-grid">
            {flashItems.map((item) => (
              <StorefrontProductCard key={item.id} product={item} showFlashBar />
            ))}
          </div>

          <div className="xg-shelf-footer">
            <button
              type="button"
              className="tc-btn tc-btn-cam"
              style={{ border: 0, cursor: 'pointer' }}
              onClick={() => navigateToPage('shop', { maxPrice: 35000000, page: 1 })}
            >
              Xem tất cả Deal Sinh viên »
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
