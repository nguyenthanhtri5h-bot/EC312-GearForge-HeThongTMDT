import { useState } from 'react';
import { PRODUCT_MENU_TABS, type ProductMenuTab } from '../data/productMenuData';
import { useGearForgeStore } from '../hooks/useGearForgeStore';

const TAB_TO_CATEGORY: Record<string, string> = {
  laptop: 'laptop-gaming',
  pc: 'pc-workstation',
  gear: 'gear',
};

export function ProductMegaMenu() {
  const { openDrawer, navigateToPage } = useGearForgeStore();
  const [activeTab, setActiveTab] = useState<ProductMenuTab['id']>('laptop');
  const current = PRODUCT_MENU_TABS.find((t) => t.id === activeTab) || PRODUCT_MENU_TABS[0];

  return (
    <div className="mega-menu-wrap">
      <div className="mm3-panel-box">
        <div className="mm3-nav">
          {PRODUCT_MENU_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`mm3-tab ${tab.id === activeTab ? 'on' : ''}`}
              onMouseEnter={() => setActiveTab(tab.id)}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="t">{tab.title}</span>
              <span className="d">{tab.desc}</span>
            </button>
          ))}
          <a href="tel:1900686807" className="mm3-hot">
            <span className="ic">☎</span>
            <span>
              <b>1900 6868 07</b>
              <small>Tư vấn SV ĐHQG 8h–22h</small>
            </span>
          </a>
        </div>

        <div className="mm3-stage">
          <div className="mm3-hd">
            <span className="t">{current.title}</span>
            <a
              href="/shop/"
              className="all"
              onClick={(e) => {
                e.preventDefault();
                navigateToPage('shop', { category: TAB_TO_CATEGORY[activeTab] || '' });
              }}
            >
              {current.allLabel} →
            </a>
          </div>
          <div className="mm3-rows">
            {current.items.map((item) => (
              <a
                key={item.name}
                href="/shop/"
                className="mm3-row"
                onClick={(e) => {
                  e.preventDefault();
                  navigateToPage('shop', { category: TAB_TO_CATEGORY[activeTab] || '' });
                }}
              >
                <span className={`im ${current.isBearRound ? 'round' : ''}`}>
                  <img src={item.img} alt={item.name} loading="lazy" />
                </span>
                <span>
                  <span className="n">
                    {item.name}
                    {item.domain && (
                      <span style={{ marginLeft: 6, fontSize: 11, fontWeight: 500, color: '#A1A1AA' }}>
                        {item.domain}
                      </span>
                    )}
                  </span>
                  <span className="x">{item.desc}</span>
                </span>
              </a>
            ))}
          </div>
        </div>

        <button
          type="button"
          className="mm3-bn"
          style={{ border: 0, textAlign: 'left', cursor: 'pointer' }}
          onClick={() => openDrawer('installment')}
        >
          <div>
            <div className="live">
              <i /> ĐẶC QUYỀN ĐHQG-HCM
            </div>
            <h3 className="ttl">
              Trả góp 0% <em>duyệt qua .edu.vn</em>
            </h3>
            <p className="lead">
              Chỉ cần email sinh viên <b>.edu.vn</b> &amp; thẻ SV. Kỳ hạn 3 tháng lãi suất 0%, không giữ giấy tờ.
            </p>
          </div>
          <span className="cta-bn">Tính lịch góp ngay →</span>
        </button>
      </div>
    </div>
  );
}
