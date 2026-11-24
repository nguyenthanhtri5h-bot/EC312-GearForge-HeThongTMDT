export interface ProductSpecs {
  cpu?: string;
  ram?: string;
  gpu?: string;
  storage?: string;
  screen?: string;
  weight?: string;
}

export interface GearForgeProduct {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  price: number;
  regularPrice?: number;
  salePrice?: number;
  image: string;
  category: string;
  categorySlug: string;
  specs: ProductSpecs;
  stockStatus: 'instock' | 'outofstock' | 'onbackorder';
  stockQty?: number;
  monthly3m?: number;
}

export interface CartItem {
  key: string;
  productId: number;
  name: string;
  price: number;
  qty: number;
  lineTotal: number;
  image: string;
  permalink: string;
}

export interface CartState {
  items: CartItem[];
  count: number;
  subtotal: number;
  discount: number;
  total: number;
  coupons: string[];
}

export interface CompareItem {
  id: number;
  name: string;
  price: number;
  priceFormatted?: string;
  image: string;
  permalink: string;
  specs: ProductSpecs;
}

export interface InstallmentCalcResult {
  downpayment_amount: number;
  loan_principal: number;
  monthly_amount: number;
  total_payable?: number;
  interest_rate?: number;
  months?: number;
}

export interface OmsStep {
  key: string;
  label: string;
}

export interface OmsOrder {
  orderId: number;
  status: string;
  wcStatus?: string;
  total: number;
  createdAt?: string;
  customerName?: string;
  items?: Array<{ name: string; qty: number; total: number }>;
  serials?: Array<{ serial_number: string; product_name?: string; warranty_until?: string }>;
  installment?: { status: string; student_code?: string; months?: number; monthly_amount?: number } | null;
  invoiceUrl?: string;
}

export interface FilterParams {
  search: string;
  category: string;
  cpu: string;
  ram: string;
  gpu: string;
  storage: string;
  maxPrice: number;
  sort: string;
  page: number;
  perPage: number;
}

export type DrawerKind = 'compare' | 'installment' | 'cart' | 'oms' | null;
export type FlagshipPageMode = 'showcase' | 'shop' | 'ecosystem' | 'gallery';

export interface GearForgeContextValue {
  boot: GearForgeBoot;
  pageMode: FlagshipPageMode;
  navigateToPage: (mode: FlagshipPageMode, filterPatch?: Partial<FilterParams>, hash?: string) => void;
  products: GearForgeProduct[];
  totalProducts: number;
  totalPages: number;
  catalogLoading: boolean;
  filters: FilterParams;
  cart: CartState;
  compareIds: number[];
  compareItems: CompareItem[];
  activeDrawer: DrawerKind;
  installmentProductId: number | null;
  videoModalSrc: string | null;
  toast: string | null;
  chatOpen: boolean;
  searchOpen: boolean;
  quickViewProduct: GearForgeProduct | null;
  setChatOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  setQuickViewProduct: (product: GearForgeProduct | null) => void;
  setVideoModalSrc: (url: string | null) => void;
  showToast: (msg: string) => void;
  openDrawer: (kind: Exclude<DrawerKind, null>, productId?: number) => void;
  closeDrawer: () => void;
  fetchCatalog: (patch?: Partial<FilterParams>) => Promise<void>;
  addToCart: (productId: number, qty?: number) => Promise<void>;
  updateCartItem: (cartItemKey: string, qty: number) => Promise<void>;
  removeCartItem: (cartItemKey: string) => Promise<void>;
  applyCoupon: (code: string) => Promise<boolean>;
  toggleCompare: (productId: number) => Promise<void>;
  clearCompare: () => Promise<void>;
  calcInstallment: (price: number, downPct: number, months: number) => Promise<InstallmentCalcResult>;
  lookupOmsOrder: (orderId: number) => Promise<OmsOrder | null>;
}

export interface GearForgeBoot {
  siteUrl: string;
  pageMode?: FlagshipPageMode;
  themeAssetBase: string;
  restUrl: string;
  ajaxUrl: string;
  restNonce: string;
  ajaxNonce: string;
  routes: { shop: string; cart: string; checkout: string; compare: string; tracking: string; myAccount: string };
  user: { loggedIn: boolean; id?: number; name?: string; email?: string };
  compareIds: number[];
  compareItems?: CompareItem[];
  cart: CartState;
  products: GearForgeProduct[];
  totalProducts?: number;
  sampleOrders?: OmsOrder[];
}

declare global {
  interface Window {
    gfFlagshipBoot?: GearForgeBoot;
  }
}
