import { useEffect, useRef, useState } from 'react';
import { VIBE_VIDEOS } from '../data/vibeAssets';
import { useGearForgeStore } from '../hooks/useGearForgeStore';
import { PlayIcon } from './ArrowIcon';

export function SystemVideoSection() {
  const { setVideoModalSrc } = useGearForgeStore();
  const [inspecting, setInspecting] = useState(false);
  const [inView, setInView] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const bgVidRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const sec = sectionRef.current;
    if (!sec) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.2, rootMargin: '140px' }
    );
    io.observe(sec);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const v = bgVidRef.current;
    if (!v) return;
    if (inView && !inspecting) {
      if (!v.src) v.src = VIBE_VIDEOS.labPc;
      v.muted = true;
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  }, [inView, inspecting]);

  return (
    <section
      id="gf-system"
      ref={sectionRef}
      className={`tc-pin ht ${inspecting ? 'co-vid' : ''}`}
      data-pin=""
      style={{ '--len': 150 } as React.CSSProperties}
      aria-labelledby="ht-h"
    >
      <div className="tc-pin-in">
        <div className="ht-vid">
          <video
            ref={bgVidRef}
            poster={VIBE_VIDEOS.posterLab}
            muted
            loop
            playsInline
            preload="none"
            className="ht-bg-video"
            aria-label="Video 1080p quy trình kiểm định PC & Laptop GearForge Lab"
          />

          <div
            style={{
              position: 'absolute',
              top: 22,
              right: 24,
              zIndex: 4,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 10,
              justifyContent: 'flex-end',
            }}
          >
            <button
              type="button"
              className="tc-btn tc-btn-cam"
              style={{ border: 0, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 18px', fontSize: 14 }}
              onClick={() => setVideoModalSrc(VIBE_VIDEOS.labPc)}
            >
              <PlayIcon /> Xem video phòng Lab
            </button>
            <button
              type="button"
              className="tc-btn tc-btn-vien"
              style={{ background: 'rgba(14, 10, 28, 0.84)', backdropFilter: 'blur(8px)', padding: '11px 18px', fontSize: 14 }}
              onClick={() => setInspecting((v) => !v)}
            >
              {inspecting ? '✕ Đóng quy trình' : 'Quy trình kiểm tra 4 bước'}
            </button>
          </div>

          {inspecting && (
            <div
              onClick={() => setInspecting(false)}
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 24,
                background: 'rgba(15, 23, 42, 0.86)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <div
                style={{
                  maxWidth: 680,
                  padding: 32,
                  borderRadius: 16,
                  background: '#1e293b',
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  color: '#fff',
                  textAlign: 'left',
                }}
              >
                <span style={{ fontSize: 12, fontWeight: 700, color: '#93c5fd', letterSpacing: '0.08em' }}>
                  GEARFORGE LAB · QUY TRÌNH KIỂM ĐỊNH TRƯỚC GIAO MÁY
                </span>
                <h3 style={{ margin: '10px 0 14px', fontFamily: 'var(--gf-font-display)', fontSize: 24, fontWeight: 800 }}>
                  Kiểm Tra Tải Nặng &amp; Kích Hoạt Bảo Hành Điện Tử
                </h3>
                <ul style={{ display: 'grid', gap: 8, fontSize: 15, color: '#e2e8f0', lineHeight: 1.55 }}>
                  <li>1. Kiểm tra điểm ảnh màn hình OLED/IPS &amp; đo nhiệt độ CPU/GPU trong 30 phút.</li>
                  <li>2. Gắn mã số Serial chính hãng để tra cứu bảo hành trực tuyến trọn đời máy.</li>
                  <li>3. Cài đặt sẵn phần mềm học tập (IDE, CUDA/PyTorch, Adobe) theo ngành học.</li>
                  <li>4. Xuất hóa đơn điện tử VAT hợp lệ &amp; giao nhanh 2h tới KTX Khu A/B.</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        <h2 id="ht-h" className="tc-an">
          Một dàn máy chỉ bền bỉ khi từng linh kiện được kiểm định đúng cách
        </h2>

        <div className="ht-h" aria-hidden="true">
          <span className="ht-tren">
            <span className="tc-wrap">Một dàn máy chỉ bền bỉ khi từng linh kiện</span>
          </span>
          <span className="ht-duoi">
            <span className="tc-wrap">
              được kiểm định <span className="tc-dan">đúng cách</span>
              <small>Sinh viên mua máy cần hiệu năng thật, trả góp 0% minh bạch và bảo hành S/N rõ ràng.</small>
            </span>
          </span>
        </div>
      </div>
    </section>
  );
}
