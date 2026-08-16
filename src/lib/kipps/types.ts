/**
 * Shapes confirmed against backend.kipps.ai (OpenAPI + live tests).
 *
 * Chat runtime: LiveKit `POST /kipps/chatbot/{id}/session/` connects a room
 * but the agent worker never joins (total_responses stays 0). The working
 * path (live-tested 2026-08-11) is REST:
 *   POST /v2/kipps/conversation/  → conversation id
 *   POST /v2/kipps/reply/         → HTML reply text
 */

export interface CreateChatbotParams {
  name: string;
  /**
   * The actual system prompt driving behavior — confirmed via a live test
   * create (2026-08-10): leaving this unset makes Kipps auto-fill a generic
   * default persona. `prompt` is a separate, mostly-inert field on the same
   * object; don't rely on it for steering behavior.
   */
  instructions?: string;
  initial_message?: string;
  /** Kipps POSTs lead-capture events here — point this at our webhook route. */
  lead_webhook_url?: string;
  knowledge_base?: string;
}

export interface Chatbot {
  id: string;
  name: string;
  prompt: string | null;
  instructions: string | null;
  initial_message: string | null;
  lead_webhook_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateVoicebotParams {
  name: string;
  prompt?: string;
  user_language?: string;
  first_message_choice?: "user" | "bot";
  /** Kipps POSTs call events here — point this at our webhook route. */
  webhook_url?: string;
  recording_enabled?: boolean;
}

export interface Voicebot {
  id: string;
  name: string;
  prompt: string | null;
  webhook_url: string | null;
  user_language: string;
}

/** LiveKit session mint — room connects, but agent worker does not join. Kept for reference. */
export interface ChatSession {
  livekitToken: string;
  livekitUrl: string;
  conversationId: number;
  chatbot: {
    id: string;
    name: string;
    initialMessage: string | null;
  };
}

/** Working REST chat — `POST /v2/kipps/conversation/`. */
export interface ChatConversation {
  conversationId: number;
  chatbotId: string;
  initialMessage: string | null;
}

/** Working REST reply — `POST /v2/kipps/reply/`. */
export interface ChatReply {
  reply: string;
  success: boolean;
}
