import { useEffect, useRef, useState, type FormEvent } from 'react';
import { formatVnd, useGearForgeStore } from '../hooks/useGearForgeStore';
import type { OmsOrder, OmsStep } from '../types/gearforge';
import { OmsSandboxBox } from './drawers/OmsSandboxBox';
import { OmsWarrantyCard } from './drawers/OmsWarrantyCard';
import './drawers/drawers-extra.css';

const OMS_STEPS: OmsStep[] = [
  { key: 'CREATED', label: '1. Tiếp nhận' },
  { key: 'PENDING_INSTALLMENT_APPROVAL', label: '2. Xác nhận' },
  { key: 'PROCESSING', label: '3. Kiểm máy' },
  { key: 'SERIAL_ASSIGNED', label: '4. Gắn Serial' },
  { key: 'SHIPPING', label: '5. Đang giao' },
  { key: 'DELIVERED', label: '6. Đã giao' },
  { key: 'COMPLETED', label: '7. Hoàn tất' },
];

const STATUS_VI: Record<string, string> = {
  CREATED: 'Đã tạo đơn',
  PENDING_PAYMENT: 'Chờ thanh toán',
  PENDING_INSTALLMENT_APPROVAL: 'Đang duyệt hồ sơ',
  L1_DOCS_VERIFIED: 'Đã kiểm giấy tờ',
  L2_EDU_CONFIRMED: 'Đã xác thực .edu.vn',
  APPROVED_WAITING_DOWNPAYMENT: 'Đã duyệt — Chờ trả trước',
  ACTIVE_INSTALLMENT: 'Đang trả góp 0%',
  PROCESSING: 'Đang kiểm định máy',
  SERIAL_ASSIGNED: 'Đã gắn mã bảo hành',
  SHIPPING: 'Đang giao hàng',
  DELIVERED: 'Đã giao KTX',
  COMPLETED: 'Hoàn tất',
  CANCELLED: 'Đã hủy',
  REFUNDED: 'Đã hoàn tiền',
};

export function OmsLookupPanel({ initialOrderId = 542 }: { initialOrderId?: number }) {
  const { boot, lookupOmsOrder } = useGearForgeStore();
  const [queryId, setQueryId] = useState<string>('');
  const [order, setOrder] = useState<OmsOrder | null>(() => {
    const samples = boot.sampleOrders || [];
    return samples.find((o) => o.orderId === initialOrderId) || samples[0] || null;
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const reqSeqRef = useRef(0);

  const runLookup = async (id: number) => {
    if (!id || id <= 0) {
      setErrorMsg('Vui lòng nhập mã đơn hàng hợp lệ.');
      return;
    }
    const seq = ++reqSeqRef.current;
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await lookupOmsOrder(id);
      if (seq !== reqSeqRef.current) return;
      if (res) setOrder(res);
      else setErrorMsg(`Không tìm thấy đơn #${id} hoặc bạn cần đăng nhập đúng tài khoản đặt hàng.`);
    } catch {
      if (seq === reqSeqRef.current) setErrorMsg('Lỗi kết nối khi tra cứu đơn hàng.');
    } finally {
      if (seq === reqSeqRef.current) setLoading(false);
    }
  };

  useEffect(() => {
    if (!order && initialOrderId > 0) {
      void runLookup(initialOrderId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const parsed = Number(queryId.trim());
    if (!queryId.trim() || Number.isNaN(parsed) || parsed <= 0) {
      setErrorMsg('Vui lòng nhập mã đơn hàng hợp lệ (ví dụ: 542).');
      return;
    }
    void runLookup(parsed);
  };

  const activeIdx = (() => {
    if (!order) return -1;
    if (order.status === 'PENDING_PAYMENT') return 1;
    return OMS_STEPS.findIndex((s) => s.key === order.status);
  })();
  const progressPct = activeIdx >= 0 ? Math.round(((activeIdx + 1) / OMS_STEPS.length) * 100) : 14;

  return (
    <div className="gf-oms-panel" id="gf-oms-lookup">
      <form className="gf-oms-search" onSubmit={handleSearch}>
        <label htmlFor="gf-oms-order-input" className="tc-an">Mã đơn hàng</label>
        <input
          id="gf-oms-order-input"
          type="number"
          min={1}
          className="gf-oms-input"
          placeholder="Nhập mã đơn hàng của bạn..."
          value={queryId}
          onChange={(e) => setQueryId(e.target.value)}
        />
        <button type="submit" className="gf-oms-btn" disabled={loading}>
          {loading ? 'Đang tra...' : 'Tra cứu đơn'}
        </button>
      </form>

      {errorMsg && (
        <div style={{ padding: '10px 12px', borderRadius: 10, background: '#fef2f2', color: '#b91c1c', fontSize: 13, fontWeight: 700 }}>
          {errorMsg}
        </div>
      )}

      {order && (
        <div className="gf-oms-card">
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
            <div>
              <strong style={{ fontSize: 15 }}>
                Đơn hàng #{order.orderId} · {formatVnd(order.total)}
              </strong>
              <div style={{ fontSize: 12, color: '#475569' }}>
                {order.customerName || 'Sinh viên ĐHQG-HCM'} {order.createdAt ? `· ${order.createdAt}` : ''}
              </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              <span className="gf-oms-badge">{STATUS_VI[order.status] || order.status}</span>
              {order.installment?.status && (
                <span className="gf-oms-badge" style={{ background: '#fef2f2', color: '#991b1b', borderColor: '#fca5a5' }}>
                  {STATUS_VI[order.installment.status] || order.installment.status}
                </span>
              )}
            </div>
          </div>

          <div
            className="gf-oms-track"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progressPct}
            aria-label="Tiến độ xử lý đơn hàng"
          >
            <div className="gf-oms-fill" style={{ width: `${progressPct}%` }} />
          </div>

          <div className="gf-oms-steps" role="list" aria-label="Tiến độ xử lý đơn hàng">
            {OMS_STEPS.map((st, idx) => {
              const isDone = activeIdx >= 0 && idx < activeIdx;
              const isActive = idx === activeIdx;
              return (
                <div
                  key={st.key}
                  role="listitem"
                  className={`gf-oms-step ${isDone ? 'is-done' : ''} ${isActive ? 'is-active' : ''}`}
                >
                  {st.label}
                </div>
              );
            })}
          </div>

          {order.installment && (
            <div style={{ fontSize: 12.5, color: '#334155', display: 'flex', flexWrap: 'wrap', gap: '4px 12px' }}>
              <span>Trả góp: <strong>{STATUS_VI[order.installment.status] || order.installment.status}</strong></span>
              {order.installment.monthly_amount ? (
                <span>Mỗi tháng: <strong>{formatVnd(order.installment.monthly_amount)}/th</strong></span>
              ) : null}
            </div>
          )}

          <OmsSandboxBox order={order} onOrderRefresh={runLookup} />
          <OmsWarrantyCard order={order} />
        </div>
      )}
    </div>
  );
}
