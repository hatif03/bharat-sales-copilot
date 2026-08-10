import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { InteractionAnalysis } from "./schema";

const STATUS_BY_ACTION: Record<InteractionAnalysis["next_best_action"], string> = {
  book_demo: "meeting_booked",
  send_brochure: "nurturing",
  schedule_callback: "qualifying",
  nurture: "nurturing",
  escalate: "escalated",
};

export interface ApplyAnalysisResult {
  status: string;
  escalationId: string | null;
}

/**
 * Steps 4-8 of the autonomous loop, given an already-produced analysis:
 * write brain entries, update the lead's score/status/pipeline stage,
 * escalate to a human when warranted, or schedule the first autonomous
 * follow-up otherwise.
 */
export async function applyAnalysis(params: {
  leadId: string;
  verticalId: string | null;
  analysis: InteractionAnalysis;
}): Promise<ApplyAnalysisResult> {
  const { leadId, verticalId, analysis } = params;
  const supabase = getSupabaseServerClient();
  const status = STATUS_BY_ACTION[analysis.next_best_action];

  if (analysis.brain_entries.length > 0 && verticalId) {
    const { error } = await supabase.from("brain_entries").insert(
      analysis.brain_entries.map((entry) => ({
        vertical_id: verticalId,
        lead_id: leadId,
        category: entry.category,
        text: entry.text,
        quote: entry.quote,
        source: "transcript" as const,
      }))
    );
    if (error) throw error;
  }

  const { error: leadError } = await supabase
    .from("leads")
    .update({ lead_score: analysis.lead_score, status, pipeline_stage: status })
    .eq("id", leadId);
  if (leadError) throw leadError;

  const { error: reasoningEventError } = await supabase.from("automation_events").insert({
    lead_id: leadId,
    vertical_id: verticalId,
    step: "reasoning_pass",
    status: "completed",
    detail: { sentiment: analysis.sentiment, lead_score: analysis.lead_score, summary: analysis.summary },
  });
  if (reasoningEventError) throw reasoningEventError;

  const { error: pipelineEventError } = await supabase.from("automation_events").insert({
    lead_id: leadId,
    vertical_id: verticalId,
    step: "pipeline_updated",
    status: "completed",
    detail: { status, next_best_action: analysis.next_best_action },
  });
  if (pipelineEventError) throw pipelineEventError;

  let escalationId: string | null = null;

  if (analysis.next_best_action === "escalate") {
    const { data: escalation, error: escalationError } = await supabase
      .from("escalations")
      .insert({
        lead_id: leadId,
        vertical_id: verticalId,
        reason: analysis.escalation_reason ?? "high_buying_intent",
        context_bundle: {
          summary: analysis.summary,
          buying_signals: analysis.buying_signals,
          objections: analysis.objections,
          recommended_closing_strategy: analysis.recommended_closing_strategy,
        },
      })
      .select("id")
      .single();
    if (escalationError) throw escalationError;
    escalationId = escalation.id;

    const { error: escalatedEventError } = await supabase.from("automation_events").insert({
      lead_id: leadId,
      vertical_id: verticalId,
      step: "escalated",
      status: "completed",
      detail: { reason: analysis.escalation_reason },
    });
    if (escalatedEventError) throw escalatedEventError;
  } else {
    const { error: followUpError } = await supabase.from("follow_up_schedule").insert({
      lead_id: leadId,
      vertical_id: verticalId,
      step: "day_2_reminder",
      scheduled_for: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    });
    if (followUpError) throw followUpError;

    const { error: followUpEventError } = await supabase.from("automation_events").insert({
      lead_id: leadId,
      vertical_id: verticalId,
      step: "follow_up_scheduled",
      status: "completed",
      detail: { step: "day_2_reminder" },
    });
    if (followUpEventError) throw followUpEventError;
  }

  return { status, escalationId };
}
