import { getSupabaseServerClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/PageHeader";

export const dynamic = "force-dynamic";

const STATUS_BADGE: Record<string, string> = {
  open: "bg-danger text-neutral",
  claimed: "bg-info text-neutral",
  resolved: "bg-success text-neutral",
};

const REASON_LABEL: Record<string, string> = {
  high_buying_intent: "High buying intent",
  negotiation_request: "Negotiation request",
  enterprise_account: "Enterprise account",
};

export default async function EscalationsPage() {
  const supabase = getSupabaseServerClient();
  const { data: escalations } = await supabase
    .from("escalations")
    .select("id, reason, status, context_bundle, created_at, leads(name, phone, city)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <PageHeader
        eyebrow="Human handoff"
        title="Escalations"
        subtitle="High buying intent, negotiation requests, or enterprise accounts — routed to a human with full context, nothing to repeat."
      />

      {escalations && escalations.length > 0 ? (
        <div className="flex flex-col gap-md">
          {escalations.map((escalation) => {
            const bundle = escalation.context_bundle as {
              summary?: string;
              buying_signals?: string[];
              objections?: string[];
              recommended_closing_strategy?: string | null;
            };
            return (
              <div key={escalation.id} className="rounded-md border border-border bg-surface p-md">
                <div className="mb-sm flex items-center justify-between">
                  <div>
                    <div className="font-headline-sm text-headline-sm text-primary">
                      {escalation.leads?.name ?? "Unknown lead"}
                    </div>
                    <div className="font-body-sm text-body-sm text-secondary">
                      {escalation.leads?.phone} · {escalation.leads?.city ?? "—"}
                    </div>
                  </div>
                  <div className="flex items-center gap-sm">
                    <span className="rounded-full bg-tertiary px-sm py-0.5 font-label-caps text-label-caps uppercase text-primary">
                      {REASON_LABEL[escalation.reason] ?? escalation.reason}
                    </span>
                    <span
                      className={`rounded-full px-sm py-0.5 font-label-caps text-label-caps uppercase ${
                        STATUS_BADGE[escalation.status] ?? "bg-neutral text-primary"
                      }`}
                    >
                      {escalation.status}
                    </span>
                  </div>
                </div>
                {bundle?.summary && <p className="mb-xs font-body-md text-body-md text-primary">{bundle.summary}</p>}
                <div className="grid grid-cols-1 gap-md sm:grid-cols-2">
                  {bundle?.buying_signals && bundle.buying_signals.length > 0 && (
                    <div>
                      <div className="font-label-caps text-label-caps uppercase text-secondary">Buying signals</div>
                      <ul className="list-inside list-disc font-body-sm text-body-sm text-primary">
                        {bundle.buying_signals.map((signal, i) => (
                          <li key={i}>{signal}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {bundle?.objections && bundle.objections.length > 0 && (
                    <div>
                      <div className="font-label-caps text-label-caps uppercase text-secondary">Objections</div>
                      <ul className="list-inside list-disc font-body-sm text-body-sm text-primary">
                        {bundle.objections.map((objection, i) => (
                          <li key={i}>{objection}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                {bundle?.recommended_closing_strategy && (
                  <p className="mt-xs border-l-4 border-highlight pl-sm font-body-sm text-body-sm text-primary">
                    {bundle.recommended_closing_strategy}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="font-body-md text-body-md text-secondary">
          No escalations yet. High-intent leads land here automatically after the reasoning pass.
        </p>
      )}
    </div>
  );
}
