import { getAIClient } from "@/lib/ai/client";
import { AIProviderNotConfiguredError } from "@/lib/ai/errors";
import { GeneratedVertical } from "./schema";
import { SEED_VERTICAL } from "./seed";

const SYSTEM_PROMPT = `You are the vertical-building agent inside Bharat Sales Copilot, an autonomous multilingual AI sales agent for Indian SMBs. Given a plain-English description of what a business sells and who it sells to, produce:

- name: a short, specific label for this vertical (not a generic category).
- icp: target titles/roles, company size (or "N/A" for residential/consumer), languages the customer base actually speaks (choose from Hindi, Bengali, Tamil, Telugu, Kannada, Marathi, Malayalam, English, and Hinglish as a mixed-code option — never assume English-only), target Indian states or cities, industries, and exclusions (who this vertical should NOT target).
- lead_channels: which of website, whatsapp, facebook_ads, google_ads, referral, qr_code, trade_fair are realistic inbound channels for this business, each with a one-line note on why.
- voice_persona: the tone and a short description of how the agent should sound on a call — plain-spoken, appropriate to the ICP, never generic corporate voice.
- considerations: 2-4 things you are uncertain about or that could bias this vertical if left unexamined — signal/coverage gaps, regional or language skew, seasonal effects, regulatory or pricing volatility, anything a careful human reviewer would want to sanity-check. Each is a category + one or two sentences. Be specific to this business, not generic disclaimers.

This system is inbound-first: leads arrive already carrying their own contact info (via WhatsApp, a web form, an ad click, a referral, a QR code, or a trade fair). Do not propose outbound contact-list scraping or enrichment as a lead channel.`;

export async function generateVertical(
  whatYouSell: string,
  whoYouSellTo: string
): Promise<GeneratedVertical> {
  try {
    return await getAIClient().reason({
      system: SYSTEM_PROMPT,
      prompt: `What we sell: ${whatYouSell}\n\nWho we sell to: ${whoYouSellTo}`,
      schema: GeneratedVertical,
    });
  } catch (err) {
    if (err instanceof AIProviderNotConfiguredError) {
      return SEED_VERTICAL;
    }
    throw err;
  }
}
