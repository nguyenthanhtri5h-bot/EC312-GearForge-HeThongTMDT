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
            gap: 8,
            padding: '10px 0',
            background: 'transparent',
            borderBottom: '1px solid #D3D1CF',
            fontSize: 12.5,
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
