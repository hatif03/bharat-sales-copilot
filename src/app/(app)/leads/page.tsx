import { getSupabaseServerClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/PageHeader";

export const dynamic = "force-dynamic";

const STATUS_BADGE: Record<string, string> = {
  new: "bg-neutral text-primary",
  qualifying: "bg-info text-neutral",
  nurturing: "bg-tertiary text-primary",
  meeting_booked: "bg-success text-neutral",
  escalated: "bg-highlight text-neutral",
  won: "bg-success text-neutral",
  lost: "bg-danger text-neutral",
  not_interested: "bg-danger text-neutral",
};

export default async function LeadsPage() {
  const supabase = getSupabaseServerClient();
  const { data: leads } = await supabase
    .from("leads")
    .select("id, name, phone, city, channel, status, lead_score, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div>
      <PageHeader
        eyebrow="Make the calls"
        title="Leads"
        subtitle={`${leads?.length ?? 0} leads in the queue.`}
      />

      {leads && leads.length > 0 ? (
        <div className="overflow-x-auto rounded-md border border-border bg-surface">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border font-label-caps text-label-caps tracking-label-caps uppercase text-secondary">
                <th className="px-md py-sm">Name</th>
                <th className="px-md py-sm">Phone</th>
                <th className="px-md py-sm">City</th>
                <th className="px-md py-sm">Channel</th>
                <th className="px-md py-sm">Score</th>
                <th className="px-md py-sm">Status</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-b border-border last:border-0">
                  <td className="px-md py-sm font-body-md text-body-md text-primary">{lead.name ?? "—"}</td>
                  <td className="px-md py-sm font-body-sm text-body-sm text-secondary">{lead.phone}</td>
                  <td className="px-md py-sm font-body-sm text-body-sm text-secondary">{lead.city ?? "—"}</td>
                  <td className="px-md py-sm font-body-sm text-body-sm text-secondary">{lead.channel}</td>
                  <td className="px-md py-sm font-body-sm text-body-sm text-secondary">{lead.lead_score ?? "—"}</td>
                  <td className="px-md py-sm">
                    <span
                      className={`rounded-full px-sm py-0.5 font-label-caps text-label-caps uppercase ${
                        STATUS_BADGE[lead.status] ?? "bg-neutral text-primary"
                      }`}
                    >
                      {lead.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="font-body-md text-body-md text-secondary">
          No leads yet. They&apos;ll arrive here from the website, WhatsApp, ads, referrals, QR codes, or trade fairs.
        </p>
      )}
    </div>
  );
}
