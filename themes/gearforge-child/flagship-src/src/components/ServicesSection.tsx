import { SERVICE_STATIONS, STATION_ASSETS } from '../data/sectionsData';
import { useGearForgeStore } from '../hooks/useGearForgeStore';

export function ServicesSection() {
  const { navigateToPage, openDrawer } = useGearForgeStore();
  const s0 = STATION_ASSETS[0];
  const s1 = STATION_ASSETS[1];
  const s2 = STATION_ASSETS[2];
  const s3 = STATION_ASSETS[3];
  const s4 = STATION_ASSETS[4];

  const handleStationCta = (href: string, categorySlug?: string) => {
    if (categorySlug) {
      navigateToPage('shop', { category: categorySlug });
      return;
    }
    if (href === '#gf-installment') {
      openDrawer('installment');
      return;
    }
    if (href.startsWith('#')) {
      document.getElementById(href.slice(1))?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="gf-services"
      className="tc-pin dv"
      data-pin=""
      style={{ '--len': 340 } as React.CSSProperties}
      aria-labelledby="dv-h"
    >
      <div className="tc-pin-in">
        <h2 id="dv-h" className="dv-h">
          Đủ mọi cấu hình sinh viên cần cho <span className="tc-dan">đồ án, lập trình &amp; gaming</span>
        </h2>

        <div className="dv-ten" aria-hidden="true" data-dv-ten="">
          {SERVICE_STATIONS.map((st) => (
            <span key={st.id}>{st.title}</span>
          ))}
        </div>

        <div className="dv-san" aria-hidden="true" />

        <div className="dv-ray" data-dv-ray="">
          <div className="dv-tram dv-tram-0 on">
            <img className="dv-gau dv-gau-man dv-gau-man-0" src={s0.mascot} loading="lazy" alt={s0.alt} />
            <img
              className="dv-gau dv-gau-man dv-gau-man-1"
              src={s0.variants?.[0] || s0.preview}
              loading="lazy"
              alt=""
              aria-hidden="true"
              style={{ borderRadius: 16 }}
            />
            <img
              className="dv-gau dv-gau-man dv-gau-man-2"
              src={s0.variants?.[1] || s0.preview}
              loading="lazy"
              alt=""
              aria-hidden="true"
              style={{ borderRadius: 16 }}
            />
            <span className="dv-nhan dv-nhan-web" aria-hidden="true">
              Kho sẵn máy Thủ Đức
            </span>
          </div>

          <div className="dv-tram dv-tram-1">
            <img className="dv-gau" src={s1.mascot} loading="lazy" alt={s1.alt} />
            <figure className="dv-anh dv-gsc">
              <img src={s1.preview} loading="lazy" alt="PC Custom Watercool RTX" />
              <figcaption>Stress-test 24h · Đi dây giấu cáp</figcaption>
            </figure>
          </div>

          <div className="dv-tram dv-tram-2">
            <img className="dv-gau" src={s2.mascot} loading="lazy" alt={s2.alt} />
            <figure className="dv-anh dv-reel">
              <img src={s2.preview} loading="lazy" alt="Benchmark GearForge Lab" />
              <figcaption>Đo FPS &amp; nhiệt thực tế</figcaption>
            </figure>
          </div>

          <div className="dv-tram dv-tram-3">
            <img className="dv-gau" src={s3.mascot} loading="lazy" alt={s3.alt} />
            <div className="dv-canh" aria-hidden="true">
              <div className="dv-mien">
                <svg viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2.4" />
                  <path d="m20 20-4-4" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
                </svg>
                RTX 5080 · 240Hz<i>✓</i>
              </div>
            </div>
          </div>

          <div className="dv-tram dv-tram-4">
            <img className="dv-gau" src={s4.mascot} loading="lazy" alt={s4.alt} />
            <div className="dv-anh dv-zalo" style={{ width: 290, padding: 14, color: '#141018', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <strong style={{ fontSize: 12.5, color: '#09090b' }}>Zalo OA GearForge KTX</strong>
                <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 6, background: '#dcfce7', color: '#047857', fontWeight: 700 }}>TRỰC TUYẾN 8H–22H</span>
              </div>
              <div style={{ background: '#09090b', color: '#fff', fontSize: 11.5, padding: '7px 10px', borderRadius: 8, marginBottom: 6, marginLeft: 32 }}>
                Em SV UIT cần tư vấn laptop AI góp 0% ạ
              </div>
              <div style={{ background: '#f4f4f5', color: '#09090b', fontSize: 11.5, padding: '7px 10px', borderRadius: 8, marginRight: 20 }}>
                Dạ có ngay ROG/Legion RTX 4060 chỉ ~8.1tr/th 3 kỳ 0% lãi, giao KTX trong 2h!
              </div>
            </div>
          </div>
        </div>

        <div className="dv-the" data-dv-the="">
          {SERVICE_STATIONS.map((st, idx) => (
            <div key={st.id} className={`dv-the-mot ${idx === 0 ? 'on' : ''}`}>
              <div>
                <h3 className="tc-h3">{st.title}</h3>
                <p className="tc-mo">{st.desc}</p>
                {st.extraLinks && (
                  <p className="dv-them">
                    {st.extraLinks.map((lk, i) => (
                      <span key={lk.label}>
                        {i > 0 && ' · '}
                        <a href={lk.href}>{lk.label}</a>
                      </span>
                    ))}
                  </p>
                )}
              </div>
              <button
                type="button"
                className="tc-btn tc-btn-cam"
                onClick={() => handleStationCta(st.ctaHref, st.categorySlug)}
              >
                {st.ctaText}
              </button>
            </div>
          ))}
        </div>

        <ol className="dv-tien" data-dv-tien="">
          {SERVICE_STATIONS.map((st, idx) => (
            <li key={st.id} className={idx === 0 ? 'on' : ''}>
              <span>{st.title}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
