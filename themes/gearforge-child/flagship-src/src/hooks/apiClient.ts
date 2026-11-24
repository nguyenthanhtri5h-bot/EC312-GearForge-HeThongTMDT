import type { CompareItem, FilterParams, GearForgeProduct, InstallmentCalcResult, OmsOrder } from '../types/gearforge';
import { calcFallbackInstallment } from './fallbackBoot';

export async function apiFetchCatalog(ajaxUrl: string, next: FilterParams, signal?: AbortSignal): Promise<{ items: GearForgeProduct[]; total: number; totalPages: number } | null> {
  const base = ajaxUrl.startsWith('http') && typeof window !== 'undefined'
    ? new URL(ajaxUrl, window.location.origin).pathname
    : ajaxUrl;
  const qs = new URLSearchParams({
    action: 'gf_flagship_catalog',
    search: next.search,
    category: next.category,
    cpu: next.cpu,
    ram: next.ram,
    gpu: next.gpu,
    storage: next.storage || '',
    maxPrice: String(next.maxPrice),
    sort: next.sort,
    page: String(next.page),
    perPage: String(next.perPage),
  });
  const res = await fetch(`${base}?${qs.toString()}`, { credentials: 'same-origin', signal });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (json?.success && json.data) {
    return { items: json.data.items || [], total: Number(json.data.total ?? 0), totalPages: Math.max(1, Number(json.data.totalPages ?? 1)) };
  }
  return null;
}

export async function apiPostCart(ajaxUrl: string, ajaxNonce: string, body: Record<string, string | number>) {
  const params = new URLSearchParams({ action: 'gf_flagship_cart', nonce: ajaxNonce });
  Object.entries(body).forEach(([k, v]) => params.set(k, String(v)));
  const res = await fetch(ajaxUrl, {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });
  return res.json();
}

export async function apiPostCompare(ajaxUrl: string, ajaxNonce: string, mode: string, productId = 0): Promise<{ ok: boolean; items?: CompareItem[]; message?: string }> {
  const body = new URLSearchParams({ action: 'gf_compare_action', nonce: ajaxNonce, mode, product_id: String(productId) });
  const res = await fetch(ajaxUrl, {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  const json = await res.json();
  if (json?.success && json.data?.items) {
    return { ok: true, items: json.data.items as CompareItem[] };
  }
  return { ok: false, message: json?.data?.message };
}

export async function apiCalcInstallment(restUrl: string, price: number, downPct: number, months: number): Promise<InstallmentCalcResult> {
  try {
    const res = await fetch(`${restUrl}/installment-calc?price=${price}&down_pct=${downPct}&months=${months}`, { credentials: 'same-origin' });
    if (res.ok) {
      const data = await res.json();
      if (typeof data?.monthly_amount === 'number') return data;
    }
  } catch { /* fallback below */ }
  return calcFallbackInstallment(price, downPct, months);
}

export async function apiLookupOms(ajaxUrl: string, orderId: number): Promise<OmsOrder | null> {
  try {
    const res = await fetch(`${ajaxUrl}?action=gf_flagship_oms_lookup&order_id=${orderId}`, { credentials: 'same-origin' });
    const json = await res.json();
    return json?.success && json.data ? (json.data as OmsOrder) : null;
  } catch {
    return null;
  }
}
