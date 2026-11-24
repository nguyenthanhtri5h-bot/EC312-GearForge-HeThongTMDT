import { useEffect, useState, type FormEvent } from 'react';
import { formatVnd, useGearForgeStore } from '../../hooks/useGearForgeStore';

const TRENDING_TAGS = [
  { label: 'RTX 4060', q: 'RTX 4060' },
  { label: 'MSI Katana', q: 'Katana' },
  { label: 'MacBook M3 / M4', q: 'MacBook' },
  { label: 'PC Workstation', q: 'PC' },
  { label: 'Bàn phím cơ', q: 'Bàn phím' },
  { label: 'SSD / RAM', q: 'RAM' },
];

export function CommandSearchModal() {
  const { searchOpen, setSearchOpen, boot, products, navigateToPage, setQuickViewProduct } = useGearForgeStore();
  const [term, setTerm] = useState('');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(!searchOpen);
      } else if (e.key === 'Escape' && searchOpen) {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [searchOpen, setSearchOpen]);

  if (!searchOpen) return null;

  const pool = products.length >= (boot.products?.length || 0) ? products : boot.products || [];
  const q = term.trim().toLowerCase();
  const matches = q
    ? pool.filter((p) => `${p.name} ${p.specs.cpu || ''} ${p.specs.gpu || ''} ${p.specs.storage || ''}`.toLowerCase().includes(q)).slice(0, 6)
    : pool.slice(0, 4);

  const submitSearch = (e: FormEvent) => {
    e.preventDefault();
    setSearchOpen(false);
    navigateToPage('shop', { search: term.trim(), page: 1 });
  };

  return (
    <div
      className="gf-drawer-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Tìm kiếm nhanh sản phẩm GearForge"
      onClick={(e) => {
        if (e.target === e.currentTarget) setSearchOpen(false);
      }}
    >
      <div className="gf-drawer-panel" style={{ width: 'min(640px, 100%)', borderRadius: 22, margin: '8vh auto auto', height: 'auto', maxHeight: '80vh' }}>
        <div className="gf-drawer-head">
          <div>
            <h3>Tìm nhanh cấu hình</h3>
            <span style={{ fontSize: 12.5, color: '#94a3b8' }}>Gõ tên máy, CPU, RTX hoặc nhấn Esc để đóng</span>
          </div>
          <button type="button" className="gf-drawer-close" aria-label="Đóng tìm kiếm" onClick={() => setSearchOpen(false)}>
            &times;
          </button>
        </div>

        <div className="gf-drawer-body" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 14, overflowX: 'hidden' }}>
          <form onSubmit={submitSearch} style={{ display: 'flex', gap: 8, minWidth: 0 }}>
            <input
              type="search"
              autoFocus
              className="gf-cat-input"
              style={{ flex: 1, minWidth: 0 }}
              placeholder="Tìm ROG, ThinkPad, RTX 4060, Bàn phím..."
              value={term}
              onChange={(e) => setTerm(e.target.value)}
            />
            <button type="submit" className="gf-act-btn is-primary" style={{ flexShrink: 0 }}>Tìm</button>
          </form>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {TRENDING_TAGS.map((t) => (
              <button
                key={t.q}
                type="button"
                className="gf-mini-pill"
                onClick={() => {
                  setSearchOpen(false);
                  navigateToPage('shop', { search: t.q, page: 1 });
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 8 }}>
            {matches.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  setSearchOpen(false);
                  setQuickViewProduct(m);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  width: '100%',
                  minWidth: 0,
                  boxSizing: 'border-box',
                  padding: '8px 10px',
                  borderRadius: 10,
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  color: '#0f172a',
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
              >
                <img src={m.image} alt="" style={{ width: 52, height: 36, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.name}</div>
                  <div style={{ fontSize: 12, color: '#475569', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{[m.specs.cpu, m.specs.ram, m.specs.gpu].filter(Boolean).join(' · ')}</div>
                </div>
                <strong style={{ color: '#2563eb', fontSize: 13.5, flexShrink: 0, whiteSpace: 'nowrap' }}>{formatVnd(m.price)}</strong>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
