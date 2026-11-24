import { useState } from 'react';
import { NOTIS_ITEMS } from '../data/footerData';
import { VIBE_BEAR_GUIDE } from '../data/vibeAssets';
import { useGearForgeStore } from '../hooks/useGearForgeStore';

const QUICK_PROMPTS = [
  { label: 'Gợi ý Laptop AI/Dev', action: 'shop-ai' as const },
  { label: 'Tính trả góp 0%', action: 'installment' as const },
  { label: 'Áp mã BACKTOSCHOOL', action: 'coupon' as const },
];

export function FloatingWidgets() {
  const { chatOpen, setChatOpen, openDrawer, navigateToPage, applyCoupon } = useGearForgeStore();
  const [notisCollapsed, setNotisCollapsed] = useState(true);
  const [messages, setMessages] = useState<{ from: 'bot' | 'user'; text: string }[]>([
    {
      from: 'bot',
      text: 'Chào bạn! Mình là Cyber Bear GearForge. Bạn cần tìm Laptop Gaming/Dev, Build PC hay tính lịch trả góp 0% ĐHQG-HCM?',
    },
  ]);
  const [input, setInput] = useState('');

  const handleQuickPrompt = (label: string, action: 'shop-ai' | 'installment' | 'coupon') => {
    setMessages((prev) => [...prev, { from: 'user', text: label }]);
    if (action === 'shop-ai') {
      setMessages((prev) => [...prev, { from: 'bot', text: 'Mình mở ngay danh sách máy RTX 4060 / AI Dev phù hợp nhất cho bạn nhé!' }]);
      setChatOpen(false);
      navigateToPage('shop', { category: 'laptop-gaming', gpu: 'RTX 4060', page: 1 });
    } else if (action === 'installment') {
      setMessages((prev) => [...prev, { from: 'bot', text: 'Đang mở bảng ước tính trả góp 0% (3 tháng) cho sinh viên ĐHQG-HCM...' }]);
      setChatOpen(false);
      openDrawer('installment');
    } else {
      void applyCoupon('BACKTOSCHOOL');
      setMessages((prev) => [...prev, { from: 'bot', text: 'Đã kích hoạt mã BACKTOSCHOOL — giảm ngay 500.000đ cho đơn đủ điều kiện khi thanh toán!' }]);
    }
  };

  const sendText = (val: string) => {
    const clean = val.trim();
    if (!clean) return;
    setMessages((prev) => [
      ...prev,
      { from: 'user', text: clean },
      {
        from: 'bot',
        text: 'Mình đã ghi nhận câu hỏi! Bạn có thể tìm trực tiếp cấu hình theo từ khóa đó trong Cửa hàng ngay nhé.',
      },
    ]);
    setInput('');
    if (clean.length >= 2) {
      navigateToPage('shop', { search: clean, page: 1 });
    }
  };

  return (
    <>
      <div className={`notis ${notisCollapsed ? 'hide' : ''}`}>
        <div className="notis-list">
          {NOTIS_ITEMS.map((item, idx) => (
            <a key={idx} className="notis-item" href={item.href}>
              {item.img && (
                <span className="notis-img">
                  <img src={item.img} alt="" />
                </span>
              )}
              <span className="notis-title">
                <span className="notis-dot" />
                {item.text}
              </span>
            </a>
          ))}
        </div>
        <button
          type="button"
          className="notis-icon"
          aria-label="Mở bản tin ưu đãi GearForge"
          onClick={() => setNotisCollapsed((v) => !v)}
        >
          <span style={{ fontSize: 17 }}>⚡</span>
          <div className="notis-number">{NOTIS_ITEMS.length}</div>
        </button>
      </div>

      {chatOpen && (
        <div className="mc-panel" role="dialog" aria-label="Trợ lý tư vấn GearForge">
          <div className="mc-panel-head">
            <img src={VIBE_BEAR_GUIDE.aiBadge} alt="Cyber Bear GearForge" />
            <div>
              <div className="title">Cyber Bear · Trợ lý chọn máy</div>
              <div className="status">Tư vấn cấu hình &amp; Trả góp 0%</div>
            </div>
            <button type="button" className="close-btn" onClick={() => setChatOpen(false)} aria-label="Đóng chat">✕</button>
          </div>
          <div style={{ padding: '6px 12px', background: '#f4f4f5', borderBottom: '1px solid #e4e4e7', fontSize: 11.5, color: '#52525b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Hỗ trợ sinh viên ĐHQG-HCM 8h–22h</span>
            <button type="button" onClick={() => { setChatOpen(false); navigateToPage('ecosystem'); }} style={{ background: 'none', border: 0, color: '#09090b', fontWeight: 700, cursor: 'pointer', fontSize: 11.5, textDecoration: 'underline' }}>
              Chọn theo ngành →
            </button>
          </div>
          <div className="mc-messages">
            {messages.map((m, i) => (
              <div key={i} className={`mc-msg ${m.from}`}>
                {m.text}
              </div>
            ))}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
              {QUICK_PROMPTS.map((qp) => (
                <button
                  key={qp.label}
                  type="button"
                  onClick={() => handleQuickPrompt(qp.label, qp.action)}
                  style={{ fontSize: 11.5, fontWeight: 700, padding: '5px 10px', borderRadius: 99, border: '1px solid #bfdbfe', background: '#eff6ff', color: '#1d4ed8', cursor: 'pointer' }}
                >
                  {qp.label}
                </button>
              ))}
            </div>
          </div>
          <div className="mc-composer">
            <input
              type="text"
              placeholder="Gõ tên máy, RTX 4060, ngân sách..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') sendText(input); }}
            />
            <button type="button" onClick={() => sendText(input)}>Tìm</button>
          </div>
        </div>
      )}

      <button
        type="button"
        className="mc-bubble"
        aria-label={chatOpen ? 'Đóng trợ lý tư vấn' : 'Mở trợ lý tư vấn'}
        onClick={() => setChatOpen(!chatOpen)}
      >
        <img src={VIBE_BEAR_GUIDE.aiBadge} alt="Cyber Bear GearForge" />
      </button>
    </>
  );
}
