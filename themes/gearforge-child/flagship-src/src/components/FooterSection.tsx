import {
  FOOTER_BOTTOM_COLUMNS,
  FOOTER_TOP_COLUMNS,
  GEARFORGE_ENTITIES,
} from '../data/footerData';
import { VIBE_PARTNERS } from '../data/vibeAssets';
import { useGearForgeStore } from '../hooks/useGearForgeStore';
import { BrandLogo } from './BrandLogo';

export function FooterSection() {
  const { openDrawer } = useGearForgeStore();

  return (
    <footer className="ft">
      <div className="container">
        <div className="ft-grid">
          {FOOTER_TOP_COLUMNS.map((col) => (
            <div key={col.title}>
              <div className="ft-col-title">{col.title}</div>
              <ul className="ft-links">
                {col.links.map((lk) => (
                  <li key={lk.label}>
                    <a href={lk.href}>{lk.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="ft-grid-bottom">
          {FOOTER_BOTTOM_COLUMNS.map((col) => (
            <div key={col.title}>
              <div className="ft-col-title">{col.title}</div>
              <ul className="ft-links">
                {col.links.map((lk) => (
                  <li key={lk.label}>
                    <a href={lk.href}>{lk.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <div className="ft-col-title">Liên hệ Campus Hub</div>
            <div className="ft-contact-item">
              <div>
                <span className="label">Email hỗ trợ &amp; bảo hành</span>
                <a className="val" href="mailto:support@gearforge.vn">
                  support@gearforge.vn
                </a>
              </div>
            </div>
            <div className="ft-contact-item">
              <div>
                <span className="label">Địa chỉ</span>
                <span className="val">
                  Khu phố 6, P. Linh Trung, TP. Thủ Đức (Làng Đại học ĐHQG-HCM)
                </span>
              </div>
            </div>
          </div>

          <div className="ft-hl-block">
            <div style={{ fontSize: 12, fontWeight: 800, opacity: 0.9, letterSpacing: '0.06em' }}>
              HOTLINE SINH VIÊN 8H–22H
            </div>
            <div style={{ marginTop: 8, fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }}>
              1900 6868 07
            </div>
            <p style={{ margin: '8px 0 14px', fontSize: 13.5, lineHeight: 1.5, opacity: 0.92 }}>
              Hỗ trợ trả góp 0% .edu.vn, kích hoạt bảo hành S/N &amp; giao KTX trong 2 giờ.
            </p>
            <button
              type="button"
              className="gf-hd-pill"
              onClick={() => openDrawer('installment')}
            >
              Đăng ký Trả góp 0% →
            </button>
          </div>
        </div>

        <div className="ft-if">
          <div className="ft-if-row">
            <div className="ft-if-head">
              <span>Đơn vị vận hành</span>
            </div>
            {GEARFORGE_ENTITIES.map((ent) => (
              <div key={ent.name}>
                <p className="ft-if-name">{ent.name}</p>
                <span className="ft-if-code">{ent.code}</span>
                <div className="ft-if-acc" style={{ marginTop: 4 }}>
                  {ent.account}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="ft-corp">
        <div className="container ft-corp-inner">
          <BrandLogo subLabel="ĐHQG-HCM" height={44} />

          <div className="ft-badge-partners">
            {[VIBE_PARTNERS[0], VIBE_PARTNERS[1], VIBE_PARTNERS[4], VIBE_PARTNERS[10]].map((p) => (
              <a key={p.id} href="#gf-partners" className="ft-partner-chip">
                <img src={p.src} alt={p.alt} style={{ height: 22, width: 'auto' }} loading="lazy" />
                <span className="sub">{p.name}</span>
              </a>
            ))}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }} aria-label="Phương thức thanh toán">
            {['VNPay-QR', 'MoMo 0%', 'Fundiin', 'VISA / Master', 'COD Giao KTX 2h'].map((pm) => (
              <span
                key={pm}
                style={{
                  padding: '5px 10px',
                  borderRadius: 8,
                  background: '#ffffff',
                  border: '1px solid #d8d0e8',
                  fontSize: 11.5,
                  fontWeight: 700,
                  color: '#2b2438',
                }}
              >
                {pm}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="container ft-license">
        <div className="ft-license-left">
          <p className="reserved">© 2026 GearForge Vietnam — Trung tâm Laptop, PC &amp; Gear Sinh viên ĐHQG-HCM</p>
        </div>
        <div className="ft-license-right">
          <a className="policy-link" href="/tra-cuu-don-hang/">Tra cứu đơn &amp; Bảo hành</a>
          <a className="policy-link" href="/my-account/">Tài khoản SV</a>
        </div>
      </div>
    </footer>
  );
}
