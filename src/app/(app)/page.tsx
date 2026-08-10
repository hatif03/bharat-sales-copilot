import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/PageHeader";

export const dynamic = "force-dynamic";
import { StatCard } from "@/components/StatCard";
import type { GeneratedVertical } from "@/lib/verticals/schema";

const STEP_LABEL: Record<string, string> = {
  lead_created: "Lead created",
  language_detected: "Language detected",
  voice_call_triggered: "Voice call event",
  reasoning_pass: "Reasoning pass",
  pipeline_updated: "Pipeline updated",
  chat_sent: "Chat event",
  follow_up_scheduled: "Follow-up scheduled",
  escalated: "Escalated to human",
};

export default async function DashboardPage() {
  const supabase = getSupabaseServerClient();

  const [verticals, leads, calls, chats, brainEntries, openEscalations, recentEvents, activeVerticals] =
    await Promise.all([
      supabase.from("verticals").select("*", { count: "exact", head: true }),
      supabase.from("leads").select("*", { count: "exact", head: true }),
      supabase.from("calls").select("*", { count: "exact", head: true }),
      supabase.from("chat_messages").select("*", { count: "exact", head: true }),
      supabase.from("brain_entries").select("*", { count: "exact", head: true }),
      supabase.from("escalations").select("*", { count: "exact", head: true }).eq("status", "open"),
      supabase
        .from("automation_events")
        .select("id, step, status, created_at, lead_id")
        .order("created_at", { ascending: false })
        .limit(6),
      supabase
        .from("verticals")
        .select("id, name, icp, status")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(6),
    ]);

  return (
    <div>
      <PageHeader
        eyebrow="Overview"
        title="Good day"
        subtitle="Spin up a vertical, work the queue, watch the brain learn."
        action={
          <Link
            href="/verticals?new=1"
            className="rounded-full bg-primary px-md py-sm font-label-caps text-label-caps uppercase text-neutral"
          >
            + Build a new vertical
          </Link>
        }
      />

      <div className="mb-lg grid grid-cols-2 gap-md sm:grid-cols-3 lg:grid-cols-6">
        <StatCard icon="◎" label="Verticals" value={verticals.count ?? 0} />
        <StatCard icon="☺" label="Leads" value={leads.count ?? 0} />
        <StatCard icon="📞" label="Calls" value={calls.count ?? 0} />
        <StatCard icon="💬" label="Chats" value={chats.count ?? 0} />
        <StatCard icon="🧠" label="Brain entries" value={brainEntries.count ?? 0} />
        <StatCard icon="🚩" label="Escalations" value={openEscalations.count ?? 0} />
      </div>

      <div className="grid grid-cols-1 gap-md lg:grid-cols-2">
        <div className="rounded-md border border-border bg-surface p-md">
          <div className="mb-sm flex items-center justify-between">
            <span className="font-label-caps text-label-caps tracking-label-caps uppercase text-secondary">
              Recent / Automation events
            </span>
            <Link href="/intelligence" className="font-body-sm text-body-sm text-primary">
              View all →
            </Link>
          </div>
          {recentEvents.data && recentEvents.data.length > 0 ? (
            <ul className="flex flex-col gap-xs">
              {recentEvents.data.map((event) => (
                <li key={event.id} className="flex items-center justify-between border-b border-border py-xs last:border-0">
                  <span className="font-body-sm text-body-sm text-primary">
                    {STEP_LABEL[event.step] ?? event.step}
                  </span>
                  <span className="rounded-full bg-success px-sm py-0.5 font-label-caps text-label-caps uppercase text-neutral">
                    {event.status}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="font-body-sm text-body-sm text-secondary">
              No automation runs yet. Build a vertical and a lead will kick off the loop.
            </p>
          )}
        </div>

        <div className="rounded-md border border-border bg-surface p-md">
          <div className="mb-sm flex items-center justify-between">
            <span className="font-label-caps text-label-caps tracking-label-caps uppercase text-secondary">
              Active / Your verticals
            </span>
            <Link href="/verticals" className="font-body-sm text-body-sm text-primary">
              Manage →
            </Link>
          </div>
          {activeVerticals.data && activeVerticals.data.length > 0 ? (
            <ul className="flex flex-col gap-xs">
              {activeVerticals.data.map((vertical) => {
                const icp = vertical.icp as unknown as GeneratedVertical["icp"] | null;
                return (
                  <li key={vertical.id} className="border-b border-border py-xs last:border-0">
                    <Link href={`/verticals/${vertical.id}`} className="font-body-md text-body-md text-primary">
                      {vertical.name}
                    </Link>
                    <div className="font-body-sm text-body-sm text-secondary">
                      {icp?.titles?.slice(0, 2).join(", ") ?? "—"}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="font-body-sm text-body-sm text-secondary">
              No verticals yet. Describe what you sell to build your first one.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
