import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/PageHeader";
import { VerticalForm } from "@/components/VerticalForm";
import type { GeneratedVertical } from "@/lib/verticals/schema";

export const dynamic = "force-dynamic";

export default async function VerticalsPage({
  searchParams,
}: {
  searchParams: Promise<{ new?: string }>;
}) {
  const { new: isNew } = await searchParams;
  const supabase = getSupabaseServerClient();
  const { data: verticals } = await supabase
    .from("verticals")
    .select("id, name, icp, status, created_at")
    .order("created_at", { ascending: false });

  return (
    <div>
      <PageHeader
        eyebrow="Configure"
        title="Verticals"
        subtitle="A vertical is the agent's job description — ICP, lead channels, and how to talk when it lands a contact."
        action={
          !isNew && (
            <Link
              href="/verticals?new=1"
              className="rounded-full bg-primary px-md py-sm font-label-caps text-label-caps uppercase text-neutral"
            >
              + Build new vertical
            </Link>
          )
        }
      />

      {isNew && <VerticalForm />}

      {verticals && verticals.length > 0 ? (
        <div className="grid grid-cols-1 gap-md sm:grid-cols-2 lg:grid-cols-3">
          {verticals.map((vertical) => {
            const icp = vertical.icp as unknown as GeneratedVertical["icp"] | null;
            return (
              <Link
                key={vertical.id}
                href={`/verticals/${vertical.id}`}
                className="rounded-md border border-border bg-surface p-md"
              >
                <div className="font-headline-sm text-headline-sm text-primary">{vertical.name}</div>
                <div className="mt-1 font-body-sm text-body-sm text-secondary">
                  {icp?.titles?.join(", ") ?? "—"}
                </div>
                <span
                  className={`mt-sm inline-block rounded-full px-sm py-0.5 font-label-caps text-label-caps uppercase ${
                    vertical.status === "active" ? "bg-success text-neutral" : "bg-neutral text-primary"
                  }`}
                >
                  {vertical.status}
                </span>
              </Link>
            );
          })}
        </div>
      ) : (
        !isNew && (
          <p className="font-body-md text-body-md text-secondary">
            No verticals yet. Describe what you sell to build your first one.
          </p>
        )
      )}
    </div>
  );
}
