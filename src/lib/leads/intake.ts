import { getSupabaseServerClient } from "@/lib/supabase/server";
import { screenText } from "@/lib/shield";
import type { InboundLead } from "./schema";

export interface IntakeResult {
  leadId: string;
  requirementsQuarantined: boolean;
}

/**
 * Step 1 of the autonomous loop: a new lead arrives (web form, WhatsApp,
 * ad click, referral, QR, trade fair) already carrying its own contact
 * info — this is the inbound-first model, no outbound enrichment needed.
 */
export async function intakeLead(input: InboundLead): Promise<IntakeResult> {
  const supabase = getSupabaseServerClient();

  let requirements = input.requirements ?? null;
  let requirementsQuarantined = false;
  if (requirements) {
    const shieldResult = await screenText({ source: "chat", text: requirements });
    if (shieldResult.verdict === "quarantined") {
      requirementsQuarantined = true;
      requirements = null;
    }
  }

  const { data: lead, error } = await supabase
    .from("leads")
    .insert({
      vertical_id: input.vertical_id ?? null,
      name: input.name ?? null,
      phone: input.phone,
      email: input.email ?? null,
      city: input.city ?? null,
      preferred_language: input.preferred_language ?? null,
      budget: input.budget ?? null,
      requirements,
      industry: input.industry ?? null,
      channel: input.channel,
      raw_inbound_payload: input,
    })
    .select("id")
    .single();

  if (error) throw error;

  const { error: eventError } = await supabase.from("automation_events").insert({
    lead_id: lead.id,
    vertical_id: input.vertical_id ?? null,
    step: "lead_created",
    status: "completed",
    detail: { channel: input.channel, requirements_quarantined: requirementsQuarantined },
  });
  if (eventError) throw eventError;

  return { leadId: lead.id, requirementsQuarantined };
}
