import { getSupabaseServerClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/PageHeader";
import { PipelineBoard } from "@/components/PipelineBoard";

export const dynamic = "force-dynamic";

export default async function PipelinePage() {
  const supabase = getSupabaseServerClient();
  const { data: leads } = await supabase
    .from("leads")
    .select("id, name, phone, lead_score, pipeline_stage")
    .order("created_at", { ascending: false });

  return (
    <div>
      <PageHeader
        eyebrow="Work"
        title="Pipeline"
        subtitle="Drag leads across stages. Internal kanban — no external CRM dependency."
      />
      <PipelineBoard initialLeads={leads ?? []} />
    </div>
  );
}
