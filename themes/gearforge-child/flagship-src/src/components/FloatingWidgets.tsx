import { useEffect, useRef, useState } from 'react';
import {
  apiSendAiChat,
  CHAT_INITIAL_MESSAGE,
  type ChatMessage,
  type ChatSuggestedAction,
} from '../hooks/chatApi';
import { useGearForgeStore } from '../hooks/useGearForgeStore';
import { CrestIcon } from './BrandLogo';
import { ChatMessageList } from './chat/ChatMessageList';

export function FloatingWidgets() {
  const { boot, chatOpen, setChatOpen, openDrawer, navigateToPage, pageMode, addToCart, setQuickViewProduct } = useGearForgeStore();
  const [showBubble, setShowBubble] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([CHAT_INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [interactionId, setInteractionId] = useState<string | null>(null);
  const [aiMode, setAiMode] = useState<'ready' | 'gemini' | 'fallback'>('ready');
  const scrollRef = useRef<HTMLDivElement | null>(null);

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

  useEffect(() => {
    if (!chatOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setChatOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [chatOpen, setChatOpen]);

  useEffect(() => {
    if (chatOpen && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatOpen, messages, loading]);

  const handleRunAction = (action: ChatSuggestedAction) => {
    setChatOpen(false);
    if (action === 'installment') openDrawer('installment');
    else if (action === 'oms') navigateToPage('tracking');
    else if (action === 'compare') navigateToPage('compare');
    else if (action === 'ecosystem') navigateToPage('ecosystem');
    else navigateToPage('shop', { page: 1 });
  };

  const handleReset = () => {
    if (loading) return;
    setMessages([CHAT_INITIAL_MESSAGE]);
    setInteractionId(null);
    setAiMode('ready');
    setInput('');
  };

  const sendMessage = async (rawText: string) => {
    const clean = rawText.trim();
    if (!clean || loading) return;

    const userMsg: ChatMessage = { id: `u-${Date.now()}`, from: 'user', text: clean };
    const history = messages
      .filter((m) => m.id !== CHAT_INITIAL_MESSAGE.id)
      .slice(-6)
      .map((m) => ({ role: (m.from === 'bot' ? 'assistant' : 'user') as 'assistant' | 'user', text: m.text }));

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await apiSendAiChat(boot, { message: clean, history, interactionId });
      if (res.interactionId) setInteractionId(res.interactionId);
      setAiMode(res.mode === 'gemini' ? 'gemini' : 'fallback');
      setMessages((prev) => [
        ...prev,
        {
          id: `b-${Date.now()}`,
          from: 'bot',
          text: res.reply,
          products: res.products,
          suggestedAction: res.suggestedAction,
          followUps: res.followUps,
          mode: res.mode,
        },
      ]);
    } catch (err) {
      const errText = err instanceof Error ? err.message : 'Không thể kết nối GearForge AI.';
      setMessages((prev) => [
        ...prev,
        {
          id: `e-${Date.now()}`,
          from: 'bot',
          text: `${errText} Bạn có thể thử lại hoặc mở thẳng kho sản phẩm bên dưới.`,
          suggestedAction: 'shop',
          followUps: ['Thử tìm Laptop RTX 4060', 'Tính trả góp 0% .edu.vn'],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const statusLabel = aiMode === 'fallback' ? 'Trợ lý kho 590+ máy' : 'Trực tuyến · Tư vấn 24/7';

  return (
    <>
      {chatOpen && (
        <div className="mc-panel" role="dialog" aria-label="Trợ lý tư vấn GearForge AI">
          <div className="mc-panel-head">
            <span className="mc-avatar">
              <CrestIcon size={22} />
            </span>
            <div className="mc-head-copy">
              <div className="title">GearForge AI · Trợ lý chọn máy</div>
              <div className="status">
                <span className={`mc-status-dot ${aiMode === 'fallback' ? 'is-fallback' : ''}`} aria-hidden="true" />
                {statusLabel}
              </div>
            </div>
            <div className="mc-head-actions">
              <button
                type="button"
                className="mc-head-btn"
                onClick={handleReset}
                disabled={loading}
                aria-label="Xóa đoạn chat"
                title="Bắt đầu hội thoại mới"
              >
                ↺
              </button>
              <button type="button" className="close-btn" onClick={() => setChatOpen(false)} aria-label="Đóng chat">
                ✕
              </button>
            </div>
          </div>

          <div className="mc-subheader">
            <span>Hỗ trợ sinh viên ĐHQG-HCM · Trả góp 0%</span>
            <button type="button" onClick={() => { setChatOpen(false); navigateToPage('ecosystem'); }}>
              Chọn theo ngành →
            </button>
          </div>

          <div className="mc-messages" ref={scrollRef}>
            <ChatMessageList
              messages={messages}
              loading={loading}
              onQuickView={(p) => { setChatOpen(false); setQuickViewProduct(p); }}
              onAddToCart={(pid) => { void addToCart(pid, 1); }}
              onInstallment={(pid) => { setChatOpen(false); openDrawer('installment', pid); }}
              onRunAction={handleRunAction}
              onFollowUp={(fq) => { void sendMessage(fq); }}
            />
          </div>

          <div className="mc-composer">
            <input
              type="text"
              aria-label="Nhập câu hỏi hoặc nhu cầu cấu hình"
              placeholder="Hỏi cấu hình, ngân sách 25tr, trả góp..."
              value={input}
              disabled={loading}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  void sendMessage(input);
                }
              }}
            />
            <button type="button" disabled={loading || !input.trim()} onClick={() => void sendMessage(input)}>
              {loading ? '...' : 'Gửi'}
            </button>
          </div>
        </div>
      )}

      {(showBubble || chatOpen) && (
        <button
          type="button"
          className="mc-bubble"
          aria-expanded={chatOpen}
          aria-label={chatOpen ? 'Đóng trợ lý tư vấn' : 'Mở trợ lý tư vấn GearForge AI'}
          onClick={() => setChatOpen(!chatOpen)}
        >
          <CrestIcon size={26} />
        </button>
      )}
    </>
  );
}
