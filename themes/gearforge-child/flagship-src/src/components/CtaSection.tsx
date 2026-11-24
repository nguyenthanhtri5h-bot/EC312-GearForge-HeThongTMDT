import { Fragment } from 'react';
import { VIBE_BEAR_GUIDE } from '../data/vibeAssets';
import { useGearForgeStore } from '../hooks/useGearForgeStore';
import { ArrowIcon } from './ArrowIcon';

const PHONE_CHARS = ['1', '9', '0', '0', '\u00A0', '6', '8', '6', '8', '\u00A0', '0', '7'];

export function CtaSection() {
  const { openDrawer } = useGearForgeStore();

  return (
    <section id="gf-cta" className="tc-tim ct" data-mouse="" aria-labelledby="ct-h">
      <span className="tc-sao-nen" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>

      <div className="tc-we" aria-hidden="true">
        <div className="tc-we-ray" data-chay="-1.4">
          {[0, 1, 2, 3, 4, 5].map((idx) => (
            <Fragment key={idx}>
            <span>
              We are <b>GearForge</b> · Campus Hub
            </span>
              <i>✦</i>
            </Fragment>
          ))}
        </div>
      </div>

      <div className="tc-wrap ct-wrap">
        <h2 id="ct-h" className="tc-h2 ct-h">
          Sẵn sàng nâng cấp <span className="tc-dan">dàn máy</span> học tập &amp; chiến game
        </h2>
        <p className="tc-lede">
          Đội ngũ kỹ sư UIT hỗ trợ chọn cấu hình tối ưu ngân sách, áp dụng coupon BACKTOSCHOOL và duyệt trả góp 0%.
        </p>

        <div className="ct-so-wrap">
          <a className="ct-so" href="tel:1900686807" aria-label="Gọi tổng đài sinh viên 1900 6868 07">
            {PHONE_CHARS.map((ch, k) => (
              <span key={k} style={{ '--k': k } as React.CSSProperties}>
                {ch}
              </span>
            ))}
          </a>
          <img
            className="ct-gau"
            data-par="16"
            src={VIBE_BEAR_GUIDE.pcMascot}
            loading="lazy"
            alt="Cyber Bear GearForge tư vấn cấu hình sinh viên"
          />
          <span className="ct-noi" data-par="30" aria-hidden="true">
            Campus Hub ĐHQG-HCM
          </span>
        </div>

        <div className="ct-duoi">
          <button
            type="button"
            className="tc-btn tc-btn-cam"
            onClick={() => openDrawer('installment')}
          >
            Đăng ký Trả góp 0% ngay <ArrowIcon />
          </button>
          <ul className="tc-check">
            <li>Laptop &amp; PC chính hãng 100%</li>
            <li>Duyệt hồ sơ nhanh qua .edu.vn</li>
            <li>Giao KTX Khu A/B trong 2h</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
