import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { apiCalcInstallment, apiFetchCatalog, apiLookupOms, apiPostCart, apiPostCompare } from './apiClient';
import { filterLocalProducts, getInitialBoot, normalizeCompareItems, recalcLocalCart } from './fallbackBoot';
import type { CartState, CompareItem, DrawerKind, FilterParams, FlagshipPageMode, GearForgeBoot, GearForgeContextValue, GearForgeProduct } from '../types/gearforge';

function detectModeFromLocation(fallback?: FlagshipPageMode): FlagshipPageMode {
  if (typeof window === 'undefined') return fallback || 'showcase';
  const p = window.location.pathname.replace(/\/+$/, '');
  const q = new URLSearchParams(window.location.search);
  if (p.startsWith('/shop') || p.startsWith('/product-category') || q.get('view') === 'shop') return 'shop';
  if (p.startsWith('/he-sinh-thai')) return 'ecosystem';
  if (p.startsWith('/cau-hinh-mau')) return 'gallery';
  return p === '' || p === '/index.php' ? 'showcase' : fallback || 'showcase';
}

const DEFAULT_FILTERS: FilterParams = { search: '', category: '', cpu: '', ram: '', gpu: '', storage: '', maxPrice: 80000000, sort: 'menu_order', page: 1, perPage: 12 };

const GearForgeContext = createContext<GearForgeContextValue | null>(null);

export function formatVnd(amount: number): string {
  return `${new Intl.NumberFormat('vi-VN').format(Math.round(amount))}đ`;
}

