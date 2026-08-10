import { getSupabaseServerClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/PageHeader";

export const dynamic = "force-dynamic";

function StatusRow({ label, connected, detail }: { label: string; connected: boolean; detail?: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-sm last:border-0">
      <div>
        <div className="font-body-md text-body-md text-primary">{label}</div>
        {detail && <div className="font-body-sm text-body-sm text-secondary">{detail}</div>}
      </div>
      <span
        className={`rounded-full px-sm py-0.5 font-label-caps text-label-caps uppercase ${
          connected ? "bg-success text-neutral" : "bg-danger text-neutral"
        }`}
      >
        {connected ? "Connected" : "Not configured"}
      </span>
    </div>
  );
}

export default async function SettingsPage() {
  const supabase = getSupabaseServerClient();
  const { count: shieldEvents } = await supabase.from("shield_log").select("*", { count: "exact", head: true });
  const { count: quarantined } = await supabase
    .from("shield_log")
    .select("*", { count: "exact", head: true })
    .eq("verdict", "quarantined");

  return (
    <div>
      <PageHeader eyebrow="Configure" title="Settings" subtitle="Integration status and the security shield." />

      <div className="mb-md rounded-md border border-border bg-surface p-md">
        <div className="mb-sm font-label-caps text-label-caps tracking-label-caps uppercase text-secondary">
          Integrations
        </div>
        <StatusRow label="Supabase" connected={Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL)} />
        <StatusRow
          label="Anthropic (reasoning + shield classifier)"
          connected={Boolean(process.env.ANTHROPIC_API_KEY)}
          detail="Sonnet 5 for reasoning, Haiku 4.5 for fast classification"
        />
        <StatusRow
          label="Kipps.AI (Voice Agent + Chat Agent)"
          connected={Boolean(process.env.KIPPS_API_KEY)}
        />
        <StatusRow label="Gmail (secondary follow-up)" connected={Boolean(process.env.GMAIL_CLIENT_ID)} />
      </div>

      <div className="rounded-md border border-border bg-surface p-md">
        <div className="mb-sm font-label-caps text-label-caps tracking-label-caps uppercase text-secondary">
          Security shield
        </div>
        <p className="font-body-md text-body-md text-secondary">
          Every call transcript, chat message, and document excerpt is screened before it reaches the reasoning
          prompt — regex layer first, then a Haiku classifier.
        </p>
        <div className="mt-sm grid grid-cols-2 gap-md">
          <div>
            <div className="font-headline-md text-headline-md text-primary">{shieldEvents ?? 0}</div>
            <div className="font-label-caps text-label-caps uppercase text-secondary">Total screened</div>
          </div>
          <div>
            <div className="font-headline-md text-headline-md text-danger">{quarantined ?? 0}</div>
            <div className="font-label-caps text-label-caps uppercase text-secondary">Quarantined</div>
          </div>
        </div>
      </div>
    </div>
  );
}
