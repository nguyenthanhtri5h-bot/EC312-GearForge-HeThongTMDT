import { useEffect, useState, type FormEvent } from 'react';
import { formatVnd, useGearForgeStore } from '../../hooks/useGearForgeStore';

const IMG_BASE = '/wp-content/themes/gearforge-child/assets/flagship/vibe/hardware';

function resolveSearchFallback(slug?: string): string {
  const s = (slug || '').toLowerCase();
  if (s.includes('gaming') && !s.includes('pc')) return `${IMG_BASE}/laptop-gaming.jpg`;
  if (s.includes('pc') || s.includes('workstation')) return `${IMG_BASE}/pc-workstation.jpg`;
  if (s.includes('gear') || s.includes('chuot') || s.includes('ban-phim')) return `${IMG_BASE}/gear-peripherals.jpg`;
  return `${IMG_BASE}/laptop-ultrabook.jpg`;
}

function sanitizeSpecSummary(specs: { cpu?: string; ram?: string; gpu?: string }): string {
  const clean = [specs.cpu, specs.ram, specs.gpu]
    .filter(Boolean)
    .map((s) => String(s).replace(/\s*\([^)]*\)/g, '').replace(/\s*\([^)]*$/g, '').trim())
    .filter(Boolean)
    .join(' · ');
  return clean.length > 68 ? `${clean.slice(0, 65)}...` : clean;
}

function SearchThumb({ src, alt, categorySlug }: { src: string; alt: string; categorySlug?: string }) {
  const [imgSrc, setImgSrc] = useState(src || resolveSearchFallback(categorySlug));
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setImgSrc(src || resolveSearchFallback(categorySlug));
    setLoaded(false);
  }, [src, categorySlug]);

  const onErr = () => {
    const fb = resolveSearchFallback(categorySlug);
    if (imgSrc !== fb) {
      setImgSrc(fb);
    } else {
      setLoaded(true);
    }
  };

  return (
    <img
      src={imgSrc}
      alt={alt}
      referrerPolicy="no-referrer"
      loading="eager"
      onLoad={(e) => {
        if (e.currentTarget.naturalWidth <= 10) {
          onErr();
        } else {
          setLoaded(true);
        }
      }}
      onError={onErr}
      style={{
        width: 56,
        height: 38,
        objectFit: 'contain',
        background: loaded ? '#FFFFFF' : '#F5F4F0',
        border: '1px solid #DFDEDC',
        borderRadius: 6,
        flexShrink: 0,
      }}
    />
  );
}

const TRENDING_TAGS = [
  { label: 'RTX 4060', q: 'RTX 4060' },
  { label: 'MSI Katana', q: 'Katana' },
  { label: 'MacBook M3 / M4', q: 'MacBook' },
  { label: 'PC Workstation', q: 'PC' },
  { label: 'Bàn phím cơ', q: 'Bàn phím' },
  { label: 'SSD / RAM', q: 'RAM' },
];

export function CommandSearchModal() {
  const { searchOpen, setSearchOpen, setChatOpen, boot, products, navigateToPage, setQuickViewProduct } = useGearForgeStore();
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
      <div className="gf-drawer-panel" style={{ width: 'min(640px, calc(100vw - 24px))', borderRadius: 12, margin: '8vh auto auto', height: 'auto', maxHeight: '80vh' }}>
        <div className="gf-drawer-head">
          <div>
            <h3>Tìm nhanh cấu hình</h3>
            <span style={{ fontSize: 12.5, color: '#52525B' }}>Gõ tên máy, CPU, RTX hoặc nhấn Esc để đóng</span>
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
              className="gf-dark-input"
              style={{ flex: 1, minWidth: 0, minHeight: 44 }}
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
            {matches.length === 0 ? (
              <div style={{ padding: 20, borderRadius: 8, background: '#F5F4F0', border: '1px solid #DFDEDC', textAlign: 'center', fontSize: 13.5, color: '#52525B' }}>
                Không tìm thấy máy khớp &ldquo;{q}&rdquo;.{' '}
                <button
                  type="button"
                  onClick={() => {
                    setSearchOpen(false);
                    navigateToPage('shop', { search: q.trim(), page: 1 });
                  }}
                  style={{ background: 'none', border: 0, color: '#D13639', fontWeight: 700, textDecoration: 'underline', cursor: 'pointer', marginRight: 12 }}
                >
                  Tìm toàn bộ trong Kho sản phẩm →
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSearchOpen(false);
                    setChatOpen(true);
                  }}
                  style={{ background: '#0A0A0A', color: '#FFFFFF', border: 0, borderRadius: 999, padding: '6px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                >
                  Hỏi GearForge AI tư vấn
                </button>
              </div>
            ) : matches.map((m) => (
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
                  borderRadius: 8,
                  background: '#FFFFFF',
                  border: '1px solid #DFDEDC',
                  color: '#0A0A0A',
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
              >
                <SearchThumb src={m.image} alt={m.name} categorySlug={m.categorySlug} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0A0A0A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.name}</div>
                  <div style={{ fontSize: 12, color: '#52525B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sanitizeSpecSummary(m.specs)}</div>
                </div>
                <strong style={{ color: '#D13639', fontSize: 13.5, flexShrink: 0, whiteSpace: 'nowrap' }}>{formatVnd(m.price)}</strong>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
