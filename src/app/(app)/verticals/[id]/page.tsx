import { notFound } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/PageHeader";
import { ChatWidget } from "@/components/ChatWidget";
import type { GeneratedVertical } from "@/lib/verticals/schema";

export const dynamic = "force-dynamic";

export default async function VerticalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = getSupabaseServerClient();
  const { data: vertical } = await supabase.from("verticals").select("*").eq("id", id).single();

  if (!vertical) notFound();

  const icp = vertical.icp as unknown as GeneratedVertical["icp"];
  const leadChannels = vertical.lead_channels as unknown as GeneratedVertical["lead_channels"];
  const voicePersona = vertical.voice_persona as unknown as GeneratedVertical["voice_persona"];
  const considerations = vertical.considerations as unknown as Array<{
    id: string;
    category: string;
    text: string;
    status: string;
  }>;

  return (
    <div>
      <PageHeader
        eyebrow="Vertical"
        title={vertical.name}
        subtitle={`${vertical.what_you_sell} → ${vertical.who_you_sell_to}`}
      />

      <div className="grid grid-cols-1 gap-md lg:grid-cols-2">
        <div className="rounded-md border border-border bg-surface p-md">
          <div className="mb-sm font-label-caps text-label-caps tracking-label-caps uppercase text-secondary">
            ICP
          </div>
          <dl className="flex flex-col gap-xs font-body-sm text-body-sm">
            <div>
              <dt className="text-secondary">Titles</dt>
              <dd className="text-primary">{icp?.titles?.join(", ") ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-secondary">Company size</dt>
              <dd className="text-primary">{icp?.company_size ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-secondary">Languages</dt>
              <dd className="text-primary">{icp?.languages?.join(", ") ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-secondary">States/cities</dt>
              <dd className="text-primary">{icp?.states_or_cities?.join(", ") ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-secondary">Industries</dt>
              <dd className="text-primary">{icp?.industries?.join(", ") ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-secondary">Exclusions</dt>
              <dd className="text-primary">{icp?.exclusions?.join(", ") || "None"}</dd>
            </div>
          </dl>
        </div>

        <div className="flex flex-col gap-md">
          <div className="rounded-md border border-border bg-surface p-md">
            <div className="mb-sm font-label-caps text-label-caps tracking-label-caps uppercase text-secondary">
              Voice &amp; persona
            </div>
            <p className="font-body-sm text-body-sm text-primary">{voicePersona?.tone}</p>
            <p className="mt-1 font-body-sm text-body-sm text-secondary">{voicePersona?.description}</p>
          </div>

          <div className="rounded-md border border-border bg-surface p-md">
            <div className="mb-sm font-label-caps text-label-caps tracking-label-caps uppercase text-secondary">
              Lead channels
            </div>
            <ul className="flex flex-col gap-xs">
              {leadChannels?.map((channel, i) => (
                <li key={i} className="font-body-sm text-body-sm">
                  <span className="text-primary">{channel.type}</span>
                  {channel.notes && <span className="text-secondary"> — {channel.notes}</span>}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-md border border-border bg-surface p-md">
            <div className="mb-sm flex items-center gap-sm font-label-caps text-label-caps tracking-label-caps uppercase text-secondary">
              Considerations
              <span className="rounded-full bg-tertiary px-sm py-0.5 text-primary">
                {considerations?.length ?? 0}
              </span>
            </div>
            <ul className="flex flex-col gap-sm">
              {considerations?.map((c) => (
                <li key={c.id} className="border-l-4 border-tertiary pl-sm">
                  <div className="font-label-caps text-label-caps uppercase text-secondary">{c.category}</div>
                  <p className="font-body-sm text-body-sm text-primary">{c.text}</p>
                </li>
              ))}
            </ul>
          </div>

          {vertical.kipps_chatbot_id && <ChatWidget chatbotId={vertical.kipps_chatbot_id} />}
        </div>
      </div>
    </div>
  );
}
