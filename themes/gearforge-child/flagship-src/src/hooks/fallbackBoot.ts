import type { CartState, CompareItem, FilterParams, GearForgeBoot, GearForgeProduct, InstallmentCalcResult } from '../types/gearforge';

const ASSET_ROOT = '/wp-content/themes/gearforge-child/assets/flagship/vibe/hardware';

export const FALLBACK_PRODUCTS: GearForgeProduct[] = [
  {
    id: 101,
    name: 'ASUS ROG Strix G16 (2026) — Core Ultra 9 / RTX 4070',
    slug: 'asus-rog-strix-g16-2026',
    permalink: '/product/asus-rog-strix-g16-2026/',
    price: 42990000,
    regularPrice: 45990000,
    salePrice: 42990000,
    image: `${ASSET_ROOT}/laptop-gaming.jpg`,
    category: 'Laptop Gaming',
    categorySlug: 'laptop-gaming',
    specs: { cpu: 'Core Ultra 9 275HX', ram: '32GB DDR5', gpu: 'RTX 4070 8GB', storage: '1TB NVMe Gen4', screen: '16" QHD+ 240Hz', weight: '2.5 kg' },
    stockStatus: 'instock',
    stockQty: 14,
    monthly3m: Math.round((42990000 * 0.8) / 3),
  },
  {
    id: 102,
    name: 'MacBook Pro 14 M4 Pro — Studio Creator & AI Dev',
    slug: 'macbook-pro-14-m4-pro',
    permalink: '/product/macbook-pro-14-m4-pro/',
    price: 48490000,
    image: `${ASSET_ROOT}/laptop-creator.jpg`,
    category: 'Laptop Đồ họa',
    categorySlug: 'laptop-do-hoa',
    specs: { cpu: 'Apple M4 Pro 12-Core', ram: '24GB Unified', gpu: '16-Core GPU Neural', storage: '512GB SSD', screen: '14.2" Liquid XDR 120Hz', weight: '1.55 kg' },
    stockStatus: 'instock',
    stockQty: 9,
    monthly3m: Math.round((48490000 * 0.8) / 3),
  },
  {
    id: 103,
    name: 'Lenovo ThinkPad X1 Carbon Gen 12 — Ultrabook UIT Dev',
    slug: 'lenovo-thinkpad-x1-carbon-g12',
    permalink: '/product/lenovo-thinkpad-x1-carbon-g12/',
    price: 33990000,
    regularPrice: 36500000,
    salePrice: 33990000,
    image: `${ASSET_ROOT}/laptop-ultrabook.jpg`,
    category: 'Laptop Văn phòng',
    categorySlug: 'laptop-van-phong',
    specs: { cpu: 'Core Ultra 7 155H', ram: '32GB LPDDR5x', gpu: 'Intel Arc Graphics', storage: '1TB NVMe', screen: '14" 2.8K OLED', weight: '1.09 kg' },
    stockStatus: 'instock',
    stockQty: 21,
    monthly3m: Math.round((33990000 * 0.8) / 3),
  },
  {
    id: 104,
    name: 'PC GearForge Nova Watercool — Ryzen 9 / RTX 4070 Ti Super',
    slug: 'pc-gearforge-nova-watercool',
    permalink: '/product/pc-gearforge-nova-watercool/',
    price: 46900000,
    image: `${ASSET_ROOT}/pc-watercool.jpg`,
    category: 'PC Workstation',
    categorySlug: 'pc-nguyen-bo',
    specs: { cpu: 'Ryzen 9 9900X', ram: '64GB DDR5 6000', gpu: 'RTX 4070 Ti Super 16GB', storage: '2TB NVMe Gen4', screen: 'Custom AIO 360mm', weight: '11.4 kg' },
    stockStatus: 'instock',
    stockQty: 6,
    monthly3m: Math.round((46900000 * 0.8) / 3),
  },
  {
    id: 105,
    name: 'MSI Katana 15 B14V — Laptop IT & Gaming Hiệu Năng Cao',
    slug: 'msi-katana-15-b14v',
    permalink: '/product/msi-katana-15-b14v/',
    price: 23490000,
    regularPrice: 25990000,
    salePrice: 23490000,
    image: `${ASSET_ROOT}/laptop-katana.jpg`,
    category: 'Laptop Gaming',
    categorySlug: 'laptop-gaming',
    specs: { cpu: 'Core i7-13620H', ram: '16GB DDR5', gpu: 'RTX 4060 8GB', storage: '512GB NVMe', screen: '15.6" FHD 144Hz', weight: '2.25 kg' },
    stockStatus: 'instock',
    stockQty: 32,
    monthly3m: Math.round((23490000 * 0.8) / 3),
  },
  {
    id: 106,
    name: 'PC GearForge Minimal Coder — Core i5 / 32GB / RTX 4060',
    slug: 'pc-gearforge-minimal-coder',
    permalink: '/product/pc-gearforge-minimal-coder/',
    price: 21800000,
    image: `${ASSET_ROOT}/pc-minimal.jpg`,
    category: 'PC Workstation',
    categorySlug: 'pc-nguyen-bo',
    specs: { cpu: 'Core i5-14600K', ram: '32GB DDR5', gpu: 'RTX 4060 8GB', storage: '1TB NVMe', screen: 'Case ITX Glass', weight: '7.8 kg' },
    stockStatus: 'instock',
    stockQty: 18,
    monthly3m: Math.round((21800000 * 0.8) / 3),
  },
  {
    id: 107,
    name: 'VGA ASUS Dual GeForce RTX 4070 SUPER OC 12GB GDDR6X',
    slug: 'vga-asus-dual-rtx-4070-super',
    permalink: '/product/vga-asus-dual-rtx-4070-super/',
    price: 18990000,
    regularPrice: 20490000,
    salePrice: 18990000,
    image: `${ASSET_ROOT}/pc-watercool.jpg`,
    category: 'VGA',
    categorySlug: 'vga',
    specs: { cpu: 'PCIe 4.0 x16', ram: '12GB GDDR6X', gpu: 'RTX 4070 SUPER', storage: '2-Fan Axial', screen: '267mm Compact', weight: '1.1 kg' },
    stockStatus: 'instock',
    stockQty: 11,
    monthly3m: Math.round((18990000 * 0.8) / 3),
  },
];

