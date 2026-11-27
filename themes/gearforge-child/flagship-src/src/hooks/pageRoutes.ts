import type { DrawerKind, FilterParams, FlagshipPageMode } from '../types/gearforge';

export function detectModeFromLocation(fallback?: FlagshipPageMode): FlagshipPageMode {
  if (typeof window === 'undefined') return fallback || 'showcase';
  const p = window.location.pathname.replace(/\/+$/, '');
  const q = new URLSearchParams(window.location.search);
  if (p.startsWith('/shop') || p.startsWith('/product-category') || q.get('view') === 'shop') return 'shop';
  if (p.startsWith('/he-sinh-thai')) return 'ecosystem';
  if (p.startsWith('/cau-hinh-mau')) return 'gallery';
  if (p.startsWith('/tra-cuu-don-hang')) return 'tracking';
  if (p.startsWith('/tra-gop')) return 'installment';
  if (p.startsWith('/so-sanh-cau-hinh')) return 'compare';
  if (p.startsWith('/gio-hang-sv')) return 'cart';
  return p === '' || p === '/index.php' ? 'showcase' : fallback || 'showcase';
}

export function resolveDrawerPageMode(kind: Exclude<DrawerKind, null>): FlagshipPageMode {
  if (kind === 'installment') return 'installment';
  if (kind === 'compare') return 'compare';
  if (kind === 'oms') return 'tracking';
  return 'cart';
}

export function resolvePageUrl(mode: FlagshipPageMode, filterPatch?: Partial<FilterParams>, hash?: string): string {
  switch (mode) {
    case 'shop':
      return `/shop/${filterPatch?.category ? `?category=${encodeURIComponent(filterPatch.category)}` : ''}`;
    case 'ecosystem':
      return '/he-sinh-thai/';
    case 'gallery':
      return '/cau-hinh-mau/';
    case 'tracking':
      return '/tra-cuu-don-hang/';
    case 'installment':
      return '/tra-gop/';
    case 'compare':
      return '/so-sanh-cau-hinh/';
    case 'cart':
      return '/gio-hang-sv/';
    default:
      return `/${hash ? (hash.startsWith('#') ? hash : `#${hash}`) : ''}`;
  }
}
