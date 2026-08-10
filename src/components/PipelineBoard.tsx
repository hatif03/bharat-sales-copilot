"use client";

import { useState } from "react";

export interface PipelineLead {
  id: string;
  name: string | null;
  phone: string | null;
  lead_score: number | null;
  pipeline_stage: string;
}

const STAGES: { key: string; label: string }[] = [
  { key: "new", label: "New" },
  { key: "qualifying", label: "Qualifying" },
  { key: "nurturing", label: "Nurturing" },
  { key: "meeting_booked", label: "Meeting Booked" },
  { key: "escalated", label: "Escalated" },
  { key: "won", label: "Won" },
  { key: "lost", label: "Lost" },
  { key: "not_interested", label: "Not Interested" },
];

export function PipelineBoard({ initialLeads }: { initialLeads: PipelineLead[] }) {
  const [leads, setLeads] = useState(initialLeads);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);

  async function moveLead(leadId: string, stage: string) {
    setLeads((prev) => prev.map((lead) => (lead.id === leadId ? { ...lead, pipeline_stage: stage } : lead)));
    await fetch(`/api/leads/${leadId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pipeline_stage: stage }),
    });
  }

  return (
    <div className="flex gap-md overflow-x-auto pb-md">
      {STAGES.map((stage) => {
        const stageLeads = leads.filter((lead) => lead.pipeline_stage === stage.key);
        return (
          <div
            key={stage.key}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOverStage(stage.key);
            }}
            onDragLeave={() => setDragOverStage(null)}
            onDrop={(e) => {
              e.preventDefault();
              const leadId = e.dataTransfer.getData("text/lead-id");
              if (leadId) moveLead(leadId, stage.key);
              setDragOverStage(null);
            }}
            className={`w-64 flex-shrink-0 rounded-md border p-sm ${
              dragOverStage === stage.key ? "border-primary bg-[#EFE8D8]" : "border-border bg-neutral"
            }`}
          >
            <div className="mb-sm flex items-center justify-between font-label-caps text-label-caps tracking-label-caps uppercase text-secondary">
              {stage.label}
              <span className="rounded-full bg-surface px-sm py-0.5 text-primary">{stageLeads.length}</span>
            </div>
            <div className="flex flex-col gap-sm">
              {stageLeads.map((lead) => (
                <div
                  key={lead.id}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData("text/lead-id", lead.id)}
                  className="cursor-grab rounded-md border border-border bg-surface p-sm active:cursor-grabbing"
                >
                  <div className="font-body-md text-body-md text-primary">{lead.name ?? lead.phone ?? "Unknown"}</div>
                  <div className="font-body-sm text-body-sm text-secondary">
                    {lead.phone ?? "—"} · Score {lead.lead_score ?? "—"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