export function GearForgeProvider({ children }: { children: React.ReactNode }) {
  const [boot] = useState<GearForgeBoot>(() => getInitialBoot());
  const [pageMode, setPageMode] = useState<FlagshipPageMode>(() => detectModeFromLocation(boot.pageMode));
  const [products, setProducts] = useState<GearForgeProduct[]>(() => boot.products || []);
  const [totalProducts, setTotalProducts] = useState<number>(() => boot.totalProducts ?? boot.products?.length ?? 0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [filters, setFilters] = useState<FilterParams>(DEFAULT_FILTERS);
  const [cart, setCart] = useState<CartState>(() => boot.cart);
  const [compareIds, setCompareIds] = useState<number[]>(() => boot.compareIds || []);
  const [compareItems, setCompareItems] = useState<CompareItem[]>(() =>
    normalizeCompareItems(boot.compareItems || [], [boot.products || []])
  );
  const [activeDrawer, setActiveDrawer] = useState<DrawerKind>(null);
  const [installmentProductId, setInstallmentProductId] = useState<number | null>(null);
  const [videoModalSrc, setVideoModalSrc] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<GearForgeProduct | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const filtersRef = useRef<FilterParams>(filters);
  filtersRef.current = filters;
  const catalogAbortRef = useRef<AbortController | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(null), 3500);
  }, []);

  const openDrawer = useCallback((kind: Exclude<DrawerKind, null>, productId?: number) => {
    if (kind === 'installment' && productId) setInstallmentProductId(productId);
    setActiveDrawer(kind);
  }, []);

  const closeDrawer = useCallback(() => setActiveDrawer(null), []);

  const fetchCatalog = useCallback(async (patch?: Partial<FilterParams>) => {
    const prev = filtersRef.current;
    const next = { ...prev, ...patch, page: patch?.page ?? (patch ? 1 : prev.page) };
    filtersRef.current = next;
    setFilters(next);
    if (!boot.ajaxUrl) {
      const filtered = filterLocalProducts(boot.products || [], next);
      setProducts(filtered);
      setTotalProducts(filtered.length);
      setTotalPages(1);
      return;
    }
    catalogAbortRef.current?.abort();
    const ctrl = new AbortController();
    catalogAbortRef.current = ctrl;
    setCatalogLoading(true);
    try {
      const data = await apiFetchCatalog(boot.ajaxUrl, next, ctrl.signal);
      if (data && !ctrl.signal.aborted) {
        setProducts(data.items);
        setTotalProducts(data.total);
        setTotalPages(data.totalPages);
      }
    } catch (err) {
      if ((err as DOMException)?.name === 'AbortError') return;
      showToast('Không tải được danh mục sản phẩm.');
    } finally {
      if (!ctrl.signal.aborted) setCatalogLoading(false);
    }
  }, [boot.ajaxUrl, boot.products, showToast]);

  const addToCart = useCallback(async (productId: number, qty = 1) => {
    if (!boot.ajaxUrl) {
      const p = products.find((it) => it.id === productId) || boot.products.find((it) => it.id === productId);
      if (!p) return;
      setCart((prev) => {
        const items = [...prev.items];
        const idx = items.findIndex((it) => it.productId === productId);
        if (idx >= 0) items[idx] = { ...items[idx], qty: items[idx].qty + qty, lineTotal: (items[idx].qty + qty) * p.price };
        else items.push({ key: String(p.id), productId: p.id, name: p.name, price: p.price, qty, lineTotal: p.price * qty, image: p.image, permalink: p.permalink });
        return recalcLocalCart(items, prev);
      });
      showToast(`Đã thêm "${p.name}" vào giỏ hàng`);
      return;
    }
    try {
      const json = await apiPostCart(boot.ajaxUrl, boot.ajaxNonce, { mode: 'add', product_id: productId, qty });
      if (json?.success && json.data?.cart) { setCart(json.data.cart); showToast(json.data.message || 'Đã thêm vào giỏ hàng.'); }
    } catch { showToast('Không thể thêm sản phẩm vào giỏ.'); }
  }, [boot.ajaxNonce, boot.ajaxUrl, boot.products, products, showToast]);

  const updateCartItem = useCallback(async (cartItemKey: string, qty: number) => {
    if (!boot.ajaxUrl) {
      setCart((prev) => recalcLocalCart(prev.items.map((it) => (it.key === cartItemKey ? { ...it, qty, lineTotal: it.price * qty } : it)).filter((it) => it.qty > 0), prev));
      return;
    }
    try {
      const json = await apiPostCart(boot.ajaxUrl, boot.ajaxNonce, { mode: 'update', cart_item_key: cartItemKey, qty });
      if (json?.success && json.data?.cart) setCart(json.data.cart);
    } catch { showToast('Không thể cập nhật số lượng.'); }
  }, [boot.ajaxNonce, boot.ajaxUrl, showToast]);

  const removeCartItem = useCallback(async (cartItemKey: string) => {
    if (!boot.ajaxUrl) {
      setCart((prev) => recalcLocalCart(prev.items.filter((it) => it.key !== cartItemKey), prev));
      return;
    }
    try {
      const json = await apiPostCart(boot.ajaxUrl, boot.ajaxNonce, { mode: 'remove', cart_item_key: cartItemKey });
      if (json?.success && json.data?.cart) setCart(json.data.cart);
    } catch { showToast('Không thể xóa sản phẩm khỏi giỏ.'); }
  }, [boot.ajaxNonce, boot.ajaxUrl, showToast]);

  const applyCoupon = useCallback(async (code: string): Promise<boolean> => {
    const clean = code.trim().toUpperCase();
    if (!clean) return false;
    if (!boot.ajaxUrl) {
      if (clean !== 'BACKTOSCHOOL') { showToast('Mã ưu đãi không hợp lệ.'); return false; }
      setCart((prev) => recalcLocalCart(prev.items, { ...prev, coupons: [clean] }));
      showToast(`Đã áp dụng mã ${clean} (-5% SV ĐHQG).`);
      return true;
    }
    try {
      const json = await apiPostCart(boot.ajaxUrl, boot.ajaxNonce, { mode: 'apply_coupon', coupon_code: clean });
      if (json?.success && json.data?.cart) { setCart(json.data.cart); showToast(json.data.message || `Đã áp dụng mã ${clean}.`); return true; }
      showToast(json?.data?.message || 'Không áp dụng được mã ưu đãi.');
      return false;
    } catch { showToast('Lỗi kết nối khi áp mã ưu đãi.'); return false; }
  }, [boot.ajaxNonce, boot.ajaxUrl, showToast]);

  const toggleCompare = useCallback(async (productId: number) => {
    const exists = compareIds.includes(productId);
    if (!exists && compareIds.length >= 3) { showToast('Chỉ so sánh tối đa 3 thiết bị cùng lúc.'); return; }
    if (!boot.ajaxUrl) {
      if (exists) {
        setCompareIds((p) => p.filter((id) => id !== productId));
        setCompareItems((p) => p.filter((it) => it.id !== productId));
      } else {
        const prod = products.find((it) => it.id === productId) || boot.products.find((it) => it.id === productId);
        if (prod) {
          setCompareIds((p) => [...p, prod.id]);
          setCompareItems((p) => [...p, { id: prod.id, name: prod.name, price: prod.price, image: prod.image, permalink: prod.permalink, specs: prod.specs }]);
        }
      }
      return;
    }
    try {
      const res = await apiPostCompare(boot.ajaxUrl, boot.ajaxNonce, exists ? 'remove' : 'add', productId);
      if (res.ok && res.items) {
        const items = normalizeCompareItems(res.items, [products, boot.products || []], compareItems);
        setCompareItems(items);
        setCompareIds(items.map((it) => Number(it.id)));
        showToast(exists ? 'Đã bỏ khỏi khay so sánh.' : `Đã thêm vào so sánh (${items.length}/3).`);
      } else showToast(res.message || 'Không thể cập nhật khay so sánh.');
    } catch { showToast('Lỗi kết nối khay so sánh.'); }
  }, [boot.ajaxNonce, boot.ajaxUrl, boot.products, compareIds, compareItems, products, showToast]);

  const clearCompare = useCallback(async () => {
    setCompareIds([]);
    setCompareItems([]);
    try { if (boot.ajaxUrl) await apiPostCompare(boot.ajaxUrl, boot.ajaxNonce, 'clear', 0); } catch { /* ignore */ }
  }, [boot.ajaxNonce, boot.ajaxUrl]);

  const calcInstallment = useCallback((price: number, downPct: number, months: number) => apiCalcInstallment(boot.restUrl, price, downPct, months), [boot.restUrl]);
  const lookupOmsOrder = useCallback(async (orderId: number) => (!boot.ajaxUrl ? (boot.sampleOrders?.find((o) => o.orderId === orderId) || null) : apiLookupOms(boot.ajaxUrl, orderId)), [boot.ajaxUrl, boot.sampleOrders]);

  const navigateToPage = useCallback((mode: FlagshipPageMode, filterPatch?: Partial<FilterParams>, hash?: string) => {
    setPageMode(mode);
    const url = mode === 'shop'
      ? `/shop/${filterPatch?.category ? `?category=${encodeURIComponent(filterPatch.category)}` : ''}`
      : mode === 'ecosystem'
        ? '/he-sinh-thai/'
        : mode === 'gallery'
          ? '/cau-hinh-mau/'
          : `/${hash ? (hash.startsWith('#') ? hash : `#${hash}`) : ''}`;
    if (typeof window !== 'undefined' && window.location.pathname + window.location.search + window.location.hash !== url) {
      window.history.pushState({ pageMode: mode }, '', url);
    }
    if (mode === 'shop') {
      void fetchCatalog(filterPatch ? { ...DEFAULT_FILTERS, ...filterPatch, page: 1 } : DEFAULT_FILTERS);
    }
    window.setTimeout(() => {
      if (hash) {
        const el = document.querySelector(hash.startsWith('#') ? hash : `#${hash}`);
        if (el) { el.scrollIntoView({ behavior: 'smooth' }); return; }
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 30);
  }, [fetchCatalog]);

  useEffect(() => {
    const onPop = () => setPageMode(detectModeFromLocation(boot.pageMode));
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [boot.pageMode]);

  const value = useMemo<GearForgeContextValue>(() => ({
    boot, pageMode, navigateToPage, products, totalProducts, totalPages, catalogLoading, filters, cart, compareIds, compareItems,
    activeDrawer, installmentProductId, videoModalSrc, toast, chatOpen, searchOpen, quickViewProduct,
    setChatOpen, setSearchOpen, setQuickViewProduct, setVideoModalSrc,
    showToast, openDrawer, closeDrawer, fetchCatalog, addToCart, updateCartItem, removeCartItem,
    applyCoupon, toggleCompare, clearCompare, calcInstallment, lookupOmsOrder,
  }), [
    boot, pageMode, navigateToPage, products, totalProducts, totalPages, catalogLoading, filters, cart, compareIds, compareItems,
    activeDrawer, installmentProductId, videoModalSrc, toast, chatOpen, searchOpen, quickViewProduct, showToast, openDrawer, closeDrawer,
    fetchCatalog, addToCart, updateCartItem, removeCartItem, applyCoupon, toggleCompare, clearCompare,
    calcInstallment, lookupOmsOrder,
  ]);

  return React.createElement(GearForgeContext.Provider, { value }, children);
}

export function useGearForgeStore(): GearForgeContextValue {
  const ctx = useContext(GearForgeContext);
  if (!ctx) throw new Error('useGearForgeStore must be used inside GearForgeProvider');
  return ctx;
}
