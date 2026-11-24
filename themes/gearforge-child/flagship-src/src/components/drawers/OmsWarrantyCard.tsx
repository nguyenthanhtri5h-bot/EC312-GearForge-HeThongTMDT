import { useEffect, useState, type FormEvent } from 'react';
import { formatVnd, useGearForgeStore } from '../../hooks/useGearForgeStore';
import type { OmsOrder } from '../../types/gearforge';

export function OmsWarrantyCard({ order }: { order: OmsOrder }) {
  const { boot } = useGearForgeStore();
  const serialList = order.serials || [];
  const firstSn = serialList[0]?.serial_number || `GF-SN-${order.orderId}`;

  const [serialNumber, setSerialNumber] = useState(firstSn);
  const [requestType, setRequestType] = useState<'WARRANTY' | 'EXCHANGE' | 'RETURN'>('WARRANTY');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [rmaFeedback, setRmaFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [showInvoice, setShowInvoice] = useState(false);

  useEffect(() => {
    setSerialNumber(firstSn);
    setRmaFeedback(null);
    setShowInvoice(false);
  }, [order.orderId, firstSn]);

  const handleWarrantySubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!serialNumber.trim() || !reason.trim() || submitting) return;

    if (!boot.ajaxUrl) {
      setRmaFeedback({
        ok: true,
        text: `Đã tiếp nhận yêu cầu hỗ trợ cho Serial ${serialNumber.trim()} (Đơn #${order.orderId}).`,
      });
      setReason('');
      return;
    }

    setSubmitting(true);
    setRmaFeedback(null);
    try {
      const payload = {
        order_id: order.orderId,
        request_type: requestType,
        serial_number: serialNumber.trim(),
        reason: reason.trim(),
      };
      let res = await fetch(`${boot.restUrl}/rma-request`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          ...(boot.restNonce ? { 'X-WP-Nonce': boot.restNonce } : {}),
        },
        body: JSON.stringify(payload),
      });
      if (res.status === 404) {
        res = await fetch(`${boot.restUrl}/warranty/request`, {
          method: 'POST',
          credentials: 'same-origin',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            ...(boot.restNonce ? { 'X-WP-Nonce': boot.restNonce } : {}),
          },
          body: new URLSearchParams({
            order_id: String(order.orderId),
            serial_number: serialNumber.trim(),
            reason: reason.trim(),
          }).toString(),
        });
      }
      const json = await res.json();
      if (res.ok) {
        setRmaFeedback({ ok: true, text: json?.message || 'Đã tiếp nhận yêu cầu bảo hành / đổi trả.' });
        setReason('');
      } else {
        setRmaFeedback({
          ok: false,
          text: json?.error || json?.message || 'Vui lòng đăng nhập bằng tài khoản đặt đơn để gửi yêu cầu.',
        });
      }
    } catch {
      setRmaFeedback({ ok: false, text: 'Không kết nối được máy chủ. Vui lòng thử lại.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Serial bảo hành:</span>
        {serialList.length > 0 ? (
          serialList.map((sn) => (
            <button
              key={sn.serial_number}
              type="button"
              className="gf-oms-chip-btn"
              onClick={() => setSerialNumber(sn.serial_number)}
              title="Chọn số Serial này để gửi bảo hành"
            >
              {sn.serial_number}
            </button>
          ))
        ) : (
          <code className="gf-oms-sn">{firstSn}</code>
        )}
        <button
          type="button"
          className="gf-oms-chip-btn"
          style={{ marginLeft: 'auto', background: '#FEF2F2', color: '#B91C1C', borderColor: '#FECACA' }}
          onClick={() => setShowInvoice((v) => !v)}
        >
          {showInvoice ? 'Ẩn hóa đơn VAT' : 'Xem hóa đơn điện tử'}
        </button>
      </div>

      {showInvoice && (
        <div className="gf-oms-tvan-box" role="region" aria-label="Thông tin hóa đơn điện tử VAT">
          <div>
            <strong>Hóa đơn điện tử GTGT</strong> · Đơn <code>#{order.orderId}</code> · MST{' '}
            <code>0318202607</code>
          </div>
          <div style={{ marginTop: 4 }}>
            Tổng thanh toán: <strong>{formatVnd(order.total)}</strong> · Serial định danh:{' '}
            <code>{serialNumber}</code>
          </div>
          {order.invoiceUrl && (
            <div style={{ marginTop: 6 }}>
              <a
                href={order.invoiceUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#D13639', fontWeight: 700, textDecoration: 'underline' }}
              >
                Mở bản in / Tải PDF Hóa đơn →
              </a>
            </div>
          )}
        </div>
      )}

      <form className="gf-oms-search" onSubmit={(e) => void handleWarrantySubmit(e)}>
        <select
          aria-label="Loại yêu cầu hậu mãi"
          className="gf-oms-input"
          style={{ maxWidth: 132, flex: '0 0 auto' }}
          value={requestType}
          onChange={(e) => setRequestType(e.target.value as 'WARRANTY' | 'EXCHANGE' | 'RETURN')}
        >
          <option value="WARRANTY">Bảo hành</option>
          <option value="EXCHANGE">Đổi máy mới</option>
          <option value="RETURN">Hoàn trả</option>
        </select>
        <input
          type="text"
          className="gf-oms-input"
          style={{ maxWidth: 165 }}
          value={serialNumber}
          onChange={(e) => setSerialNumber(e.target.value)}
          aria-label="Mã Serial sản phẩm"
          placeholder="Mã Serial..."
          required
        />
        <input
          type="text"
          className="gf-oms-input"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          aria-label="Mô tả tình trạng máy"
          placeholder="Mô tả tình trạng cần hỗ trợ..."
          required
        />
        <button type="submit" className="gf-oms-btn" style={{ minHeight: 40, fontSize: 12.5 }} disabled={submitting}>
          {submitting ? 'Đang gửi...' : 'Gửi yêu cầu'}
        </button>
      </form>

      {rmaFeedback && (
        <div
          role="status"
          style={{
            padding: '8px 10px',
            borderRadius: 9,
            fontSize: 12.5,
            fontWeight: 700,
            background: rmaFeedback.ok ? '#ecfdf5' : '#fef2f2',
            color: rmaFeedback.ok ? '#047857' : '#b91c1c',
          }}
        >
          {rmaFeedback.text}
        </div>
      )}
    </>
  );
}