export function getInitialBoot(): GearForgeBoot {
  if (typeof window !== 'undefined' && window.gfFlagshipBoot) {
    return window.gfFlagshipBoot;
  }
  return {
    siteUrl: '',
    themeAssetBase: '/wp-content/themes/gearforge-child/assets/flagship',
    restUrl: '/wp-json/gearforge/v1',
    ajaxUrl: '',
    restNonce: '',
    ajaxNonce: '',
    routes: { shop: '/shop/', cart: '/cart/', checkout: '/checkout/', compare: '/so-sanh-cau-hinh/', tracking: '/tra-cuu-don-hang/', myAccount: '/my-account/' },
    user: { loggedIn: false },
    compareIds: [101, 102],
    compareItems: FALLBACK_PRODUCTS.slice(0, 2).map((p) => ({ id: p.id, name: p.name, price: p.price, image: p.image, permalink: p.permalink, specs: p.specs })),
    cart: { items: [], count: 0, subtotal: 0, discount: 0, total: 0, coupons: [] },
    products: FALLBACK_PRODUCTS,
    totalProducts: FALLBACK_PRODUCTS.length,
    sampleOrders: [
      {
        orderId: 542,
        status: 'SHIPPING',
        wcStatus: 'gf-shipping',
        total: 42990000,
        createdAt: '2026-11-18 14:20',
        customerName: 'Sinh viên ĐHQG-HCM',
        items: [{ name: 'ASUS ROG Strix G16 (2026)', qty: 1, total: 42990000 }],
        serials: [{ serial_number: 'GF-2026-ROG-0542', product_name: 'ASUS ROG Strix G16 (2026)', warranty_until: '2028-11-18' }],
        installment: { status: 'ACTIVE_INSTALLMENT', student_code: '2452****', months: 3, monthly_amount: 11464000 },
        invoiceUrl: '/tra-cuu-don-hang/?order_id=542',
      },
    ],
  };
}

export function calcFallbackInstallment(price: number, downPct: number, months: number): InstallmentCalcResult {
  const rates: Record<number, number> = { 3: 0, 6: 1.2, 12: 1.5 };
  const rate = rates[months] ?? 1.2;
  const down = Math.round(price * (downPct / 100));
  const loan = Math.max(0, price - down);
  const interest = Math.round(loan * (rate / 100) * months);
  const monthly = months > 0 ? Math.round((loan + interest) / months / 1000) * 1000 : 0;
  return { downpayment_amount: down, loan_principal: loan, monthly_amount: monthly, total_payable: down + loan + interest, interest_rate: rate, months };
}

