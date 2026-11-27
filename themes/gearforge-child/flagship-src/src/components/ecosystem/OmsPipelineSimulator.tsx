import { useEffect, useRef, useState } from 'react';

const SERVICE_STEPS = [
  {
    id: 'pick',
    num: '01',
    title: 'Đặt hàng & Chọn trả góp',
    detail: 'Đặt trực tiếp hoặc gửi hồ sơ qua email .edu.vn — bảo mật dữ liệu tuyệt đối.',
  },
  {
    id: 'verify',
    num: '02',
    title: 'Xác nhận SV nhanh',
    detail: 'Đối chiếu thẻ SV ĐHQG-HCM trực tuyến, không giữ bản gốc giấy tờ.',
  },
  {
    id: 'check',
    num: '03',
    title: 'Test 30p & Gắn Serial',
    detail: 'Kỹ thuật viên stress-test tải nặng & kích hoạt bảo hành điện tử theo S/N.',
  },
  {
    id: 'deliver',
    num: '04',
    title: 'Giao KTX 2h & VAT',
    detail: 'Cài sẵn phần mềm chuyên ngành, xuất hóa đơn điện tử & giao tận phòng.',
  },
];

export function OmsPipelineSimulator() {
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
    setActiveIdx(0);
    const stepNext = (idx: number) => {
      if (!mountedRef.current) return;
      if (idx >= SERVICE_STEPS.length) {
        setRunning(false);
        return;
      }
      setActiveIdx(idx);
      timerRef.current = window.setTimeout(() => stepNext(idx + 1), 650);
    };
    timerRef.current = window.setTimeout(() => stepNext(1), 650);
  };

  return (
    <section className="gf-pipe" aria-label="Quy trình đặt hàng đến nhận máy KTX">
      <div className="gf-pipe__head">
        <div>
          <span className="gf-est-kicker">QUY TRÌNH GIAO NHẬN CHUẨN ĐHQG</span>
          <h3 className="gf-pipe__title">4 Bước Từ Lúc Đặt Đến Khi Nhận Máy</h3>
        </div>
        <button type="button" className="gf-pipe__btn" onClick={runPreview} disabled={running}>
          {running ? 'Đang chạy quy trình...' : 'Xem mô phỏng 4 bước →'}
        </button>
      </div>

      <div className="gf-pipe__grid">
        {SERVICE_STEPS.map((st, idx) => {
          const isActive = idx === activeIdx;
          return (
            <div
              key={st.id}
              role="button"
              tabIndex={0}
              className={`gf-pipe__step ${isActive ? 'is-active' : ''}`}
              onClick={() => setActiveIdx(idx)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setActiveIdx(idx);
                }
              }}
            >
              <span className="gf-est-kicker" style={{ marginBottom: 4 }}>BƯỚC {st.num}</span>
              <h4>{st.title}</h4>
              <p>{st.detail}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
