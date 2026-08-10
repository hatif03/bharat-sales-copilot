"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function VerticalForm() {
  const router = useRouter();
  const [whatYouSell, setWhatYouSell] = useState("");
  const [whoYouSellTo, setWhoYouSellTo] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/verticals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ whatYouSell, whoYouSellTo }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? `Request failed (${res.status})`);
      setSubmitting(false);
      return;
    }

    router.push("/verticals");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mb-lg rounded-md border border-border bg-surface p-md">
      <div className="mb-md">
        <label className="mb-1 block font-label-caps text-label-caps tracking-label-caps uppercase text-secondary">
          What do you sell?
        </label>
        <textarea
          required
          value={whatYouSell}
          onChange={(e) => setWhatYouSell(e.target.value)}
          rows={3}
          placeholder="e.g. Residential solar panel installation, EMI-based financing"
          className="w-full rounded-sm border border-border bg-surface px-sm py-xs font-body-md text-body-md text-primary placeholder:text-secondary"
        />
      </div>

      <div className="mb-md">
        <label className="mb-1 block font-label-caps text-label-caps tracking-label-caps uppercase text-secondary">
          Who do you sell to?
        </label>
        <textarea
          required
          value={whoYouSellTo}
          onChange={(e) => setWhoYouSellTo(e.target.value)}
          rows={3}
          placeholder="e.g. Homeowners in Tier-2/3 Indian cities looking to reduce electricity bills"
          className="w-full rounded-sm border border-border bg-surface px-sm py-xs font-body-md text-body-md text-primary placeholder:text-secondary"
        />
      </div>

      {error && <p className="mb-md font-body-sm text-body-sm text-danger">{error}</p>}

      <div className="flex justify-end gap-sm">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-primary px-md py-sm font-label-caps text-label-caps uppercase text-neutral disabled:opacity-50"
        >
          {submitting ? "Generating…" : "Generate vertical →"}
        </button>
      </div>
    </form>
  );
}
