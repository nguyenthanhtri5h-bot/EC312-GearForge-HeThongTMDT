import { useEffect, useState } from 'react';
import { TRACKING_MEDIA_DATA } from '../data/subpageBandsData';
import { useGearForgeStore } from '../hooks/useGearForgeStore';
import { OmsLookupPanel } from './OmsLookupPanel';
import { RiotSubpageHero } from './RiotSubpageHero';
import { SubpageMediaBand } from './subpages/SubpageMediaBand';
import '../styles/tracking-page.css';

const OMS_SLA_FACTS = [
  { key: 'Giao nội khu ĐHQG-HCM', val: 'Trong 2 giờ · KTX Khu A & Khu B' },
  { key: 'Kích hoạt bảo hành điện tử', val: 'Tự động theo Serial / Số hóa đơn VAT' },
  { key: 'Đối soát trả góp 0% .edu.vn', val: 'Kỳ hạn 3 tháng · Không giữ giấy tờ gốc' },
  { key: 'Thời gian hỗ trợ RMA', val: 'Tiếp nhận 24/7 · Trực kỹ thuật 08:00–22:00' },
  { key: 'Xuất hóa đơn điện tử', val: 'T-VAN PDF gửi ngay sau bàn giao máy' },
  { key: 'Hotline kỹ thuật ĐHQG', val: '1900 6868 07 · support@gearforge.vn' },
];

function getOrderIdFromUrl(): number {
  if (typeof window === 'undefined') return 542;
  const q = new URLSearchParams(window.location.search);
  const id = Number(q.get('order_id') || q.get('order') || 542);
  return Number.isFinite(id) && id > 0 ? id : 542;
}

export function OmsTrackingPageView() {
  const { navigateToPage } = useGearForgeStore();
  const initialOrderId = getOrderIdFromUrl();
  const [paidRedirect] = useState(() => {
    if (typeof window === 'undefined') return false;
    return new URLSearchParams(window.location.search).get('gf_paid') === '1';
  });

  useEffect(() => {
    if (!paidRedirect || typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    if (url.searchParams.has('gf_paid')) {
      url.searchParams.delete('gf_paid');
      window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
    }
  }, [paidRedirect]);

  return (
    <main className="tc oms-track-page" id="tc-tracking">
      <RiotSubpageHero
        crumbLabel="Trang chủ / Tra cứu đơn hàng & Bảo hành"
        kicker="Hệ thống OMS · Hóa đơn VAT · Bảo hành Serial"
        title={
          <>
            Tra Cứu <span style={{ whiteSpace: 'nowrap' }}>Đơn Hàng</span> &amp;{' '}
            <span style={{ whiteSpace: 'nowrap' }}>Bảo Hành</span>
          </>
        }
        sub="Nhập mã đơn hàng để theo dõi 7 bước giao hỏa tốc nội khu ĐHQG-HCM, kiểm tra đối soát thanh toán 3DS, tải hóa đơn điện tử và gửi yêu cầu bảo hành / đổi trả."
      />

      <section className="oms-track-body">
        <div className="tc-wrap">
          <div className="oms-track-panel">
            <OmsLookupPanel initialOrderId={initialOrderId} paidRedirect={paidRedirect} />
          </div>

          <section className="oms-sla-block" aria-labelledby="oms-sla-heading">
            <p className="oms-sla-kicker">TIÊU CHUẨN HẬU MÃI SINH VIÊN</p>
            <h2 id="oms-sla-heading" className="oms-sla-heading">
              Sơ lược quy chuẩn vận hành &amp; bảo hành ĐHQG-HCM
            </h2>
            <div className="oms-sla-grid">
              {OMS_SLA_FACTS.map((item) => (
                <div key={item.key} className="oms-sla-row">
                  <span>{item.key}</span>
                  <strong>{item.val}</strong>
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>

      <SubpageMediaBand
        kicker={TRACKING_MEDIA_DATA.kicker}
        heading={TRACKING_MEDIA_DATA.heading}
        desc={TRACKING_MEDIA_DATA.desc}
        videoSrc={TRACKING_MEDIA_DATA.videoSrc}
        posterSrc={TRACKING_MEDIA_DATA.posterSrc}
        verticalReel
        facts={TRACKING_MEDIA_DATA.facts}
        ctaLabel="Xem góc máy sinh viên ĐHQG"
        onCta={() => navigateToPage('gallery')}
      />
    </main>
  );
}
