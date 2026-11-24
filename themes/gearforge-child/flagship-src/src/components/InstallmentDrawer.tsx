import { useEffect, useMemo, useState } from 'react';
import { formatVnd, useGearForgeStore } from '../hooks/useGearForgeStore';
import type { InstallmentCalcResult } from '../types/gearforge';
import { InstallmentForm } from './drawers/InstallmentForm';
import './drawers/drawers-extra.css';

const DOWN_OPTIONS = [20, 30, 50] as const;
const TERM_OPTIONS = [
  { months: 3, label: '3 tháng (0% lãi)' },
  { months: 6, label: '6 tháng (1.2%/th)' },
  { months: 12, label: '12 tháng (1.5%/th)' },
] as const;

export function InstallmentDrawer() {
  const {
    boot,
    products,
    activeDrawer,
    installmentProductId,
    closeDrawer,
    calcInstallment,
  } = useGearForgeStore();

  const pool = useMemo(() => {
    const merged = [...products];
    (boot.products || []).forEach((bp) => {
      if (!merged.some((p) => p.id === bp.id)) merged.push(bp);
    });
    return merged;
  }, [boot.products, products]);

  const [selectedId, setSelectedId] = useState<number>(() => installmentProductId || pool[0]?.id || 0);
  const [downPct, setDownPct] = useState<number>(30);
  const [months, setMonths] = useState<number>(3);
  const [calc, setCalc] = useState<InstallmentCalcResult | null>(null);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    if (installmentProductId) {
      setSelectedId(installmentProductId);
    } else if (!selectedId && pool[0]) {
      setSelectedId(pool[0].id);
    }
  }, [installmentProductId, pool, selectedId]);

  const selectedProduct = useMemo(
    () => pool.find((p) => p.id === selectedId) || pool[0],
    [pool, selectedId]
  );

  useEffect(() => {
    if (activeDrawer !== 'installment' || !selectedProduct) return;
    let cancelled = false;
    setCalculating(true);
    void calcInstallment(selectedProduct.price, downPct, months).then((res) => {
      if (!cancelled) {
        setCalc(res);
        setCalculating(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [activeDrawer, selectedProduct, downPct, months, calcInstallment]);

  useEffect(() => {
    if (activeDrawer !== 'installment') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDrawer();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeDrawer, closeDrawer]);

  if (activeDrawer !== 'installment' || !selectedProduct) return null;

  const downAmount = calc?.downpayment_amount ?? Math.round(selectedProduct.price * (downPct / 100));
  const monthlyAmount = calc?.monthly_amount ?? Math.round((selectedProduct.price - downAmount) / months);
  const ratePct = calc?.interest_rate ?? (months === 3 ? 0 : months === 6 ? 1.2 : 1.5);
  const totalPayable =
    calc?.total_payable ?? downAmount + monthlyAmount * months;

  return (
    <div
      className="gf-drawer-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="gf-installment-drawer-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeDrawer();
      }}
    >
      <div className="gf-drawer-panel">
        <div className="gf-drawer-head">
          <div>
            <h3 id="gf-installment-drawer-title">Trả góp 0% Sinh viên ĐHQG-HCM</h3>
            <span style={{ fontSize: 12.5, color: '#cbd5e1' }}>
              Ước tính khoản góp minh bạch &amp; duyệt hồ sơ qua email .edu.vn
            </span>
          </div>
          <button type="button" className="gf-drawer-close" aria-label="Đóng trả góp" onClick={closeDrawer}>
            &times;
          </button>
        </div>

        <div className="gf-drawer-body">
          <div className="gf-field-col">
            <label htmlFor="gf-inst-product-select" className="gf-field-label">Thiết bị đăng ký</label>
            <select
              id="gf-inst-product-select"
              className="gf-dark-select"
              value={selectedProduct.id}
              onChange={(e) => setSelectedId(Number(e.target.value))}
            >
              {pool.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {formatVnd(p.price)}
                </option>
              ))}
            </select>
          </div>

          <div className="gf-field-col">
            <span className="gf-field-label">Tỷ lệ trả trước</span>
            <div className="gf-pill-row" role="group" aria-label="Chọn tỷ lệ trả trước">
              {DOWN_OPTIONS.map((pct) => (
                <button
                  key={pct}
                  type="button"
                  aria-pressed={downPct === pct}
                  className={`gf-choice-pill ${downPct === pct ? 'is-active' : ''}`}
                  onClick={() => setDownPct(pct)}
                >
                  {pct}% {pct === 30 ? '(Khuyên dùng)' : ''}
                </button>
              ))}
            </div>
          </div>

          <div className="gf-field-col">
            <span className="gf-field-label">Kỳ hạn trả góp</span>
            <div className="gf-pill-row" role="group" aria-label="Chọn kỳ hạn trả góp">
              {TERM_OPTIONS.map((opt) => (
                <button
                  key={opt.months}
                  type="button"
                  aria-pressed={months === opt.months}
                  className={`gf-choice-pill ${months === opt.months ? 'is-active' : ''}`}
                  onClick={() => setMonths(opt.months)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="gf-inst-summary" aria-live="polite" style={{ opacity: calculating ? 0.72 : 1 }}>
            <div className="gf-inst-stat">
              <span>Số tiền trả trước ({downPct}%)</span>
              <strong>{formatVnd(downAmount)}</strong>
            </div>
            <div className="gf-inst-stat">
              <span>Góp mỗi tháng ({months} kỳ)</span>
              <strong>{formatVnd(monthlyAmount)}/th</strong>
            </div>
            <div className="gf-inst-stat">
              <span>Lãi suất · Tổng thanh toán</span>
              <strong>{ratePct === 0 ? '0% lãi' : `${ratePct}%/th`}</strong>
              <span style={{ marginTop: 4, fontFamily: "'JetBrains Mono', monospace", color: '#e2e8f0' }}>
                {formatVnd(totalPayable)}
              </span>
            </div>
          </div>

          <InstallmentForm product={selectedProduct} downPct={downPct} months={months} />
        </div>
      </div>
    </div>
  );
}
