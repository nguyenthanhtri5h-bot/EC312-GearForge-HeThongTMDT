import { useEffect } from 'react';
import { SWITCHER_ARTWORK } from '../data/brandSwitcherData';
import { VIBE_PORTFOLIO_CARDS } from '../data/vibeMedia';

interface BrandSwitcherPreviewProps {
  activeArtId: string | null;
  onSelectEcosystem: () => void;
  onSelectGallery: () => void;
}

const ART_LIST = Object.values(SWITCHER_ARTWORK);
const UNIQUE_IMGS = ART_LIST.filter(
  (item, idx, arr) => arr.findIndex((x) => x.img === item.img) === idx
);

export function BrandSwitcherPreview({
  activeArtId,
  onSelectEcosystem,
  onSelectGallery,
}: BrandSwitcherPreviewProps) {
  const activeItem = activeArtId ? SWITCHER_ARTWORK[activeArtId] : null;

  useEffect(() => {
    const runPreload = () => {
      UNIQUE_IMGS.forEach((item) => {
        const preload = new Image();
        preload.decoding = 'async';
        preload.src = item.img;
      });
    };
    const w = window as Window & { requestIdleCallback?: (cb: () => void) => number };
    if (typeof w.requestIdleCallback === 'function') {
      w.requestIdleCallback(runPreload);
    } else {
      runPreload();
    }
  }, []);

  return (
    <div
      className={`gf-brand-switcher__stage${activeItem ? ' is-previewing' : ''}`}
    >
      <div className="gf-brand-switcher__default">
        <button
          type="button"
          className="gf-switcher-promo"
          onClick={onSelectEcosystem}
        >
          <div className="gf-switcher-promo-media">
            <img src={VIBE_PORTFOLIO_CARDS.hardware.swPromoEco} alt="Chọn cấu hình theo ngành học ĐHQG" />
          </div>
          <p className="gf-switcher-promo-cap">
            Chọn đúng Laptop RTX &amp; PC AI theo khoa ĐHQG-HCM, duyệt trả góp 0% trong 3 tháng chỉ cần email .edu.vn.
          </p>
        </button>

        <button
          type="button"
          className="gf-switcher-promo"
          onClick={onSelectGallery}
        >
          <div className="gf-switcher-promo-media">
            <img src={VIBE_PORTFOLIO_CARDS.hardware.swPromoGal} alt="Góc máy thực tế sinh viên ĐHQG" />
          </div>
          <p className="gf-switcher-promo-cap">
            Khám phá góc máy thực tế đã bàn giao tại UIT, Bách Khoa &amp; KHTN — test stress &amp; giao KTX trong 2 giờ.
          </p>
        </button>
      </div>

      <div className="gf-brand-switcher__hover" aria-hidden={!activeItem}>
        {UNIQUE_IMGS.map((item) => (
          <img
            key={item.id}
            src={item.img}
            alt=""
            className={`gf-brand-switcher__hover-layer${
              activeItem?.img === item.img ? ' is-active' : ''
            }`}
          />
        ))}
        {activeItem && (
          <>
            <span className="gf-brand-switcher__kicker">{activeItem.kicker}</span>
            <h3 className="gf-brand-switcher__hover-title">{activeItem.title}</h3>
            <p className="gf-brand-switcher__hover-desc">{activeItem.desc}</p>
          </>
        )}
      </div>
    </div>
  );
}
