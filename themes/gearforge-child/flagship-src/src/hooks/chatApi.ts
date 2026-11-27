import type { GearForgeBoot, GearForgeProduct } from '../types/gearforge';

export type ChatSuggestedAction = 'none' | 'shop' | 'installment' | 'oms' | 'compare' | 'ecosystem';

export interface ChatMessage {
  id: string;
  from: 'bot' | 'user';
  text: string;
  products?: GearForgeProduct[];
  suggestedAction?: ChatSuggestedAction;
  followUps?: string[];
  mode?: 'gemini' | 'fallback';
}

export const CHAT_STARTER_PROMPTS = [
  'Laptop AI/Dev dưới 25tr',
  'Build PC RTX 4060',
  'Trả góp 0% .edu.vn',
  'Chính sách đổi trả 15 ngày',
];

export const CHAT_INITIAL_MESSAGE: ChatMessage = {
  id: 'welcome-0',
  from: 'bot',
  text: 'Chào bạn! Mình là **GearForge AI** — trợ lý tư vấn phần cứng từ kho 590+ cấu hình chính hãng. Bạn cần tìm Laptop/PC theo ngành học, ngân sách hay tư vấn trả góp **0% .edu.vn**?',
  followUps: CHAT_STARTER_PROMPTS,
};

export interface AiChatResponse {
  reply: string;
  products: GearForgeProduct[];
  suggestedAction: ChatSuggestedAction;
  followUps: string[];
  interactionId?: string;
  mode?: 'gemini' | 'fallback';
  model?: string;
  needsApiKey?: boolean;
}

function resolveAiChatEndpoint(boot: GearForgeBoot): string {
  const restBase = (boot.restUrl || '').trim();
  if (!restBase) {
    return '/wp-json/gf/v1/ai-chat';
  }
  const replaced = restBase.replace(/\/gearforge\/v1\/?$/, '/gf/v1/ai-chat');
  if (replaced.startsWith('http') && typeof window !== 'undefined') {
    try {
      return new URL(replaced, window.location.origin).pathname;
    } catch {
      return replaced;
    }
  }
  return replaced.endsWith('/ai-chat') ? replaced : `${replaced.replace(/\/$/, '')}/ai-chat`;
}

export async function apiSendAiChat(
  boot: GearForgeBoot,
  payload: {
    message: string;
    history: Array<{ role: 'user' | 'assistant'; text: string }>;
    interactionId?: string | null;
  }
): Promise<AiChatResponse> {
  const endpoint = resolveAiChatEndpoint(boot);
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 26000);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (boot.user?.loggedIn && boot.restNonce) {
    headers['X-WP-Nonce'] = boot.restNonce;
  }

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      credentials: 'same-origin',
      headers,
      signal: controller.signal,
      body: JSON.stringify({
        message: payload.message,
        history: payload.history.slice(-6),
        interaction_id: payload.interactionId || undefined,
      }),
    });

    const data = await res.json().catch(() => null);

    if (res.status === 429) {
      throw new Error(data?.message || 'Bạn đang gửi quá nhanh. Vui lòng đợi vài giây rồi thử lại.');
    }
    if (!res.ok) {
      throw new Error(data?.message || `Không thể kết nối GearForge AI (HTTP ${res.status}).`);
    }
    if (!data || typeof data.reply !== 'string') {
      throw new Error('Phản hồi từ trợ lý AI không hợp lệ.');
    }

    return {
      reply: data.reply,
      products: Array.isArray(data.products) ? data.products : [],
      suggestedAction: data.suggestedAction || 'none',
      followUps: Array.isArray(data.followUps) ? data.followUps : [],
      interactionId: typeof data.interactionId === 'string' ? data.interactionId : '',
      mode: data.mode === 'gemini' ? 'gemini' : 'fallback',
      model: typeof data.model === 'string' ? data.model : '',
      needsApiKey: Boolean(data.needsApiKey),
    };
  } catch (err) {
    if ((err as DOMException)?.name === 'AbortError') {
      throw new Error('Trợ lý AI phản hồi quá thời gian. Vui lòng thử lại.');
    }
    if (err instanceof Error) {
      throw err;
    }
    throw new Error('Lỗi mạng khi kết nối GearForge AI.');
  } finally {
    window.clearTimeout(timeoutId);
  }
}
