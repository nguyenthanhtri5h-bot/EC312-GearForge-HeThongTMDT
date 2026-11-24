import { BRAND_LOGOS, PARTNER_CARDS } from '../data/socialData';
import { ArrowIcon } from './ArrowIcon';

export function PartnersSection() {
  return (
    <section id="gf-partners" className="tc-sec tc-trang dt" data-tien="" aria-labelledby="dt-h">
      <div className="tc-wrap">
        <h2 id="dt-h" className="tc-h2 dt-h">
          Hệ sinh thái đối tác <span className="tc-dan">chính hãng</span> từ phần cứng tới thanh toán
        </h2>

        <div className="dt-moc">
          <span className="dt-duong" aria-hidden="true">
            <i />
          </span>
          {PARTNER_CARDS.map((p, idx) => (
            <a
              key={p.name}
              className="dt-the"
              style={{ '--k': idx } as React.CSSProperties}
              href={p.href}
            >
              <span className="dt-logo">
                <img src={p.logo} alt={p.alt} loading="lazy" />
              </span>
              <b>{p.name}</b>
              <span className="dt-bac">{p.tier}</span>
              <span className="dt-mo">{p.desc}</span>
              <span className="dt-ngay">{p.date}</span>
              <span className="dt-diem" aria-hidden="true" />
            </a>
          ))}
        </div>

        <p className="dt-xac">
          Cam kết chính hãng:{' '}
          <a href="#gf-catalog">Thiết bị bảo hành toàn quốc</a> ·{' '}
          <a href="#gf-installment">Trả góp 0% Sinh viên</a> ·{' '}
          <a href="/tra-cuu-don-hang/">Tra cứu đơn hàng &amp; Bảo hành</a>
        </p>

        <div className="dt-kh" data-den="">
          <div className="dt-kh-dau">
            <h3 className="tc-h3">Thương hiệu &amp; Cổng thanh toán tích hợp</h3>
            <p>ASUS ROG, Lenovo Legion, MSI, Apple, NVIDIA, AMD, Intel, VNPay, MoMo, Fundiin &amp; ĐHQG-HCM.</p>
            <a className="tc-link" href="#gf-catalog">
              Lọc theo hãng trong kho <ArrowIcon />
            </a>
          </div>

          <ul className="dt-luoi dt-luoi-xam">
            {BRAND_LOGOS.map((src, i) => (
              <li key={`gray-${i}`}>
                <img src={src} alt="Logo đối tác phần cứng GearForge" loading="lazy" />
              </li>
            ))}
          </ul>

          <ul className="dt-luoi dt-luoi-mau" aria-hidden="true">
            {BRAND_LOGOS.map((src, i) => (
              <li key={`color-${i}`}>
                <img src={src} alt="" loading="lazy" />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
