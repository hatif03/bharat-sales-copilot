import { getSupabaseServerClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/PageHeader";

export const dynamic = "force-dynamic";

const CATEGORY_BADGE: Record<string, string> = {
  landed_angle: "bg-success text-neutral",
  failed_angle: "bg-danger text-neutral",
  recurring_objection: "bg-tertiary text-primary",
  commitment: "bg-info text-neutral",
  deal_killer: "bg-danger text-neutral",
  profile_to_chase: "bg-success text-neutral",
  profile_to_avoid: "bg-danger text-neutral",
};

export default async function KnowledgePage() {
  const supabase = getSupabaseServerClient();
  const { data: entries } = await supabase
    .from("brain_entries")
    .select("id, category, text, quote, source, weight, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div>
      <PageHeader
        eyebrow="What the brain learned"
        title="Knowledge"
        subtitle="What the agent learned. Powers every playbook and follow-up. Grows after every call and chat."
      />

      {entries && entries.length > 0 ? (
        <div className="grid grid-cols-1 gap-md sm:grid-cols-2">
          {entries.map((entry) => (
            <div key={entry.id} className="rounded-md border border-border bg-surface p-md">
              <div className="mb-xs flex items-center justify-between">
                <span
                  className={`rounded-full px-sm py-0.5 font-label-caps text-label-caps uppercase ${
                    CATEGORY_BADGE[entry.category] ?? "bg-neutral text-primary"
                  }`}
                >
                  {entry.category.replaceAll("_", " ")}
                </span>
                <span className="font-label-caps text-label-caps text-secondary">w {entry.weight.toFixed(1)}</span>
              </div>
              <p className="font-body-md text-body-md text-primary">{entry.text}</p>
              {entry.quote && (
                <p className="mt-xs font-body-sm italic text-body-sm text-secondary">&quot;{entry.quote}&quot;</p>
              )}
              <p className="mt-xs font-label-caps text-label-caps uppercase text-secondary">{entry.source}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="font-body-md text-body-md text-secondary">
          No brain entries yet. They&apos;re written automatically after every call and chat the reasoning pass analyzes.
        </p>
      )}
    </div>
  );
}
