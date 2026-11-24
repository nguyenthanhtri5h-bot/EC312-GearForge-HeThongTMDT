import { useRef } from 'react';
import { VIBE_VIDEOS } from '../data/vibeAssets';
import { useGearForgeStore } from '../hooks/useGearForgeStore';
import { useHeroAnimation } from '../hooks/useHeroAnimation';
import { ArrowIcon, PlayIcon } from './ArrowIcon';

export function HeroSection() {
  const heroRef = useRef<HTMLElement>(null);
  const { openDrawer, navigateToPage, setVideoModalSrc } = useGearForgeStore();
  useHeroAnimation(heroRef);

  return (
    <section id="top" ref={heroRef} className="tc-hero tc-navy tc-vu-tru" data-hero="" aria-labelledby="tc-h1">
      <div className="gf-hero-bg" aria-hidden="true">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={VIBE_VIDEOS.posterHeroShowcase}
        >
          <source src={VIBE_VIDEOS.heroShowcase} type="video/mp4" />
        </video>
      </div>
      <div className="gf-hero-scrim" aria-hidden="true" />

      <div className="tc-wrap tc-hero-grid">
        <div className="tc-hero-chu">
          <p className="tc-pill" data-in="">
            Đặc quyền Sinh viên ĐHQG-HCM · Giao KTX 2h
          </p>
          <h1 id="tc-h1" className="tc-h1">
            <span className="tc-dan">
              <span className="tc-dan-chu">Chuẩn Cấu Hình</span>
            </span>{' '}
            Laptop, PC &amp; Gear Sinh Viên ĐHQG-HCM
          </h1>
          <p className="tc-lede" data-in="">
            Thiết bị chính hãng bảo hành minh bạch, hỗ trợ trả góp 0% duyệt nhanh qua email .edu.vn — giao hỏa tốc 2 giờ tới KTX Khu A/B.
          </p>
          <div className="tc-nut-hang" data-in="">
            <a
              className="tc-btn tc-btn-cam"
              href="/shop/"
              onClick={(e) => {
                e.preventDefault();
                navigateToPage('shop');
              }}
            >
              Khám phá Sản phẩm
            </a>
            <button
              type="button"
              className="tc-btn tc-btn-vien"
              onClick={() => openDrawer('installment')}
            >
              Ước tính Trả góp 0% <ArrowIcon />
            </button>
          </div>

          <ul className="tc-chung" aria-label="Cam kết dịch vụ GearForge" data-in="">
            <li>
              <b>100%</b>
              <span>chính hãng &amp; bảo hành điện tử VAT</span>
            </li>
            <li>
              <b>0%</b>
              <span>lãi suất trả góp kỳ hạn 3 tháng SV</span>
            </li>
          </ul>
        </div>

        <div className="tc-hero-hinh" data-san="">
          <button
            type="button"
            className="gf-hero-float-trigger"
            onClick={() => setVideoModalSrc(VIBE_VIDEOS.heroShowcase)}
            aria-label="Phóng to video Showcase Studio"
          >
            <span className="gf-hero-play-ico"><PlayIcon /></span>
            <span className="gf-hero-float-txt">
              <strong>Showcase Studio</strong>
              <small>Xem video 1080p</small>
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
