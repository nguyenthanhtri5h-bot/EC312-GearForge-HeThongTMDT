import { useEffect, useState } from 'react';
import { formatVnd, useGearForgeStore } from '../../hooks/useGearForgeStore';
import { calcFallbackInstallment } from '../../hooks/fallbackBoot';

interface MajorPreset {
  id: string;
  label: string;
  minBudget: number;
  baseFps: number;
  cat: string;
  specHint: string;
}

const MAJORS: MajorPreset[] = [
  { id: 'ai', label: 'CNTT / AI-ML', minBudget: 20000000, baseFps: 135, cat: 'laptop-gaming', specHint: 'RTX 4060+ · 16–32GB RAM' },
  { id: 'ktpm', label: 'Kỹ thuật Phần mềm', minBudget: 16000000, baseFps: 110, cat: 'laptop-ultrabook', specHint: 'Core Ultra / Ryzen AI · Pin 7h+' },
  { id: 'attt', label: 'An toàn Thông tin', minBudget: 18000000, baseFps: 120, cat: 'pc-workstation', specHint: '32GB+ RAM VM · Đa nhân' },
  { id: 'media', label: 'Đồ họa 3D / Creator', minBudget: 22000000, baseFps: 145, cat: 'laptop-ultrabook', specHint: 'OLED 100% DCI-P3 · RTX Studio' },
];

export function StudentBuildEstimator() {
  const { calcInstallment, navigateToPage } = useGearForgeStore();
  const [majorId, setMajorId] = useState('ai');
  const [budget, setBudget] = useState(28000000);
  const [downPct, setDownPct] = useState(20);
  const [months, setMonths] = useState(3);
  const [monthlyPay, setMonthlyPay] = useState(() => calcFallbackInstallment(28000000, 20, 3).monthly_amount);

  const major = MAJORS.find((m) => m.id === majorId) || MAJORS[0];
  const tier = Math.max(0, Math.min(1, (budget - 15000000) / (70000000 - 15000000)));
  const estFps = Math.round((major.baseFps * (0.65 + 0.45 * tier)) / 5) * 5;
  const estBattery = (4.0 + 4.2 * tier).toFixed(1);
  const invalidBudget = budget < major.minBudget;

  useEffect(() => {
    let active = true;
    const t = window.setTimeout(() => {
      void calcInstallment(budget, downPct, months).then((res) => {
        if (active && typeof res?.monthly_amount === 'number') setMonthlyPay(res.monthly_amount);
      });
    }, 120);
    return () => { active = false; window.clearTimeout(t); };
  }, [budget, downPct, months, calcInstallment]);

  return (
    <div className="gf-est-box" aria-labelledby="gf-est-title">
      <div>
        <span className="gf-live-badge"><i /> Công cụ ước tính cấu hình &amp; trả góp ĐHQG-HCM</span>
        <h2 id="gf-est-title" style={{ margin: '12px 0 8px', fontFamily: "'Be Vietnam Pro', sans-serif", fontSize: 28, fontWeight: 800 }}>
          4 Bước Chọn Máy Theo Ngành Học
        </h2>
        <p style={{ margin: '0 0 18px', fontSize: 14, color: '#475569' }}>
          Tính ngay hiệu năng dự kiến và mức góp mỗi tháng theo chính sách ưu đãi sinh viên ĐHQG-HCM.
        </p>

        <div className="gf-eco-pills" role="tablist" aria-label="Chọn ngành học UIT">
          {MAJORS.map((m) => (
            <button
              key={m.id}
              type="button"
              className={`gf-eco-pill ${m.id === majorId ? 'is-on' : ''}`}
              onClick={() => setMajorId(m.id)}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div style={{ marginTop: 18, display: 'grid', gap: 14 }}>
          <div>
            <label htmlFor="gf-est-budget" className="gf-budget-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>1. Ngân sách tối đa</span>
              <strong>{formatVnd(budget)}</strong>
            </label>
            <input id="gf-est-budget" type="range" className="gf-budget-range" style={{ width: '100%' }}
              min={15000000} max={70000000} step={1000000} value={budget}
              onChange={(e) => setBudget(Number(e.target.value))} />
          </div>

          <div>
            <label htmlFor="gf-est-down" className="gf-budget-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>2. Trả trước ({downPct}%)</span>
              <strong>{formatVnd((budget * downPct) / 100)}</strong>
            </label>
            <input id="gf-est-down" type="range" className="gf-budget-range" style={{ width: '100%' }}
              min={20} max={50} step={10} value={downPct}
              onChange={(e) => setDownPct(Number(e.target.value))} />
          </div>

          <div>
            <span className="gf-budget-label" style={{ display: 'block', marginBottom: 8 }}>3. Kỳ hạn góp</span>
            <div style={{ display: 'flex', gap: 8 }}>
              {[3, 6, 12].map((m) => (
                <button key={m} type="button" className={`gf-mini-pill ${months === m ? 'is-active' : ''}`} onClick={() => setMonths(m)}>
                  {m} tháng {m === 3 ? '(0% SV)' : ''}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 16, padding: 20, borderRadius: 14, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
        <div>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#2563eb' }}>GỢI Ý CẤU HÌNH ({major.label})</span>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginTop: 4 }}>{major.specHint}</div>
        </div>

        <div className="gf-inst-summary">
          <div className="gf-inst-stat"><span>FPS Đồ họa/Game</span><strong>~{estFps} FPS</strong></div>
          <div className="gf-inst-stat"><span>Pin học tập</span><strong>{estBattery} giờ</strong></div>
          <div className="gf-inst-stat"><span>Góp {months} tháng</span><strong>{formatVnd(monthlyPay)}</strong></div>
        </div>

        {invalidBudget ? (
          <div className="gf-alert-box is-warn">
            Ngân sách tối thiểu đề xuất cho ngành {major.label} là {formatVnd(major.minBudget)}.
          </div>
        ) : (
          <div style={{ fontSize: 13, color: '#475569' }}>
            Phù hợp với nhiều cấu hình sẵn kho (ước tính góp ~<strong style={{ color: '#0f172a' }}>{formatVnd(monthlyPay)}/th</strong>).
          </div>
        )}

        <button
          type="button"
          className="tc-btn tc-btn-cam"
          style={{ border: 0, cursor: 'pointer', width: '100%', justifyContent: 'center' }}
          disabled={invalidBudget}
          onClick={() => navigateToPage('shop', { category: major.cat, maxPrice: budget })}
        >
          Xem các máy phù hợp →
        </button>
      </div>
    </div>
  );
}
