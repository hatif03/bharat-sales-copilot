import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Receiver for whatever Kipps posts to a Voicebot's `webhook_url` on call
 * events. Payload shape isn't confirmed yet (see ROADMAP.md — no phone
 * number connected, no real call has happened). Logs the raw body so we
 * can see a real payload once a number is connected, then comes back to
 * map it into calls/automation_events properly.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const supabase = getSupabaseServerClient();

  const { error } = await supabase.from("automation_events").insert({
    step: "voice_call_triggered",
    status: "completed",
    detail: { raw_webhook_payload: body, source: "kipps_voice_webhook" },
  });
  if (error) throw error;

  return NextResponse.json({ ok: true });
}
