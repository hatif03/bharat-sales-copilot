import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Receiver for whatever Kipps posts to a Chatbot's `lead_webhook_url`. The
 * exact payload shape isn't confirmed yet (see ROADMAP.md) — this logs the
 * raw body so we can see a real payload once the chat widget is live, then
 * comes back to map it into leads/chat_messages/automation_events properly.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const supabase = getSupabaseServerClient();

  const { error } = await supabase.from("automation_events").insert({
    step: "chat_sent",
    status: "completed",
    detail: { raw_webhook_payload: body, source: "kipps_chat_webhook" },
  });
  if (error) throw error;

  return NextResponse.json({ ok: true });
}
