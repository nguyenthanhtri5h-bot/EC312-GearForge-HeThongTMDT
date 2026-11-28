import { useEffect, useRef, useState, type FormEvent } from 'react';
import { formatVnd, useGearForgeStore } from '../hooks/useGearForgeStore';
import type { OmsOrder } from '../types/gearforge';
import { OmsSandboxBox } from './drawers/OmsSandboxBox';
import { OmsWarrantyCard } from './drawers/OmsWarrantyCard';
import { OMS_STEPS, OmsProgressStepper, resolveOmsStepIndex } from './oms/OmsProgressStepper';
import './drawers/drawers-extra.css';

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

export function OmsLookupPanel({
  initialOrderId = 542,
  compact = false,
  paidRedirect = false,
}: {
  initialOrderId?: number;
  compact?: boolean;
  paidRedirect?: boolean;
}) {
  const { boot, lookupOmsOrder, navigateToPage } = useGearForgeStore();
  const [queryId, setQueryId] = useState<string>('');
  const [order, setOrder] = useState<OmsOrder | null>(() => {
    const samples = boot.sampleOrders || [];
    return samples.find((o) => o.orderId === initialOrderId) || null;
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
    if (initialOrderId > 0 && order?.orderId !== initialOrderId) {
      void runLookup(initialOrderId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialOrderId]);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const parsed = Number(queryId.trim());
    if (!queryId.trim() || Number.isNaN(parsed) || parsed <= 0) {
      setErrorMsg('Vui lòng nhập mã đơn hàng hợp lệ (ví dụ: 542).');
      return;
    }
    void runLookup(parsed);
  };

  const activeIdx = order ? resolveOmsStepIndex(order.status) : -1;

  return (
    <div className="gf-oms-panel" id="gf-oms-lookup">
      <form className="gf-oms-search" onSubmit={handleSearch}>
        <label htmlFor="gf-oms-order-input" className="tc-an">Mã đơn hàng</label>
        <input
          id="gf-oms-order-input"
          type="number"
          min={1}
          className="gf-oms-input"
          placeholder="Nhập mã đơn hàng (VD: 542, 543)..."
          value={queryId}
          onChange={(e) => setQueryId(e.target.value)}
        />
        <button type="submit" className="gf-oms-btn" disabled={loading}>
          {loading ? 'Đang tra...' : 'Tra cứu đơn'}
        </button>
      </form>

      <div className="gf-oms-demo-row">
        <span>Đơn mẫu ĐHQG:</span>
        {[542, 543].map((demoId) => (
          <button
            key={demoId}
            type="button"
            className={`gf-oms-chip-btn ${order?.orderId === demoId ? 'is-active' : ''}`}
            onClick={() => {
              setQueryId(String(demoId));
              void runLookup(demoId);
            }}
          >
            #{demoId}
          </button>
        ))}
      </div>

      {paidRedirect && (
        <div className="gf-oms-paid-banner">
          <span>Đã tiếp nhận giao dịch từ cổng thanh toán. Hệ thống đang hiển thị trạng thái thực tế từ máy chủ cho đơn #{order?.orderId || initialOrderId}.</span>
          <button type="button" className="gf-oms-chip-btn" onClick={() => void runLookup(order?.orderId || initialOrderId)} disabled={loading}>
            {loading ? 'Đang cập nhật...' : 'Làm mới trạng thái'}
          </button>
        </div>
      )}

      {errorMsg && <div className="gf-oms-msg-err">{errorMsg}</div>}

      {order && (
        <div className="gf-oms-card">
          <div className="gf-oms-card-head">
            <div>
              <strong className="gf-oms-card-title">
                Đơn hàng #{order.orderId} · {formatVnd(order.total)}
              </strong>
              <div className="gf-oms-card-sub">
                {order.customerName || 'Sinh viên ĐHQG-HCM'} {order.createdAt ? `· ${order.createdAt}` : ''}
              </div>
            </div>
            <div className="gf-oms-badge-row">
              <span className="gf-oms-badge">{STATUS_VI[order.status] || order.status}</span>
              {order.installment?.status && (
                <span className="gf-oms-badge is-crimson">
                  {STATUS_VI[order.installment.status] || order.installment.status}
                </span>
              )}
            </div>
          </div>

          <OmsProgressStepper
            status={order.status}
            statusLabel={STATUS_VI[order.status] || order.status}
            compact={compact}
          />

          {compact ? (
            <div className="gf-oms-compact-foot">
              <span>
                Tiến độ hiện tại: <strong>{OMS_STEPS[activeIdx]?.label || STATUS_VI[order.status] || order.status}</strong>
                {order.installment?.monthly_amount ? ` · Góp ${formatVnd(order.installment.monthly_amount)}/th` : ''}
              </span>
              <button type="button" className="gf-oms-link-cta" onClick={() => navigateToPage('tracking')}>
                Mở 7 bước, Hóa đơn VAT &amp; Bảo hành Serial
              </button>
            </div>
          ) : (
            <>
              {order.installment && (
                <div className="gf-oms-inst-summary">
                  <span>Trả góp: <strong>{STATUS_VI[order.installment.status] || order.installment.status}</strong></span>
                  {order.installment.monthly_amount ? (
                    <span>Mỗi tháng: <strong>{formatVnd(order.installment.monthly_amount)}/th</strong></span>
                  ) : null}
                </div>
              )}

              <OmsSandboxBox order={order} onOrderRefresh={runLookup} />
              <OmsWarrantyCard order={order} />
            </>
          )}
        </div>
      )}
    </div>
  );
}
