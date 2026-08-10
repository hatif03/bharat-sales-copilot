import { getSupabaseServerClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/PageHeader";
import { LiveAutomationFeed } from "@/components/LiveAutomationFeed";

export const dynamic = "force-dynamic";

export default async function IntelligencePage() {
  const supabase = getSupabaseServerClient();
  const { data: events } = await supabase
    .from("automation_events")
    .select("id, step, status, detail, created_at")
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div>
      <PageHeader
        eyebrow="Run the agent"
        title="Intelligence"
        subtitle="Watch the autonomous loop reason through a lead — qualify, score, route, escalate — live."
      />
      <LiveAutomationFeed initialEvents={events ?? []} />
    </div>
  );
}
