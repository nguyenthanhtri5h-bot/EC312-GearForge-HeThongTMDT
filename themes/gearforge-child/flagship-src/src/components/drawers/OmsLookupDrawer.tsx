import { useEffect } from 'react';
import { useGearForgeStore } from '../../hooks/useGearForgeStore';
import { OmsLookupPanel } from '../OmsLookupPanel';

export function OmsLookupDrawer() {
  const { activeDrawer, closeDrawer } = useGearForgeStore();
  const isOpen = activeDrawer === 'oms';

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDrawer();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, closeDrawer]);

  if (!isOpen) return null;

  return (
    <div
      className="gf-drawer-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="gf-oms-drawer-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeDrawer();
      }}
    >
      <div className="gf-drawer-panel">
        <div className="gf-drawer-head">
          <div>
            <h3 id="gf-oms-drawer-title">Tra Cứu Đơn Hàng &amp; Bảo Hành S/N</h3>
            <span style={{ fontSize: 12.5, color: '#64748b' }}>
              Theo dõi 7 bước giao KTX 2h &amp; hóa đơn điện tử VAT
            </span>
          </div>
          <button
            type="button"
            className="gf-drawer-close"
            aria-label="Đóng tra cứu đơn hàng"
            onClick={closeDrawer}
          >
            &times;
          </button>
        </div>

        <div className="gf-drawer-body">
          <OmsLookupPanel />
        </div>

        <div className="gf-drawer-foot" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 12.5, color: '#475569' }}>Hotline kỹ thuật: <strong>1900 6868 07</strong></span>
          <a href="/tra-cuu-don-hang/" className="gf-act-btn is-primary" style={{ textDecoration: 'none' }}>
            Mở trang tra cứu đầy đủ →
          </a>
        </div>
      </div>
    </div>
  );
}
