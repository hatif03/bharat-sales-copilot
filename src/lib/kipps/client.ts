import { KippsAPINotConfirmedError } from "./errors";
import type {
  ChatSession,
  Chatbot,
  CreateChatbotParams,
  CreateVoicebotParams,
  Voicebot,
} from "./types";

export interface KippsClient {
  // Confirmed against the real OpenAPI spec — safe, cheap (config-only, no AI/voice usage).
  createChatbot(params: CreateChatbotParams): Promise<Chatbot>;
  listChatbots(): Promise<Chatbot[]>;
  createVoicebot(params: CreateVoicebotParams): Promise<Voicebot>;
  listVoicebots(): Promise<Voicebot[]>;

  /**
   * Mints a LiveKit room session for a chatbot — confirmed via a live test
   * (2026-08-10). The returned token/room is joined *client-side* with the
   * `livekit-client` SDK; the actual message exchange never touches our
   * backend again after this call.
   */
  createChatSession(chatbotId: string): Promise<ChatSession>;

  // NOT in the documented API surface at all — see KippsAPINotConfirmedError.
  // Kipps' Voice Agent appears to be inbound-only (someone calls a
  // Kipps-assigned number) — there is no endpoint to proactively trigger a
  // call.
  triggerVoiceCall(): Promise<never>;
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
        // Confirmed from the OpenAPI spec's securitySchemes.ApiKey
        // (in: header, name: Authorization) — the docs page's bare
        // `Api-Key: <key>` example is wrong for this API.
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
