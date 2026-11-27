import React from 'react';
import type { ChatMessage, ChatSuggestedAction } from '../../hooks/chatApi';
import { formatVnd } from '../../hooks/useGearForgeStore';
import type { GearForgeProduct } from '../../types/gearforge';

interface ChatMessageListProps {
  messages: ChatMessage[];
  loading: boolean;
  onQuickView: (product: GearForgeProduct) => void;
  onAddToCart: (productId: number) => void;
  onInstallment: (productId: number) => void;
  onRunAction: (action: ChatSuggestedAction) => void;
  onFollowUp: (prompt: string) => void;
}

const ACTION_LABELS: Record<Exclude<ChatSuggestedAction, 'none'>, string> = {
  shop: 'Mở kho 590+ sản phẩm →',
  installment: 'Tính & Nộp hồ sơ 0% →',
  oms: 'Tra cứu đơn & S/N →',
  compare: 'So sánh cấu hình →',
  ecosystem: 'Chọn máy theo ngành ĐHQG →',
};

function renderInlineBold(text: string, keyPrefix: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return <strong key={`${keyPrefix}-b-${idx}`}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return <code key={`${keyPrefix}-c-${idx}`} className="mc-inline-code">{part.slice(1, -1)}</code>;
    }
    return <React.Fragment key={`${keyPrefix}-t-${idx}`}>{part}</React.Fragment>;
  });
}

function renderFormattedText(text: string): React.ReactNode {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) {
      return <div key={`sp-${i}`} className="mc-line-gap" />;
    }
    if (/^[-•*]\s+/.test(trimmed)) {
      const content = trimmed.replace(/^[-•*]\s+/, '');
      return (
        <div key={`li-${i}`} className="mc-bullet">
          <span className="mc-bullet-dot" aria-hidden="true">•</span>
          <span>{renderInlineBold(content, `li-${i}`)}</span>
        </div>
      );
    }
    return (
      <p key={`p-${i}`} className="mc-line">
        {renderInlineBold(trimmed, `p-${i}`)}
      </p>
    );
  });
}

function ChatProductCard({
  product,
  onQuickView,
  onAddToCart,
  onInstallment,
}: {
  product: GearForgeProduct;
  onQuickView: (product: GearForgeProduct) => void;
  onAddToCart: (productId: number) => void;
  onInstallment: (productId: number) => void;
}) {
  const specLine = [product.specs?.cpu, product.specs?.ram, product.specs?.gpu]
    .filter(Boolean)
    .slice(0, 3)
    .join(' · ');
  const m3 = product.monthly3m && product.monthly3m > 0
    ? product.monthly3m
    : Math.round(product.price / 3);

  return (
    <div className="mc-card">
      <div className="mc-card-top">
        <img src={product.image} alt={product.name} className="mc-card-img" loading="lazy" />
        <div className="mc-card-info">
          <div className="mc-card-name" title={product.name}>{product.name}</div>
          {specLine && <div className="mc-card-meta">{specLine}</div>}
          <div className="mc-card-price-row">
            <span className="mc-card-price">{formatVnd(product.price)}</span>
            {product.price >= 3000000 && (
              <span className="mc-card-m3">0%/3th: {formatVnd(m3)}</span>
            )}
          </div>
        </div>
      </div>
      <div className="mc-card-btns">
        <button type="button" onClick={() => onQuickView(product)}>Xem nhanh</button>
        <button type="button" onClick={() => onAddToCart(product.id)}>+ Giỏ</button>
        {product.price >= 3000000 && (
          <button type="button" className="is-accent" onClick={() => onInstallment(product.id)}>
            Trả góp 0%
          </button>
        )}
      </div>
    </div>
  );
}

export function ChatMessageList({
  messages,
  loading,
  onQuickView,
  onAddToCart,
  onInstallment,
  onRunAction,
  onFollowUp,
}: ChatMessageListProps) {
  let lastBotIdx = -1;
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    if (messages[i].from === 'bot') {
      lastBotIdx = i;
      break;
    }
  }

  return (
    <>
      {messages.map((m, idx) => (
        <div key={m.id} className={`mc-msg-wrap ${m.from}`}>
          <div className={`mc-msg ${m.from}`}>
            {m.from === 'bot' ? renderFormattedText(m.text) : m.text}
          </div>

          {m.from === 'bot' && m.products && m.products.length > 0 && (
            <div className="mc-products">
              {m.products.map((p) => (
                <ChatProductCard
                  key={`${m.id}-${p.id}`}
                  product={p}
                  onQuickView={onQuickView}
                  onAddToCart={onAddToCart}
                  onInstallment={onInstallment}
                />
              ))}
            </div>
          )}

          {m.from === 'bot' && m.suggestedAction && m.suggestedAction !== 'none' && (
            <button
              type="button"
              className="mc-cta-btn"
              onClick={() => onRunAction(m.suggestedAction!)}
            >
              {ACTION_LABELS[m.suggestedAction]}
            </button>
          )}

          {m.from === 'bot' && idx === lastBotIdx && m.followUps && m.followUps.length > 0 && !loading && (
            <div className="mc-chips">
              {m.followUps.map((fq) => (
                <button
                  key={`${m.id}-fq-${fq}`}
                  type="button"
                  className="mc-chip"
                  onClick={() => onFollowUp(fq)}
                >
                  {fq}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}

      {loading && (
        <div className="mc-msg-wrap bot">
          <div className="mc-msg bot mc-typing" aria-label="GearForge AI đang trả lời">
            <span />
            <span />
            <span />
          </div>
        </div>
      )}
    </>
  );
}
