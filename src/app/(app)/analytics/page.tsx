import { getSupabaseServerClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const supabase = getSupabaseServerClient();
  const { data: leads } = await supabase.from("leads").select("status");

  const byStatus = (leads ?? []).reduce<Record<string, number>>((acc, lead) => {
    acc[lead.status] = (acc[lead.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <PageHeader eyebrow="Measure" title="Analytics" subtitle="Lead outcomes by pipeline stage." />

      {Object.keys(byStatus).length > 0 ? (
        <div className="grid grid-cols-2 gap-md sm:grid-cols-4">
          {Object.entries(byStatus).map(([status, count]) => (
            <StatCard key={status} icon="●" label={status.replaceAll("_", " ")} value={count} />
          ))}
        </div>
      ) : (
        <p className="font-body-md text-body-md text-secondary">No leads yet — nothing to chart.</p>
      )}
    </div>
  );
}
