import { KippsAPINotConfirmedError } from "./errors";
import type {
  ChatConversation,
  ChatReply,
  ChatSession,
  Chatbot,
  CreateChatbotParams,
  CreateVoicebotParams,
  Voicebot,
} from "./types";

export interface KippsClient {
  createChatbot(params: CreateChatbotParams): Promise<Chatbot>;
  listChatbots(): Promise<Chatbot[]>;
  createVoicebot(params: CreateVoicebotParams): Promise<Voicebot>;
  listVoicebots(): Promise<Voicebot[]>;

  /** Working chat path (2026-08-11): REST conversation + reply. */
  createConversation(chatbotId: string): Promise<ChatConversation>;
  sendChatReply(params: {
    chatbotId: string;
    conversationId: number;
    message: string;
  }): Promise<ChatReply>;

  /**
   * LiveKit room mint — connects, but no agent joins. Prefer createConversation
   * + sendChatReply for product chat.
   */
  createChatSession(chatbotId: string): Promise<ChatSession>;

  triggerVoiceCall(): Promise<never>;
}

function stripHtml(html: string): string {
  return html
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

class HttpKippsClient implements KippsClient {
  private readonly baseUrl = process.env.KIPPS_API_BASE_URL ?? "https://backend.kipps.ai";

  async createChatbot(params: CreateChatbotParams): Promise<Chatbot> {
    return this.request<Chatbot>("POST", "/kipps/chatbot/", params);
  }

  async listChatbots(): Promise<Chatbot[]> {
    return this.request<Chatbot[]>("GET", "/kipps/chatbot/");
  }

  async createVoicebot(params: CreateVoicebotParams): Promise<Voicebot> {
    return this.request<Voicebot>("POST", "/speech/voicebot/", params);
  }

  async listVoicebots(): Promise<Voicebot[]> {
    return this.request<Voicebot[]>("GET", "/speech/voicebot/");
  }

  async createConversation(chatbotId: string): Promise<ChatConversation> {
    const raw = await this.request<{
      id: number;
      chatbot_id: string;
    }>("POST", "/v2/kipps/conversation/", { chatbot_id: chatbotId });

    // Pull initial message from the chatbot object when available.
    let initialMessage: string | null = null;
    try {
      const bot = await this.request<Chatbot>("GET", `/kipps/chatbot/${chatbotId}/`);
      initialMessage = bot.initial_message;
    } catch {
      initialMessage = "Hi! How can I help you today?";
    }

    return {
      conversationId: raw.id,
      chatbotId: raw.chatbot_id ?? chatbotId,
      initialMessage,
    };
  }

  async sendChatReply(params: {
    chatbotId: string;
    conversationId: number;
    message: string;
  }): Promise<ChatReply> {
    const raw = await this.request<{
      success: boolean;
      reply: string;
      error?: string;
    }>("POST", "/v2/kipps/reply/", {
      chatbot_id: params.chatbotId,
      conversation_id: params.conversationId,
      message: params.message,
    });

    if (!raw.success || !raw.reply) {
      throw new Error(raw.error ?? "Kipps reply failed");
    }

    return { success: true, reply: stripHtml(raw.reply) };
  }

  async createChatSession(chatbotId: string): Promise<ChatSession> {
    const raw = await this.request<{
      livekit_token: string;
      livekit_url: string;
      conversation_id: number;
      chatbot: { id: string; name: string; initial_message: string | null };
    }>("POST", `/kipps/chatbot/${chatbotId}/session/`);

    return {
      livekitToken: raw.livekit_token,
      livekitUrl: raw.livekit_url,
      conversationId: raw.conversation_id,
      chatbot: {
        id: raw.chatbot.id,
        name: raw.chatbot.name,
        initialMessage: raw.chatbot.initial_message,
      },
    };
  }

  async triggerVoiceCall(): Promise<never> {
    throw new KippsAPINotConfirmedError("triggerVoiceCall");
  }

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const apiKey = process.env.KIPPS_API_KEY;
    if (!apiKey) throw new Error("KIPPS_API_KEY is not set.");

    const res = await fetch(this.baseUrl + path, {
      method,
      headers: {
        Authorization: `Api-Key ${apiKey}`,
        "Content-Type": "application/json",
        ...(process.env.KIPPS_ORGANIZATION_ID
          ? { "X-Organization-ID": process.env.KIPPS_ORGANIZATION_ID }
          : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      throw new Error(`Kipps API ${method} ${path} failed: ${res.status} ${await res.text()}`);
    }
    return res.json() as Promise<T>;
  }
}

let cached: KippsClient | null = null;

export function getKippsClient(): KippsClient {
  if (!cached) {
    cached = new HttpKippsClient();
  }
  return cached;
}
