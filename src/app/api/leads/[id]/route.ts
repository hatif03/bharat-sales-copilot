import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const PIPELINE_STAGES = [
  "new",
  "qualifying",
  "nurturing",
  "meeting_booked",
  "escalated",
  "won",
  "lost",
  "not_interested",
] as const;

const Body = z.object({ pipeline_stage: z.enum(PIPELINE_STAGES) });

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = Body.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();
  const { error } = await supabase
    .from("leads")
    .update({ pipeline_stage: parsed.data.pipeline_stage, status: parsed.data.pipeline_stage })
    .eq("id", id);

  if (error) throw error;
  return NextResponse.json({ ok: true });
}
