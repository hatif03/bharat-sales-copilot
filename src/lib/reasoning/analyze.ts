import { getAIClient } from "@/lib/ai/client";
import { AIProviderNotConfiguredError } from "@/lib/ai/errors";
import { screenOrThrow, type ShieldSource } from "@/lib/shield";
import { InteractionAnalysis } from "./schema";

const SYSTEM_PROMPT = `You are the reasoning layer inside Bharat Sales Copilot, an autonomous multilingual AI sales agent for Indian SMBs. You are given a transcript of a customer interaction (a voice call transcript or a chat conversation) for a specific vertical, described below. Analyze it and produce:

- sentiment: the customer's overall sentiment.
- buying_signals: concrete signals of purchase intent, quoted or closely paraphrased from the transcript.
- objections: concrete objections raised, quoted or closely paraphrased.
- lead_score: 0-100, calibrated to genuine buying readiness, not politeness.
- next_best_action: book_demo (clear next step, ready to schedule), send_brochure (interested but wants more info first), schedule_callback (timing issue, not ready now), nurture (early-stage, needs time), or escalate (strong buying intent, a negotiation/pricing request, or this looks like an enterprise-scale account — any of these should go to a human).
- escalation_reason: required (non-null) only when next_best_action is "escalate" — pick the one that best matches; otherwise null.
- recommended_closing_strategy: required (non-null) only when escalating — a short, concrete note for the human rep; otherwise null.
- summary: one or two sentences a human could read cold.
- brain_entries: 0-4 durable lessons this interaction teaches for future calls in this vertical — landed_angle (a framing that worked), failed_angle (one that didn't), recurring_objection, commitment (something promised/agreed), deal_killer (a mistake or blocker), profile_to_chase or profile_to_avoid (about this customer's profile specifically, not the individual). Each needs a verbatim-or-close quote from the transcript as evidence. Skip entries you can't back with a quote.`;

/**
 * Step 4 of the autonomous loop: after every interaction, reason about
 * what happened. The transcript is screened by the shield before it ever
 * reaches this prompt.
 */
export async function analyzeInteraction(params: {
  transcript: string;
  vertical: { name: string; whatYouSell: string; whoYouSellTo: string };
  source: ShieldSource;
  leadId?: string;
}): Promise<InteractionAnalysis> {
  await screenOrThrow({ source: params.source, text: params.transcript, leadId: params.leadId });

  try {
    return await getAIClient().reason({
      system: SYSTEM_PROMPT,
      prompt: `Vertical: ${params.vertical.name}\nWhat we sell: ${params.vertical.whatYouSell}\nWho we sell to: ${params.vertical.whoYouSellTo}\n\nTranscript:\n${params.transcript}`,
      schema: InteractionAnalysis,
    });
  } catch (err) {
    if (err instanceof AIProviderNotConfiguredError) {
      return {
        sentiment: "neutral",
        buying_signals: [],
        objections: [],
        lead_score: 50,
        next_best_action: "nurture",
        escalation_reason: null,
        recommended_closing_strategy: null,
        summary: "No AI provider configured — this is a placeholder analysis.",
        brain_entries: [],
      };
    }
    throw err;
  }
}
