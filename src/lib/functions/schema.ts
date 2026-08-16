import { z } from "zod";

/**
 * Parameters we'll ask Kipps' "API Function" to collect from the
 * conversation and pass to our webhook. Exact request wrapper shape from
 * Kipps isn't confirmed yet — the route parses this leniently and logs the
 * raw body until we've seen a real invocation.
 */
export const EscalateFunctionParams = z.object({
  reason: z.enum(["high_buying_intent", "negotiation_request", "enterprise_account"]),
  summary: z.string(),
  customer_name: z.string().optional(),
  customer_phone: z.string().optional(),
  chatbot_id: z.string().optional(),
  conversation_id: z.union([z.string(), z.number()]).optional(),
});

export type EscalateFunctionParams = z.infer<typeof EscalateFunctionParams>;

/**
 * Parameters for the EMI calculator API Function — real business-logic tool
 * call (not just a webhook log), so the agent can quote an actual monthly
 * number instead of a vague "it depends" during the conversation.
 */
export const CalculateEmiParams = z.object({
  // Coerced, not a strict number: Kipps' API Function wire format for
  // numeric attributes isn't confirmed to send a JSON number vs. a numeric
  // string, so accept either rather than fail the first live call on it.
  system_cost: z.coerce.number().positive(),
  subsidy_amount: z.coerce.number().nonnegative().optional(),
  down_payment: z.coerce.number().nonnegative().optional(),
  tenure_months: z.coerce.number().int().positive(),
  annual_interest_rate: z.coerce.number().positive().optional(),
  customer_name: z.string().optional(),
  customer_phone: z.string().optional(),
});

export type CalculateEmiParams = z.infer<typeof CalculateEmiParams>;
