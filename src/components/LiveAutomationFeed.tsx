"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export interface AutomationEventRow {
  id: string;
  step: string;
  status: string;
  detail: unknown;
  created_at: string;
}

const STEP_LABEL: Record<string, string> = {
  lead_created: "Lead created",
  language_detected: "Language detected",
  voice_call_triggered: "Voice call event",
  reasoning_pass: "Reasoning pass",
  pipeline_updated: "Pipeline updated",
  chat_sent: "Chat event",
  follow_up_scheduled: "Follow-up scheduled",
  escalated: "Escalated to human",
};

const STATUS_BADGE: Record<string, string> = {
  completed: "bg-success text-neutral",
  started: "bg-info text-neutral",
  failed: "bg-danger text-neutral",
};

function timeAgo(iso: string): string {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function LiveAutomationFeed({ initialEvents }: { initialEvents: AutomationEventRow[] }) {
  const [events, setEvents] = useState(initialEvents);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    const channel = supabase
      .channel("automation_events_feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "automation_events" },
        (payload) => {
          setEvents((prev) => [payload.new as AutomationEventRow, ...prev].slice(0, 50));
        }
      )
      .subscribe((status) => setLive(status === "SUBSCRIBED"));

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="rounded-md border border-border bg-surface p-md">
      <div className="mb-sm flex items-center justify-between">
        <span className="font-label-caps text-label-caps tracking-label-caps uppercase text-secondary">
          Live / Agent reasoning
        </span>
        <span
          className={`flex items-center gap-1 rounded-full px-sm py-0.5 font-label-caps text-label-caps uppercase ${
            live ? "bg-success text-neutral" : "bg-neutral text-secondary"
          }`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${live ? "bg-neutral" : "bg-secondary"}`} />
          {live ? "Live" : "Connecting…"}
        </span>
      </div>

      {events.length === 0 ? (
        <p className="font-body-sm text-body-sm text-secondary">
          No events yet. Create a lead or submit a vertical to see the loop run live.
        </p>
      ) : (
        <ul className="flex flex-col gap-xs">
          {events.map((event) => (
            <li key={event.id} className="flex items-center justify-between border-b border-border py-xs last:border-0">
              <div>
                <span className="font-body-md text-body-md text-primary">
                  {STEP_LABEL[event.step] ?? event.step}
                </span>
                <span className="ml-sm font-body-sm text-body-sm text-secondary">{timeAgo(event.created_at)}</span>
              </div>
              <span
                className={`rounded-full px-sm py-0.5 font-label-caps text-label-caps uppercase ${
                  STATUS_BADGE[event.status] ?? "bg-neutral text-primary"
                }`}
              >
                {event.status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