export function filterLocalProducts(list: GearForgeProduct[], next: FilterParams): GearForgeProduct[] {
  const q = next.search.trim().toLowerCase();
  const catAliases: Record<string, string[]> = {
    'laptop-gaming': ['laptop-gaming'],
    gaming: ['laptop-gaming'],
    'laptop-ultrabook': ['laptop-van-phong', 'laptop-do-hoa', 'laptop-sinh-vien'],
    ultrabook: ['laptop-van-phong', 'laptop-do-hoa', 'laptop-sinh-vien'],
    'pc-workstation': ['pc', 'pc-nguyen-bo', 'pc-gaming', 'pc-do-hoa', 'pc-van-phong', 'pc-van-phong-do-hoa'],
    workstation: ['pc', 'pc-nguyen-bo', 'pc-gaming', 'pc-do-hoa', 'pc-van-phong', 'pc-van-phong-do-hoa'],
    'linh-kien': ['linh-kien', 'cpu', 'ram', 'vga', 'ram-ssd'],
    gear: ['gear', 'phu-kien', 'ban-phim', 'chuot', 'lot-chuot', 'ban-phim-co', 'chuot-gaming', 'tai-nghe', 'ram-ssd', 'balo-de-tan-nhiet'],
  };
  const filtered = list.filter((p) => {
    if (q && !`${p.name} ${p.specs.cpu || ''} ${p.specs.gpu || ''} ${p.specs.storage || ''}`.toLowerCase().includes(q)) return false;
    if (next.category) {
      const targets = catAliases[next.category] || [next.category];
      if (!targets.includes(p.categorySlug)) return false;
    }
    if (next.cpu && !(p.specs.cpu || '').toLowerCase().includes(next.cpu.toLowerCase())) return false;
    if (next.ram && !(p.specs.ram || '').toLowerCase().includes(next.ram.toLowerCase())) return false;
    if (next.gpu && !(p.specs.gpu || '').toLowerCase().includes(next.gpu.toLowerCase())) return false;
    if (next.storage && !(p.specs.storage || '').toLowerCase().includes(next.storage.toLowerCase())) return false;
    return p.price <= next.maxPrice;
  });
  return [...filtered].sort((a, b) => {
    if (next.sort === 'price_asc') return a.price - b.price;
    if (next.sort === 'price_desc') return b.price - a.price;
    if (next.sort === 'newest') return b.id - a.id;
    return 0;
  });
}

export function recalcLocalCart(items: CartState['items'], prev: CartState): CartState {
  const subtotal = items.reduce((s, it) => s + it.lineTotal, 0);
  const discount = prev.coupons.includes('BACKTOSCHOOL') ? Math.round(subtotal * 0.05) : prev.discount;
  return { ...prev, items, count: items.reduce((s, it) => s + it.qty, 0), subtotal, discount, total: Math.max(0, subtotal - discount) };
}

export function normalizeCompareItems(
  rawItems: unknown[],
  pools: GearForgeProduct[][],
  prevItems: CompareItem[] = []
): CompareItem[] {
  const byId = new Map<number, GearForgeProduct | CompareItem>();
  prevItems.forEach((it) => byId.set(Number(it.id), it));
  pools.forEach((list) => list.forEach((p) => byId.set(Number(p.id), p)));

  return (rawItems || []).map((raw) => {
    const r = (raw || {}) as Record<string, unknown>;
    const id = Number(r.id || 0);
    const ref = byId.get(id);
    const rawPrice = r.price;
    const parsedPrice =
      typeof rawPrice === 'number'
        ? rawPrice
        : Number(String(rawPrice || '').replace(/[^\d]/g, '')) || ref?.price || 0;
    const rawSpecs = (r.specs && typeof r.specs === 'object' ? r.specs : {}) as CompareItem['specs'];
    return {
      id,
      name: String(r.name || ref?.name || `Sản phẩm #${id}`),
      price: parsedPrice,
      priceFormatted: typeof rawPrice === 'string' ? rawPrice : undefined,
      image: String(r.image || ref?.image || ''),
      permalink: String(r.permalink || ref?.permalink || `/?p=${id}`),
      specs: { ...(ref?.specs || {}), ...rawSpecs },
    };
  });
}
