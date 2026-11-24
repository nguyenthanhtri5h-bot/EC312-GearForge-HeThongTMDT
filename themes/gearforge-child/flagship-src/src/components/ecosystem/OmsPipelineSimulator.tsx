import { useEffect, useRef, useState } from 'react';
import { useGearForgeStore } from '../../hooks/useGearForgeStore';

const SERVICE_STEPS = [
  { id: 'pick', title: '1. Đặt hàng & Chọn trả góp', detail: 'Đặt trực tiếp hoặc nộp hồ sơ qua email .edu.vn — bảo mật thông tin tuyệt đối.' },
  { id: 'verify', title: '2. Xác nhận sinh viên nhanh', detail: 'Đối chiếu thông tin thẻ SV ĐHQG-HCM trong giờ hành chính, không giữ giấy tờ.' },
  { id: 'check', title: '3. Kiểm máy & Gắn bảo hành', detail: 'Kỹ thuật viên test tải nặng 30 phút & kích hoạt bảo hành điện tử theo số Serial.' },
  { id: 'deliver', title: '4. Giao KTX 2h & Hóa đơn VAT', detail: 'Cài sẵn phần mềm chuyên ngành, xuất hóa đơn điện tử VAT & giao tận phòng.' },
];

export function OmsPipelineSimulator() {
  const { navigateToPage, openDrawer } = useGearForgeStore();
  const [activeIdx, setActiveIdx] = useState(0);
  const [running, setRunning] = useState(false);
  const timerRef = useRef<number | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  const runPreview = () => {
    if (running) return;
    setRunning(true);
    let idx = 0;
    const tick = () => {
      if (!mountedRef.current) return;
      setActiveIdx(idx);
      idx += 1;
      if (idx < SERVICE_STEPS.length) timerRef.current = window.setTimeout(tick, 750);
      else setRunning(false);
    };
    timerRef.current = window.setTimeout(tick, 120);
  };

  return (
    <div className="gf-sim-box">
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <span className="gf-live-badge"><i /> Cam kết dịch vụ GearForge ĐHQG-HCM</span>
          <h3 style={{ margin: '10px 0 4px', fontFamily: "'Be Vietnam Pro', sans-serif", fontSize: 22, fontWeight: 800 }}>
            Quy Trình Kiểm Định, Giao KTX 2h &amp; Bảo Hành 4 Bước
          </h3>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <button type="button" className="gf-act-btn is-primary" disabled={running} onClick={runPreview}>
            ▶ Xem quy trình
          </button>
          <button type="button" className="gf-act-btn" onClick={() => openDrawer('installment')}>
            Tính trả góp 0%
          </button>
          <button type="button" className="gf-act-btn" onClick={() => navigateToPage('shop')}>
            Chọn sản phẩm →
          </button>
        </div>
      </div>

      <div className="gf-sim-steps">
        {SERVICE_STEPS.map((st, idx) => {
          const cls = idx < activeIdx || (!running && activeIdx === 3 && idx === 3)
            ? 'is-done' : idx === activeIdx && running ? 'is-running' : idx === activeIdx ? 'is-done' : '';
          return (
            <button
              key={st.id}
              type="button"
              onClick={() => !running && setActiveIdx(idx)}
              className={`gf-sim-step ${cls}`}
              style={{ textAlign: 'left', cursor: 'pointer' }}
            >
              <div style={{ fontSize: 13.5, fontWeight: 800, color: '#0f172a' }}>{st.title}</div>
              <div style={{ fontSize: 12.5, color: '#475569', marginTop: 6, lineHeight: 1.45 }}>{st.detail}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
