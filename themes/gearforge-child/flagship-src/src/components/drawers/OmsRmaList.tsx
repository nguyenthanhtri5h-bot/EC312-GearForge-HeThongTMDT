export interface RmaEntry {
  rma_id: number;
  request_type: string;
  serial_number: string;
  reason: string;
  status: string;
  created_at: string;
}

export function OmsRmaList({ entries }: { entries: RmaEntry[] }) {
  if (entries.length === 0) return null;

  return (
    <div style={{ display: 'grid', gap: 6, marginTop: 4 }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: '#27272A' }}>
        Lịch sử Bảo hành / Đổi trả (RMA):
      </span>
      {entries.map((r) => (
        <div
          key={r.rma_id}
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            gap: 6,
            padding: '6px 10px',
            borderRadius: 6,
            background: '#F5F4F0',
            border: '1px solid #DFDEDC',
            fontSize: 12,
          }}
        >
          <span>
            <strong>#{r.rma_id}</strong> ({r.request_type}) · <code>{r.serial_number}</code> — {r.reason}
          </span>
          <strong style={{ color: '#D13639' }}>{r.status}</strong>
        </div>
      ))}
    </div>
  );
}
