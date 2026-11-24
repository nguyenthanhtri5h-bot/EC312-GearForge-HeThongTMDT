import { useEffect } from 'react';
import { formatVnd, useGearForgeStore } from '../../hooks/useGearForgeStore';

export function QuickViewModal() {
  const {
    quickViewProduct: p,
    setQuickViewProduct,
    compareIds,
    addToCart,
    toggleCompare,
    openDrawer,
  } = useGearForgeStore();

  useEffect(() => {
    if (!p) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setQuickViewProduct(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [p, setQuickViewProduct]);

  if (!p) return null;

  const monthly3m = p.monthly3m && p.monthly3m > 0 ? p.monthly3m : Math.round((p.price * 0.8) / 3);
  const inCompare = compareIds.includes(p.id);
  const specsList = [
    ['Vi xử lý (CPU)', p.specs.cpu || 'Đang cập nhật'],
    ['Bộ nhớ RAM', p.specs.ram || '16GB DDR5'],
    ['Card đồ họa (GPU)', p.specs.gpu || 'Card tích hợp'],
    ['Ổ cứng (SSD)', p.specs.storage || '512GB NVMe'],
    ['Màn hình', p.specs.screen || '15.6" FHD/OLED'],
    ['Trọng lượng', p.specs.weight || '1.7 kg'],
  ];

  return (
    <div
      className="gf-drawer-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="gf-qv-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) setQuickViewProduct(null);
      }}
    >
      <div className="gf-drawer-panel" style={{ width: 'min(720px, 100%)', borderRadius: 16, margin: 'auto', maxHeight: '90vh' }}>
        <div className="gf-drawer-head">
          <div>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: '#64748b' }}>{p.category}</span>
            <h3 id="gf-qv-title" style={{ marginTop: 2 }}>{p.name}</h3>
          </div>
          <button type="button" className="gf-drawer-close" aria-label="Đóng xem nhanh" onClick={() => setQuickViewProduct(null)}>
            &times;
          </button>
        </div>

        <div className="gf-drawer-body" style={{ display: 'grid', gap: 18 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18, alignItems: 'center' }}>
            <img
              src={p.image}
              alt={p.name}
              style={{ width: '100%', aspectRatio: '16/10', objectFit: 'cover', borderRadius: 12, border: '1px solid #e2e8f0' }}
            />
            <div style={{ display: 'grid', gap: 10 }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', fontFamily: "'Be Vietnam Pro', sans-serif", fontVariantNumeric: 'tabular-nums' }}>
                {formatVnd(p.price)}
              </div>
              <div style={{ fontSize: 13.5, color: '#047857', fontWeight: 700 }}>
                Trả góp 0% (3 tháng): chỉ từ {formatVnd(monthly3m)}/tháng
              </div>
              <div style={{ fontSize: 13, color: '#475569' }}>
                Tình trạng: <strong style={{ color: '#0f172a' }}>{p.stockStatus === 'outofstock' ? 'Tạm hết hàng' : 'Còn hàng — Giao KTX 2 giờ'}</strong>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                <button
                  type="button"
                  className="gf-act-btn is-primary"
                  style={{ flex: '1 1 140px' }}
                  disabled={p.stockStatus === 'outofstock'}
                  onClick={() => {
                    void addToCart(p.id, 1);
                    setQuickViewProduct(null);
                  }}
                >
                  Thêm vào giỏ
                </button>
                <button
                  type="button"
                  className={`gf-act-btn ${inCompare ? 'is-active' : ''}`}
                  onClick={() => void toggleCompare(p.id)}
                >
                  {inCompare ? 'Đã chọn so sánh' : '+ So sánh'}
                </button>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 10 }}>
            {specsList.map(([label, val]) => (
              <div key={label} style={{ padding: '10px 12px', borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 11.5, color: '#64748b' }}>{label}</div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a', marginTop: 3 }}>{val}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid #e2e8f0' }}>
            <button
              type="button"
              className="gf-act-btn"
              onClick={() => {
                setQuickViewProduct(null);
                openDrawer('installment', p.id);
              }}
            >
              Ước tính Trả góp 0% cho máy này →
            </button>
            <a href={p.permalink} className="gf-act-btn is-primary" style={{ textDecoration: 'none' }}>
              Xem trang chi tiết đầy đủ →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
