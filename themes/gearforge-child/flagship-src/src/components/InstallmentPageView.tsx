import { useEffect, useMemo, useState } from 'react';
import { INSTALLMENT_HOVER_STEPS } from '../data/subpageBandsData';
import { formatVnd, useGearForgeStore } from '../hooks/useGearForgeStore';
import type { InstallmentCalcResult } from '../types/gearforge';
import { InstallmentForm } from './drawers/InstallmentForm';
import { RiotSubpageHero } from './RiotSubpageHero';
import { SubpageHoverBand } from './subpages/SubpageHoverBand';
import '../styles/tool-pages.css';
import './drawers/drawers-extra.css';

const DOWN_OPTIONS = [20, 30, 50] as const;
const TERM_OPTIONS = [
  { months: 3, label: '3 tháng (0% lãi)' },
  { months: 6, label: '6 tháng (1.2%/th)' },
  { months: 12, label: '12 tháng (1.5%/th)' },
] as const;

export function InstallmentPageView() {
  const { boot, products, installmentProductId, calcInstallment } = useGearForgeStore();

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
    if (installmentProductId) setSelectedId(installmentProductId);
    else if (!selectedId && pool[0]) setSelectedId(pool[0].id);
  }, [installmentProductId, pool, selectedId]);

  const selectedProduct = useMemo(
    () => pool.find((p) => p.id === selectedId) || pool[0],
    [pool, selectedId]
  );

  useEffect(() => {
    if (!selectedProduct) return;
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
  }, [selectedProduct, downPct, months, calcInstallment]);

  if (!selectedProduct) return null;

  const downAmount = calc?.downpayment_amount ?? Math.round(selectedProduct.price * (downPct / 100));
  const monthlyAmount = calc?.monthly_amount ?? Math.round((selectedProduct.price - downAmount) / months);
  const ratePct = calc?.interest_rate ?? (months === 3 ? 0 : months === 6 ? 1.2 : 1.5);
  const totalPayable =
    ratePct === 0
      ? selectedProduct.price
      : (calc?.total_payable ?? downAmount + monthlyAmount * months);

  return (
    <main className="tc gf-tool-page" id="tc-installment">
      <RiotSubpageHero
        crumbLabel="Trang chủ / Trả góp 0% Sinh viên"
        kicker="ĐẶC QUYỀN ĐHQG-HCM · DUYỆT ONLINE QUA .EDU.VN"
        title="Trả Góp 0% Sinh Viên ĐHQG-HCM"
        sub="Ước tính khoản góp minh bạch theo từng máy, không giữ giấy tờ gốc, xét duyệt hồ sơ điện tử qua email sinh viên."
      />

      <div className="tc-wrap">

        <div className="gf-tool-split">
          <section aria-label="Cấu hình & Bảng tính trả góp">
            <div className="gf-tool-field-block" style={{ paddingTop: 0 }}>
              <label htmlFor="gf-inst-page-select" className="gf-tool-section-label">Thiết bị đăng ký</label>
              <select
                id="gf-inst-page-select"
                className="gf-tool-select"
                value={selectedProduct.id}
                onChange={(e) => setSelectedId(Number(e.target.value))}
              >
                {pool.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {formatVnd(p.price)}
                  </option>
                ))}
              </select>
              <div className="gf-inst-device-card">
                <img src={selectedProduct.image} alt={selectedProduct.name} />
                <div>
                  <span className="gf-inst-device-cat">{selectedProduct.category}</span>
                  <strong>{selectedProduct.name}</strong>
                  <span className="gf-inst-device-price">{formatVnd(selectedProduct.price)}</span>
                </div>
              </div>
            </div>

            <div className="gf-tool-field-block">
              <span className="gf-tool-section-label">Tỷ lệ trả trước</span>
              <div className="gf-tool-chips" role="group" aria-label="Chọn tỷ lệ trả trước">
                {DOWN_OPTIONS.map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    aria-pressed={downPct === pct}
                    className={`gf-tool-chip ${downPct === pct ? 'is-active' : ''}`}
                    onClick={() => setDownPct(pct)}
                  >
                    {pct}% {pct === 30 ? '(Khuyên dùng)' : ''}
                  </button>
                ))}
              </div>
            </div>

            <div className="gf-tool-field-block">
              <span className="gf-tool-section-label">Kỳ hạn trả góp</span>
              <div className="gf-tool-chips" role="group" aria-label="Chọn kỳ hạn trả góp">
                {TERM_OPTIONS.map((opt) => (
                  <button
                    key={opt.months}
                    type="button"
                    aria-pressed={months === opt.months}
                    className={`gf-tool-chip ${months === opt.months ? 'is-active' : ''}`}
                    onClick={() => setMonths(opt.months)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="gf-inst-kpi-banner" aria-live="polite">
              <span>Ước tính góp mỗi tháng ({months} kỳ · {ratePct === 0 ? '0% lãi' : `${ratePct}%/th`})</span>
              <strong>{formatVnd(monthlyAmount)}/tháng</strong>
            </div>

            <div className="gf-tool-facts" aria-live="polite" style={{ opacity: calculating ? 0.72 : 1 }}>
              <div className="gf-tool-fact">
                <span>Giá thiết bị niêm yết</span>
                <strong>{formatVnd(selectedProduct.price)}</strong>
              </div>
              <div className="gf-tool-fact">
                <span>Số tiền trả trước ({downPct}%)</span>
                <strong>{formatVnd(downAmount)}</strong>
              </div>
              <div className="gf-tool-fact">
                <span>Góp mỗi tháng ({months} kỳ)</span>
                <strong className="is-accent">{formatVnd(monthlyAmount)}/th</strong>
              </div>
              <div className="gf-tool-fact">
                <span>Lãi suất áp dụng</span>
                <strong>{ratePct === 0 ? '0% lãi suất' : `${ratePct}%/tháng`}</strong>
              </div>
              <div className="gf-tool-fact">
                <span>Tổng thanh toán</span>
                <strong>{formatVnd(totalPayable)}</strong>
              </div>
            </div>
          </section>

          <section aria-label="Hồ sơ xét duyệt sinh viên">
            <span className="gf-tool-section-label" style={{ marginBottom: 14 }}>
              Hồ sơ xác thực sinh viên &amp; eKYC (NĐ 13/2023)
            </span>
            <InstallmentForm product={selectedProduct} downPct={downPct} months={months} />
          </section>
        </div>
      </div>

      <SubpageHoverBand
        kicker="QUY TRÌNH XÉT DUYỆT TRẢ GÓP 0%"
        heading="Rê Chuột Xem 3 Bước Nhận Máy Không Giữ Giấy Tờ"
        items={INSTALLMENT_HOVER_STEPS}
      />
    </main>
  );
}
