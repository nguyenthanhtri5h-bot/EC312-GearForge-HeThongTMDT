import { useEffect, useState } from 'react';
import { useGearForgeStore } from '../hooks/useGearForgeStore';
import { CrestIcon } from './BrandLogo';

const QUICK_PROMPTS = [
  { label: 'Gợi ý Laptop AI/Dev', action: 'shop-ai' as const },
  { label: 'Tính trả góp 0%', action: 'installment' as const },
  { label: 'Tra cứu đơn OMS', action: 'oms' as const },
];

export function FloatingWidgets() {
  const { chatOpen, setChatOpen, openDrawer, navigateToPage, pageMode } = useGearForgeStore();
  const [showBubble, setShowBubble] = useState(false);

  useEffect(() => {
    const checkScroll = () => {
      const y = window.scrollY;
      const docH = document.documentElement.scrollHeight;
      const winH = window.innerHeight;
      const atFooter = docH > winH + 220 && y + winH >= docH - 260;
      const isMobile = winH > 0 && window.innerWidth <= 767;
      const minScroll = pageMode === 'showcase' ? 540 : isMobile ? 240 : 0;
      setShowBubble(y >= minScroll && !atFooter);
    };
    checkScroll();
    window.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [pageMode]);
  const [messages, setMessages] = useState<{ from: 'bot' | 'user'; text: string }[]>([
    {
      from: 'bot',
      text: 'Chào bạn! Mình là GearForge AI Advisor. Bạn cần tìm Laptop Gaming/Dev, Build PC hay tính lịch trả góp 0% ĐHQG-HCM?',
    },
  ]);
  const [input, setInput] = useState('');

  useEffect(() => {
    if (!chatOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setChatOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [chatOpen, setChatOpen]);

  const handleQuickPrompt = (label: string, action: 'shop-ai' | 'installment' | 'oms') => {
    setMessages((prev) => [...prev, { from: 'user', text: label }]);
    if (action === 'shop-ai') {
      setMessages((prev) => [...prev, { from: 'bot', text: 'Mình mở ngay danh sách máy RTX 4060 / AI Dev phù hợp nhất cho bạn nhé!' }]);
      setChatOpen(false);
      navigateToPage('shop', { category: 'laptop-gaming', gpu: 'RTX 4060', page: 1 });
    } else if (action === 'installment') {
      setChatOpen(false);
      openDrawer('installment');
    } else {
      setChatOpen(false);
      navigateToPage('tracking');
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
    const kwMatch = clean.match(/\b(RTX\s*\d{4}|ASUS|ROG|Lenovo|Legion|MSI|Katana|Acer|HP|MacBook|ThinkPad|RAM|SSD|VGA|CPU|PC)\b/i);
    if (kwMatch) {
      window.setTimeout(() => {
        setChatOpen(false);
        navigateToPage('shop', { search: kwMatch[0], page: 1 });
      }, 650);
    }
  };

  return (
    <>
      {chatOpen && (
        <div className="mc-panel" role="dialog" aria-label="Trợ lý tư vấn GearForge">
          <div className="mc-panel-head">
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 38, height: 38, borderRadius: '50%', background: '#18181B', border: '1px solid rgba(209,54,57,0.45)', flexShrink: 0 }}>
              <CrestIcon size={24} />
            </span>
            <div>
              <div className="title">GearForge AI · Trợ lý chọn máy</div>
              <div className="status">Tư vấn cấu hình &amp; Trả góp 0%</div>
            </div>
            <button type="button" className="close-btn" onClick={() => setChatOpen(false)} aria-label="Đóng chat">✕</button>
          </div>
          <div style={{ padding: '6px 12px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: 11.5, color: '#475569', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Hỗ trợ sinh viên ĐHQG-HCM 8h–22h</span>
            <button type="button" onClick={() => { setChatOpen(false); navigateToPage('ecosystem'); }} style={{ background: 'none', border: 0, color: '#D13639', fontWeight: 700, cursor: 'pointer', fontSize: 11.5, textDecoration: 'underline', whiteSpace: 'nowrap', flexShrink: 0 }}>
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
                  style={{ fontSize: 11.5, fontWeight: 700, padding: '5px 10px', borderRadius: 99, border: '1px solid #fecaca', background: '#fef2f2', color: '#b91c1c', cursor: 'pointer' }}
                >
                  {qp.label}
                </button>
              ))}
            </div>
          </div>
          <div className="mc-composer">
            <input
              type="text"
              aria-label="Nhập câu hỏi hoặc từ khóa tìm máy"
              placeholder="Gõ tên máy, RTX 4060, ngân sách..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') sendText(input); }}
            />
            <button type="button" onClick={() => sendText(input)}>Tìm</button>
          </div>
        </div>
      )}

      {(showBubble || chatOpen) && (
        <button
          type="button"
          className="mc-bubble"
          aria-expanded={chatOpen}
          aria-label={chatOpen ? 'Đóng trợ lý tư vấn' : 'Mở trợ lý tư vấn'}
          onClick={() => setChatOpen(!chatOpen)}
        >
          <CrestIcon size={26} />
        </button>
      )}
    </>
  );
}
