import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { EscalateFunctionParams } from "./schema";

export interface EscalateFunctionResult {
  leadId: string;
  escalationId: string;
  message: string;
}

/**
 * Called when the chat agent invokes the "escalate" API Function mid-
 * conversation (strong buying intent / negotiation request / enterprise
 * account). Finds the lead by phone if given, otherwise creates a
 * placeholder lead so the escalation has somewhere to live, then creates
 * the escalation record exactly like the post-call reasoning pass does.
 */
export async function handleEscalateFunction(
  params: EscalateFunctionParams
): Promise<EscalateFunctionResult> {
  const supabase = getSupabaseServerClient();

  let leadId: string;
  const existing = params.customer_phone
    ? await supabase.from("leads").select("id").eq("phone", params.customer_phone).maybeSingle()
    : null;

  if (existing?.data) {
    leadId = existing.data.id;
    const { error } = await supabase
      .from("leads")
      .update({ status: "escalated", pipeline_stage: "escalated" })
      .eq("id", leadId);
    if (error) throw error;
  } else {
    const { data: created, error } = await supabase
      .from("leads")
      .insert({
        name: params.customer_name ?? null,
        phone: params.customer_phone ?? null,
        channel: "website",
        status: "escalated",
        pipeline_stage: "escalated",
      })
      .select("id")
      .single();
    if (error) throw error;
    leadId = created.id;
  }

  const { data: escalation, error: escalationError } = await supabase
    .from("escalations")
    .insert({
      lead_id: leadId,
      reason: params.reason,
      context_bundle: {
        summary: params.summary,
        source: "chat_function_call",
      },
    })
    .select("id")
    .single();
  if (escalationError) throw escalationError;

  const { error: eventError } = await supabase.from("automation_events").insert({
    lead_id: leadId,
    step: "escalated",
    status: "completed",
    detail: { reason: params.reason, source: "chat_function_call" },
  });
  if (eventError) throw eventError;

  return {
    leadId,
    escalationId: escalation.id,
    message: "Got it — a specialist will follow up with you shortly with the details.",
  };
}
