import { useMemo } from 'react';
import { VIBE_PORTFOLIO_CARDS } from '../../data/vibeMedia';
import { formatVnd, useGearForgeStore } from '../../hooks/useGearForgeStore';
import { CrestIcon } from '../BrandLogo';
import './riot-home.css';

interface NewsRowItem {
  id: string;
  tag: string;
  title: string;
  thumb: string;
  action: () => void;
}

export function RiotDealsBento() {
  const { products, navigateToPage, setQuickViewProduct, openDrawer } = useGearForgeStore();

  const flashDeals = useMemo(() => {
    const onSale = products.filter((p) => (p.regularPrice ?? p.price) > p.price);
    return (onSale.length >= 2 ? onSale : products).slice(0, 3);
  }, [products]);

  const heroDeal = flashDeals[0];
  const hw = VIBE_PORTFOLIO_CARDS.hardware;

  const cleanShortName = (raw?: string, fallback = 'Lenovo IdeaPad Slim 3') => {
    if (!raw) return fallback;
    const base = raw.split('(')[0].replace(/\b[A-Z0-9]{6,}\b/g, '').replace(/\s+/g, ' ').trim();
    return base.length > 42 ? `${base.slice(0, 39)}...` : base;
  };
  const shortName = cleanShortName(heroDeal?.name, 'Lenovo IdeaPad Slim 3 RTX');

  const deal2Cat = (flashDeals[1]?.category || 'PC RTX').toUpperCase();
  const deal3Cat = (flashDeals[2]?.category || 'ĐHQG').toUpperCase();
  const isDeal2Pc = (flashDeals[1]?.category || '').toLowerCase().includes('pc') || (flashDeals[1]?.name || '').toLowerCase().includes('pc');
  const isDeal3Pc = (flashDeals[2]?.category || '').toLowerCase().includes('pc') || (flashDeals[2]?.name || '').toLowerCase().includes('pc');

  const sideItems: NewsRowItem[] = [
    {
      id: 'deal-2',
      tag: `TIN TỨC · ${deal2Cat}`,
      title: flashDeals[1]
        ? `${cleanShortName(flashDeals[1].name)} · ${formatVnd(flashDeals[1].price)}`
        : 'Custom PC Nova RTX 4070 Super AI Build',
      thumb: isDeal2Pc ? hw.bentoPc : hw.bentoLaptop,
      action: () =>
        flashDeals[1]
          ? setQuickViewProduct(flashDeals[1])
          : navigateToPage('shop', { category: 'pc-workstation' }),
    },
    {
      id: 'deal-3',
      tag: `TIN TỨC · ${deal3Cat}`,
      title: flashDeals[2]
        ? `${cleanShortName(flashDeals[2].name)} · ${formatVnd(flashDeals[2].price)}`
        : 'Ultrabook Dev Pin 14h Cho Sinh Viên IT',
      thumb: isDeal3Pc ? hw.bentoPc : hw.bentoLaptop,
      action: () =>
        flashDeals[2]
          ? setQuickViewProduct(flashDeals[2])
          : navigateToPage('shop', { category: 'laptop-ultrabook' }),
    },
    {
      id: 'sv-0',
      tag: 'TIN TỨC · TÀI CHÍNH',
      title: 'Duyệt Trả Góp 0% Qua Email .edu.vn Trong 2 Giờ',
      thumb: hw.riotNewsInstallment,
      action: () => openDrawer('installment'),
    },
    {
      id: 'oms-check',
      tag: 'TIN TỨC · BẢO HÀNH',
      title: 'Tra Cứu Serial Chính Hãng & Hóa Đơn VAT ĐHQG',
      thumb: hw.riotNewsOmsSerial,
      action: () => navigateToPage('tracking'),
    },
  ];

  return (
    <section id="diem-nong" className="gf-riot-sec gf-riot-deals" aria-labelledby="riot-deals-h">
      <div className="gf-riot-wrap">
        <div className="gf-riot-head">
          <h2 id="riot-deals-h" className="gf-riot-h2">
            Điểm Nóng &amp; Deal Tựu Trường
          </h2>
          <button
            type="button"
            className="gf-riot-all-btn"
            onClick={() => navigateToPage('shop')}
          >
            XEM TẤT CẢ
          </button>
        </div>

        <div className="gf-riot-bento">
          <button
            type="button"
            className="gf-riot-bento-lead"
            onClick={() => (heroDeal ? setQuickViewProduct(heroDeal) : navigateToPage('shop'))}
          >
            <div className="gf-riot-bento-lead-media">
              <img
                src={hw.bentoLead}
                alt={heroDeal?.name || 'Cộng đồng sinh viên ĐHQG trải nghiệm máy GearForge'}
              />
            </div>
            <h3 className="gf-riot-lead-title">
              {`Mùa Tựu Trường ĐHQG 2026 | ${shortName}`}
            </h3>
            <span className="gf-riot-meta-row">
              <CrestIcon size={16} />
              <span>TIN TỨC</span>
            </span>
          </button>

          <div className="gf-riot-bento-stack">
            {sideItems.map((item) => (
              <button key={item.id} type="button" className="gf-riot-stack-card" onClick={item.action}>
                <div className="gf-riot-stack-text">
                  <h3 className="gf-riot-stack-title">{item.title}</h3>
                  <span className="gf-riot-meta-row">
                    <CrestIcon size={15} />
                    <span>{item.tag}</span>
                  </span>
                </div>
                <div className="gf-riot-stack-thumb">
                  <img src={item.thumb} alt={item.title} />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
