import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { analyzeInteraction } from "@/lib/reasoning/analyze";
import { applyAnalysis } from "@/lib/reasoning/apply";
import { ShieldQuarantineError } from "@/lib/shield";

const Body = z.object({
  transcript: z.string(),
  source: z.enum(["transcript", "chat", "document"]),
});

/**
 * Runs the reasoning pass (steps 4-8 of the autonomous loop) for a lead
 * given a transcript. Test-friendly today (call it directly with a
 * transcript); once real Kipps webhook payloads are confirmed, the
 * webhook receivers will call analyzeInteraction/applyAnalysis the same
 * way instead of a human posting here.
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: leadId } = await params;
  const body = Body.parse(await request.json());

  const supabase = getSupabaseServerClient();
  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .select("id, vertical_id, verticals(name, what_you_sell, who_you_sell_to)")
    .eq("id", leadId)
    .single();
  if (leadError) throw leadError;

  const vertical = lead.verticals ?? { name: "Unknown vertical", what_you_sell: "", who_you_sell_to: "" };

  let analysis;
  try {
    analysis = await analyzeInteraction({
      transcript: body.transcript,
      source: body.source,
      leadId,
      vertical: {
        name: vertical.name,
        whatYouSell: vertical.what_you_sell,
        whoYouSellTo: vertical.who_you_sell_to,
      },
    });
  } catch (err) {
    if (err instanceof ShieldQuarantineError) {
      return NextResponse.json({ error: err.message, matchedRule: err.matchedRule }, { status: 422 });
    }
    throw err;
  }

  const result = await applyAnalysis({ leadId, verticalId: lead.vertical_id, analysis });

  return NextResponse.json({ analysis, ...result });
}
