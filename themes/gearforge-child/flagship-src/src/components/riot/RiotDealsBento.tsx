import { useMemo } from 'react';
import { VIBE_PORTFOLIO_CARDS } from '../../data/vibeMedia';
import { formatVnd, useGearForgeStore } from '../../hooks/useGearForgeStore';
import type { GearForgeProduct } from '../../types/gearforge';
import { CrestIcon } from '../BrandLogo';
import './riot-home.css';

interface NewsRowItem {
  id: string;
  tag: string;
  title: string;
  priceText?: string;
  thumb: string;
  isProductPhoto?: boolean;
  action: () => void;
}

function cleanShortName(raw?: string, fallback = 'Laptop Gaming RTX'): string {
  if (!raw) return fallback;
  const base = raw
    .split('(')[0]
    .replace(/\b[A-Z0-9]{6,}\b/g, '')
    .replace(/\s+/g, ' ')
    .replace(/[-–/|•·:\s]+$/u, '')
    .trim();
  return base.length > 44 ? `${base.slice(0, 41).trim()}...` : base;
}

function pickDistinctDeals(products: GearForgeProduct[]): GearForgeProduct[] {
  const onSale = products.filter((p) => (p.regularPrice ?? p.price) > p.price);
  const pool = onSale.length >= 3 ? onSale : products;
  if (pool.length <= 3) return pool.slice(0, 3);

  const picked: GearForgeProduct[] = [pool[0]];
  const usedCats = new Set<string>([pool[0].categorySlug]);
  for (const item of pool.slice(1)) {
    if (!usedCats.has(item.categorySlug)) {
      picked.push(item);
      usedCats.add(item.categorySlug);
      if (picked.length === 3) return picked;
    }
  }
  for (const item of pool.slice(1)) {
    if (!picked.some((p) => p.id === item.id)) {
      picked.push(item);
      if (picked.length === 3) break;
    }
  }
  return picked;
}

export function RiotDealsBento() {
  const { products, navigateToPage, setQuickViewProduct, openDrawer } = useGearForgeStore();
  const flashDeals = useMemo(() => pickDistinctDeals(products), [products]);

  const heroDeal = flashDeals[0];
  const deal2 = flashDeals[1];
  const deal3 = flashDeals[2];
  const hw = VIBE_PORTFOLIO_CARDS.hardware;

  const shortName = cleanShortName(heroDeal?.name, 'Laptop Gaming RTX');
  const heroPrice = heroDeal ? (heroDeal.salePrice && heroDeal.salePrice > 0 ? heroDeal.salePrice : heroDeal.price) : 0;
  const heroReg = heroDeal ? (heroDeal.regularPrice ?? heroPrice) : 0;
  const heroPct = heroReg > heroPrice && heroReg > 0 ? Math.max(1, Math.min(45, Math.round(((heroReg - heroPrice) / heroReg) * 100))) : 0;

  const deal2Cat = (deal2?.category || 'PC RTX').toUpperCase();
  const deal3Cat = (deal3?.category || 'LAPTOP').toUpperCase();

  const sideItems: NewsRowItem[] = [
    {
      id: 'deal-2',
      tag: `FLASH DEAL · ${deal2Cat}`,
      title: deal2 ? cleanShortName(deal2.name) : 'Custom PC Nova RTX 4070 Super',
      priceText: deal2 ? formatVnd(deal2.salePrice && deal2.salePrice > 0 ? deal2.salePrice : deal2.price) : undefined,
      thumb: deal2?.image || hw.bentoPc,
      isProductPhoto: Boolean(deal2?.image),
      action: () => (deal2 ? setQuickViewProduct(deal2) : navigateToPage('shop', { category: 'pc-workstation' })),
    },
    {
      id: 'deal-3',
      tag: `FLASH DEAL · ${deal3Cat}`,
      title: deal3 ? cleanShortName(deal3.name) : 'Ultrabook Dev Pin 14h ĐHQG',
      priceText: deal3 ? formatVnd(deal3.salePrice && deal3.salePrice > 0 ? deal3.salePrice : deal3.price) : undefined,
      thumb: deal3?.image || hw.laptopUltrabook,
      isProductPhoto: Boolean(deal3?.image),
      action: () => (deal3 ? setQuickViewProduct(deal3) : navigateToPage('shop', { category: 'laptop-ultrabook' })),
    },
    {
      id: 'sv-0',
      tag: 'TÀI CHÍNH · 0% .EDU.VN',
      title: 'Duyệt Trả Góp 0% Qua Email .edu.vn Trong 2 Giờ',
      thumb: hw.riotNewsInstallment,
      action: () => openDrawer('installment'),
    },
    {
      id: 'oms-check',
      tag: 'OMS · BẢO HÀNH S/N',
      title: 'Tra Cứu Serial Chính Hãng & Hóa Đơn VAT ĐHQG',
      thumb: hw.riotNewsOmsSerial,
      action: () => navigateToPage('tracking'),
    },
  ];

  return (
    <section id="diem-nong" className="gf-riot-sec gf-riot-deals" aria-labelledby="riot-deals-h">
      <div className="gf-riot-wrap">
        <div className="gf-riot-head">
          <h2 id="riot-deals-h" className="gf-riot-h2">Điểm Nóng &amp; Deal Tựu Trường</h2>
          <button type="button" className="gf-riot-all-btn" onClick={() => navigateToPage('shop')}>
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
              <img src={hw.bentoLead} alt={heroDeal?.name || 'Deal Tựu Trường ĐHQG GearForge'} />
              {heroPct > 0 && <span className="gf-riot-lead-badge">-{heroPct}%</span>}
            </div>
            <h3 className="gf-riot-lead-title">{`Mùa Tựu Trường ĐHQG 2026 — ${shortName}`}</h3>
            {heroPrice > 0 && (
              <div className="gf-riot-lead-price-row">
                <strong>{formatVnd(heroPrice)}</strong>
                {heroReg > heroPrice && <span>{formatVnd(heroReg)}</span>}
              </div>
            )}
            <span className="gf-riot-meta-row">
              <CrestIcon size={16} />
              <span>{heroPct > 0 ? `FLASH DEAL · -${heroPct}%` : 'ƯU ĐÃI ĐỘC QUYỀN ĐHQG'}</span>
            </span>
          </button>

          <div className="gf-riot-bento-stack">
            {sideItems.map((item) => (
              <button key={item.id} type="button" className="gf-riot-stack-card" onClick={item.action}>
                <div className="gf-riot-stack-text">
                  <h3 className="gf-riot-stack-title">{item.title}</h3>
                  {item.priceText && <span className="gf-riot-stack-price">{item.priceText}</span>}
                  <span className="gf-riot-meta-row">
                    <CrestIcon size={15} />
                    <span>{item.tag}</span>
                  </span>
                </div>
                <div className={`gf-riot-stack-thumb ${item.isProductPhoto ? 'is-product-photo' : ''}`}>
                  <img src={item.thumb} alt={item.title} referrerPolicy="no-referrer" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
