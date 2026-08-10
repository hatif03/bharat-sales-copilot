import { getKippsClient } from "@/lib/kipps/client";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { generateVertical } from "./generate";
import type { GeneratedVertical } from "./schema";

function buildChatbotInstructions(v: GeneratedVertical): string {
  return `<role>
You are the sales chat agent for "${v.name}". ${v.voice_persona.description}
Tone: ${v.voice_persona.tone}.
</role>

<audience>
Target customers: ${v.icp.titles.join(", ")} in ${v.icp.states_or_cities.join(", ")}.
Industries: ${v.icp.industries.join(", ")}.
Do not pursue: ${v.icp.exclusions.join(", ") || "none specified"}.
</audience>

<language>
Detect the customer's language from how they write and reply in kind. Supported: ${v.icp.languages.join(", ")}. If they mix languages (Hinglish-style), match that mix rather than forcing pure English or pure Hindi.
</language>

<goal>
Qualify the lead (budget, timeline, decision-maker, location, pain points), answer product questions plainly without jargon, and identify buying intent. If they show strong buying intent or ask to negotiate price, tell them a specialist will follow up shortly.
</goal>`;
}

function buildVoicebotPrompt(v: GeneratedVertical): string {
  return `You are a voice sales agent for "${v.name}". ${v.voice_persona.description} Tone: ${v.voice_persona.tone}. Speak in the customer's language (supported: ${v.icp.languages.join(", ")}), qualify budget/timeline/decision-maker/location/pain points, and keep the call natural and unhurried.`;
}

export interface ProvisionedVertical {
  id: string;
  name: string;
  kippsChatbotId: string;
  kippsVoicebotId: string;
}

/**
 * Generates a vertical (AI, or seed fallback) and provisions the matching
 * Kipps Chatbot + Voicebot for it, then persists everything to Supabase.
 * This creates real resources in the connected Kipps account — call it
 * from an actual "Build a vertical" action, not casually/in a loop.
 */
export async function createVerticalWithKipps(
  whatYouSell: string,
  whoYouSellTo: string
): Promise<ProvisionedVertical> {
  const generated = await generateVertical(whatYouSell, whoYouSellTo);
  const kipps = getKippsClient();
  const appBaseUrl = process.env.APP_BASE_URL ?? "http://localhost:3000";

  const chatbot = await kipps.createChatbot({
    name: generated.name,
    instructions: buildChatbotInstructions(generated),
    initial_message: "Hi! How can I help you today?",
    lead_webhook_url: `${appBaseUrl}/api/webhooks/kipps-chat`,
  });

  const voicebot = await kipps.createVoicebot({
    name: generated.name,
    prompt: buildVoicebotPrompt(generated),
    user_language: generated.icp.languages[0] ?? "English",
    webhook_url: `${appBaseUrl}/api/webhooks/kipps-voice`,
  });

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("verticals")
    .insert({
      name: generated.name,
      what_you_sell: whatYouSell,
      who_you_sell_to: whoYouSellTo,
      icp: generated.icp,
      lead_channels: generated.lead_channels,
      voice_persona: generated.voice_persona,
      considerations: generated.considerations.map((c, i) => ({
        id: String(i),
        category: c.category,
        text: c.text,
        status: "pending" as const,
      })),
      kipps_chatbot_id: chatbot.id,
      kipps_voicebot_id: voicebot.id,
    })
    .select("id, name, kipps_chatbot_id, kipps_voicebot_id")
    .single();

  if (error) throw error;

  return {
    id: data.id,
    name: data.name,
    kippsChatbotId: data.kipps_chatbot_id!,
    kippsVoicebotId: data.kipps_voicebot_id!,
  };
}
