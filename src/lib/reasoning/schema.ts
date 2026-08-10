import { z } from "zod";

export const BrainEntryCategory = z.enum([
  "landed_angle",
  "failed_angle",
  "recurring_objection",
  "commitment",
  "deal_killer",
  "profile_to_chase",
  "profile_to_avoid",
]);

export const NextBestAction = z.enum([
  "book_demo",
  "send_brochure",
  "schedule_callback",
  "nurture",
  "escalate",
]);

export const EscalationReason = z.enum([
  "high_buying_intent",
  "negotiation_request",
  "enterprise_account",
]);

export const InteractionAnalysis = z.object({
  sentiment: z.enum(["positive", "neutral", "negative"]),
  buying_signals: z.array(z.string()),
  objections: z.array(z.string()),
  lead_score: z.number().min(0).max(100),
  next_best_action: NextBestAction,
  escalation_reason: EscalationReason.nullable(),
  recommended_closing_strategy: z.string().nullable(),
  summary: z.string(),
  brain_entries: z.array(
    z.object({
      category: BrainEntryCategory,
      text: z.string(),
      quote: z.string(),
    })
  ),
});

export type InteractionAnalysis = z.infer<typeof InteractionAnalysis>;
