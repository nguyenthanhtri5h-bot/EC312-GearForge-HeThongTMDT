import { useEffect, useRef, useState } from 'react';
import { formatVnd, useGearForgeStore } from '../../hooks/useGearForgeStore';
import { calcFallbackInstallment } from '../../hooks/fallbackBoot';

interface MajorPreset {
  id: string;
  label: string;
  minBudget: number;
  baseFps: number;
  gpuTarget: string;
  query: string;
}

const MAJORS: MajorPreset[] = [
  { id: 'ai', label: 'CNTT / AI-ML', minBudget: 22000000, baseFps: 95, gpuTarget: 'RTX 4060+ · 16–32GB RAM', query: 'RTX' },
  { id: 'se', label: 'Kỹ thuật Phần mềm', minBudget: 17000000, baseFps: 75, gpuTarget: 'Core i5/Ryzen 5 · 16GB RAM', query: 'RAM 16GB' },
  { id: 'sec', label: 'An toàn Thông tin', minBudget: 18000000, baseFps: 70, gpuTarget: 'Intel Ultra / Ryzen AI · Linux ready', query: 'Ultra' },
  { id: 'creator', label: 'Đồ họa 3D / Creator', minBudget: 25000000, baseFps: 115, gpuTarget: 'RTX 4070+ · Màn 100% sRGB/OLED', query: 'RTX' },
];

const DEFAULT_ESTIMATE = { budget: 28000000, downPct: 20, months: 3 } as const;

export function StudentBuildEstimator() {
  const { calcInstallment, navigateToPage } = useGearForgeStore();
  const [majorId, setMajorId] = useState('ai');
  const [budget, setBudget] = useState<number>(DEFAULT_ESTIMATE.budget);
  const [downPct, setDownPct] = useState<number>(DEFAULT_ESTIMATE.downPct);
  const [months, setMonths] = useState<number>(DEFAULT_ESTIMATE.months);
  const [monthlyPay, setMonthlyPay] = useState(() =>
    calcFallbackInstallment(DEFAULT_ESTIMATE.budget, DEFAULT_ESTIMATE.downPct, DEFAULT_ESTIMATE.months).monthly_amount
  );
  const firstMountRef = useRef(true);

  const major = MAJORS.find((m) => m.id === majorId) || MAJORS[0];
  const tier = Math.max(0, Math.min(1, (budget - 15000000) / (70000000 - 15000000)));
  const estFps = Math.round((major.baseFps * (0.65 + 0.45 * tier)) / 5) * 5;
  const estBattery = (4.0 + 4.2 * tier).toFixed(1);
  const invalidBudget = budget < major.minBudget;

  useEffect(() => {
    if (firstMountRef.current) {
      firstMountRef.current = false;
      return;
    }
    let active = true;
    const t = window.setTimeout(() => {
      void calcInstallment(budget, downPct, months)
        .then((res) => {
          if (active && Number.isFinite(res?.monthly_amount)) {
            setMonthlyPay(res.monthly_amount);
          }
        })
        .catch(() => {
          /* keep fallback estimate */
        });
    }, 150);
    return () => { active = false; window.clearTimeout(t); };
  }, [budget, downPct, months, calcInstallment]);

  return (
    <section className="gf-est-workbench" aria-labelledby="gf-est-title">
      <div className="gf-est-workbench__left">
        <div className="gf-est-head">
          <span className="gf-est-kicker">CÔNG CỤ DỰ TOÁN · ĐHQG-HCM</span>
          <h2 id="gf-est-title">4 Bước Chọn Máy &amp; Tính Trả Góp</h2>
        </div>

        <div className="gf-est-step">
          <div className="gf-est-step-row">
            <span className="gf-est-num">01</span>
            <strong>Ngành học của bạn</strong>
          </div>
          <div className="gf-est-pills">
            {MAJORS.map((m) => (
              <button
                key={m.id}
                type="button"
                className={`gf-eco-pill ${majorId === m.id ? 'is-on' : ''}`}
                onClick={() => setMajorId(m.id)}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div className="gf-est-step">
          <div className="gf-est-step-row">
            <span className="gf-est-num">02</span>
            <label htmlFor="gf-budget-range">Ngân sách tối đa</label>
            <strong className="gf-est-val">{formatVnd(budget)}</strong>
          </div>
          <input
            id="gf-budget-range"
            type="range"
            min={15000000}
            max={70000000}
            step={1000000}
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            className="gf-est-range"
          />
          {invalidBudget && (
            <p className="gf-est-warn">
              Ngành {major.label} khuyến nghị từ {formatVnd(major.minBudget)} để chạy mượt đồ án.
            </p>
          )}
        </div>

        <div className="gf-est-step">
          <div className="gf-est-step-row">
            <span className="gf-est-num">03</span>
            <strong>Tỷ lệ trả trước</strong>
          </div>
          <div className="gf-est-pills">
            {[20, 30, 50].map((pct) => (
              <button key={pct} type="button" className={`gf-eco-pill ${downPct === pct ? 'is-on' : ''}`} onClick={() => setDownPct(pct)}>
                {pct}% ({formatVnd((budget * pct) / 100)})
              </button>
            ))}
          </div>
        </div>

        <div className="gf-est-step">
          <div className="gf-est-step-row">
            <span className="gf-est-num">04</span>
            <strong>Kỳ hạn góp (.edu.vn)</strong>
          </div>
          <div className="gf-est-pills">
            {[3, 6, 12].map((m) => (
              <button key={m} type="button" className={`gf-eco-pill ${months === m ? 'is-on' : ''}`} onClick={() => setMonths(m)}>
                {m} tháng {m === 3 ? '(0% lãi)' : ''}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="gf-est-workbench__right">
        <div>
          <span className="gf-hud-kicker">GỢI Ý CẤU HÌNH ({major.label.toUpperCase()})</span>
          <h3 className="gf-hud-target">{major.gpuTarget}</h3>
          <p className="gf-hud-note">
            Trả trước {downPct}% qua hồ sơ sinh viên, duyệt trực tuyến trong giờ hành chính và giao tận phòng KTX.
          </p>
        </div>

        <div className="gf-hud-stats">
          <div className="gf-hud-stat">
            <span>FPS Đồ họa/Game</span>
            <strong>~{estFps} FPS</strong>
          </div>
          <div className="gf-hud-stat">
            <span>Pin học tập</span>
            <strong>{estBattery} giờ</strong>
          </div>
          <div className="gf-hud-stat">
            <span>Góp {months} tháng</span>
            <strong className="is-accent">{formatVnd(monthlyPay)}</strong>
          </div>
        </div>

        <button
          type="button"
          className="gf-est-workbench__cta"
          onClick={() => navigateToPage('shop', { maxPrice: budget, search: major.query, page: 1 })}
        >
          Xem máy phù hợp ngân sách {formatVnd(budget)} &rarr;
        </button>
      </div>
    </section>
  );
}
