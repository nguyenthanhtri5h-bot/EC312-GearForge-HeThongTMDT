import type { OmsStep } from '../../types/gearforge';

export const OMS_STEPS: OmsStep[] = [
  { key: 'CREATED', label: '1. Tiếp nhận' },
  { key: 'PENDING_INSTALLMENT_APPROVAL', label: '2. Xác nhận' },
  { key: 'PROCESSING', label: '3. Kiểm máy' },
  { key: 'SERIAL_ASSIGNED', label: '4. Gắn Serial' },
  { key: 'SHIPPING', label: '5. Đang giao' },
  { key: 'DELIVERED', label: '6. Đã giao' },
  { key: 'COMPLETED', label: '7. Hoàn tất' },
];

export function resolveOmsStepIndex(status: string): number {
  if (status === 'PENDING_PAYMENT') return 1;
  return OMS_STEPS.findIndex((s) => s.key === status);
}

export function OmsProgressStepper({
  status,
  statusLabel,
  compact,
}: {
  status: string;
  statusLabel: string;
  compact?: boolean;
}) {
  const isException = status === 'CANCELLED' || status === 'REFUNDED';
  const activeIdx = resolveOmsStepIndex(status);
  const progressPct = isException
    ? 100
    : activeIdx >= 0
      ? Math.round(((activeIdx + 1) / OMS_STEPS.length) * 100)
      : 14;

  if (isException) {
    return (
      <div className="gf-oms-exception" role="status">
        <strong>{statusLabel}</strong>
        <span>
          {status === 'REFUNDED'
            ? 'Đơn hàng đã được hoàn tiền / đóng hồ sơ bảo hành.'
            : 'Đơn hàng đã hủy và không tiếp tục luồng giao nhận.'}
        </span>
      </div>
    );
  }

  return (
    <>
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

      {!compact && (
        <div className="gf-oms-steps" role="list" aria-label="Tiến độ xử lý đơn hàng">
          {OMS_STEPS.map((st, idx) => {
            const isDone = activeIdx >= 0 && idx < activeIdx;
            const isActive = idx === activeIdx;
            return (
              <div
                key={st.key}
                role="listitem"
                aria-current={isActive ? 'step' : undefined}
                className={`gf-oms-step ${isDone ? 'is-done' : ''} ${isActive ? 'is-active' : ''}`}
              >
                {isDone ? `✓ ${st.label}` : st.label}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
