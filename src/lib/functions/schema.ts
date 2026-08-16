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
