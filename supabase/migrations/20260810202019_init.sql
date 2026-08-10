-- Bharat Sales Copilot — initial schema
-- Single-operator hackathon MVP: RLS is enabled on every table, but no
-- policies are defined for `anon`/`authenticated` — all app access goes
-- through the Supabase service-role key from trusted server code
-- (Next.js Route Handlers), never from the browser. Realtime is enabled
-- on the tables the live coaching panel and automation console subscribe to.

create extension if not exists vector;
create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- verticals — the agent's "job description" (ICP, lead channels, voice/persona)
-- ---------------------------------------------------------------------------
create table verticals (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  what_you_sell text not null,
  who_you_sell_to text not null,
  icp jsonb not null default '{}'::jsonb, -- titles, company_size, languages, states/cities, industries, exclusions
  lead_channels jsonb not null default '[]'::jsonb, -- e.g. [{"type":"whatsapp","config":{...}}, {"type":"website_form","config":{...}}]
  voice_persona jsonb not null default '{}'::jsonb, -- tone/persona description used to steer Kipps Voice/Chat + playbook copy
  considerations jsonb not null default '[]'::jsonb, -- agent self-flagged risks: [{"id","category","text","status":"pending|applied|dismissed"}]
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- playbooks — composed cold-call/qualification script per vertical + language
-- ---------------------------------------------------------------------------
create table playbooks (
  id uuid primary key default gen_random_uuid(),
  vertical_id uuid not null references verticals(id) on delete cascade,
  language text not null default 'en',
  openers jsonb not null default '[]'::jsonb, -- [{"label","trigger_condition","body"}]
  angles jsonb not null default '[]'::jsonb, -- [{"text","weight"}]
  objections jsonb not null default '[]'::jsonb, -- [{"objection","rebuttal"}]
  asks jsonb not null default '[]'::jsonb, -- [{"text","is_primary"}]
  voicemail text,
  avoid jsonb not null default '[]'::jsonb, -- ["don't ...", ...]
  source_brain_entry_ids uuid[] not null default '{}',
  composed_at timestamptz not null default now(),
  unique (vertical_id, language)
);

-- ---------------------------------------------------------------------------
-- leads — the "Lead Memory" record created the moment an inbound lead arrives
-- ---------------------------------------------------------------------------
create table leads (
  id uuid primary key default gen_random_uuid(),
  vertical_id uuid references verticals(id) on delete set null,
  name text,
  phone text,
  email text,
  city text,
  preferred_language text,
  budget text,
  requirements text,
  industry text,
  channel text not null check (channel in ('website', 'whatsapp', 'facebook_ads', 'google_ads', 'referral', 'qr_code', 'trade_fair')),
  status text not null default 'new' check (status in (
    'new', 'qualifying', 'nurturing', 'meeting_booked', 'escalated', 'won', 'lost', 'not_interested'
  )),
  lead_score numeric,
  pipeline_stage text not null default 'new',
  documents jsonb not null default '[]'::jsonb, -- [{"name","url"}]
  raw_inbound_payload jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index leads_vertical_id_idx on leads (vertical_id);
create index leads_status_idx on leads (status);
create index leads_pipeline_stage_idx on leads (pipeline_stage);

-- ---------------------------------------------------------------------------
-- calls — Kipps Voice Agent call records (transcript arrives via webhook)
-- ---------------------------------------------------------------------------
create table calls (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  vertical_id uuid references verticals(id) on delete set null,
  kipps_call_id text,
  direction text not null check (direction in ('inbound', 'outbound')),
  language text,
  status text not null default 'queued' check (status in ('queued', 'in_progress', 'completed', 'failed', 'voicemail')),
  transcript text,
  recording_url text,
  started_at timestamptz,
  ended_at timestamptz,
  duration_seconds int,
  raw_webhook_payload jsonb,
  created_at timestamptz not null default now()
);

create index calls_lead_id_idx on calls (lead_id);
create unique index calls_kipps_call_id_idx on calls (kipps_call_id) where kipps_call_id is not null;

-- ---------------------------------------------------------------------------
-- chat_messages — Kipps Chat Agent (+ Gmail) follow-up messages, both directions
-- ---------------------------------------------------------------------------
create table chat_messages (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  vertical_id uuid references verticals(id) on delete set null,
  channel text not null check (channel in ('kipps_chat', 'whatsapp', 'gmail')),
  direction text not null check (direction in ('inbound', 'outbound')),
  kipps_message_id text,
  language text,
  body text not null,
  attachments jsonb not null default '[]'::jsonb,
  sent_at timestamptz,
  raw_webhook_payload jsonb,
  created_at timestamptz not null default now()
);

create index chat_messages_lead_id_idx on chat_messages (lead_id);

-- ---------------------------------------------------------------------------
-- brain_entries — the knowledge base (landed angles, objections, deal killers, ...)
-- ---------------------------------------------------------------------------
create table brain_entries (
  id uuid primary key default gen_random_uuid(),
  vertical_id uuid not null references verticals(id) on delete cascade,
  lead_id uuid references leads(id) on delete set null,
  category text not null check (category in (
    'landed_angle', 'failed_angle', 'recurring_objection', 'commitment', 'deal_killer', 'profile_to_chase', 'profile_to_avoid'
  )),
  text text not null,
  quote text,
  source text not null check (source in ('transcript', 'brain', 'manual', 'document')),
  weight numeric not null default 1.0,
  -- Dimension picked for common embedding models (OpenAI text-embedding-3-small,
  -- Voyage-3-large); not required for MVP ranking (recency-decayed weight is
  -- plain SQL/JS), only for a future "similar entries" retrieval pass.
  embedding vector(1536),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index brain_entries_vertical_id_idx on brain_entries (vertical_id);
create index brain_entries_category_idx on brain_entries (category);
create index brain_entries_embedding_idx on brain_entries using hnsw (embedding vector_cosine_ops);

-- ---------------------------------------------------------------------------
-- escalations — human handoff bundle (idea doc "Step 7")
-- ---------------------------------------------------------------------------
create table escalations (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  vertical_id uuid references verticals(id) on delete set null,
  reason text not null check (reason in ('high_buying_intent', 'negotiation_request', 'enterprise_account')),
  context_bundle jsonb not null default '{}'::jsonb, -- conversation history refs, profile snapshot, buying signals, objections, recommended_closing_strategy
  status text not null default 'open' check (status in ('open', 'claimed', 'resolved')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index escalations_lead_id_idx on escalations (lead_id);
create index escalations_status_idx on escalations (status);

-- ---------------------------------------------------------------------------
-- shield_log — Lobster-Trap-lite prompt-injection guard, every quarantine logged
-- ---------------------------------------------------------------------------
create table shield_log (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id) on delete set null,
  source text not null check (source in ('transcript', 'chat', 'document')),
  input_excerpt text not null,
  matched_rule text not null, -- regex pattern name, or 'haiku_classifier'
  verdict text not null check (verdict in ('quarantined', 'passed')),
  created_at timestamptz not null default now()
);

create index shield_log_lead_id_idx on shield_log (lead_id);

-- ---------------------------------------------------------------------------
-- follow_up_schedule — autonomous nurture cadence (Day 2/5/9/14/20)
-- ---------------------------------------------------------------------------
create table follow_up_schedule (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  vertical_id uuid references verticals(id) on delete set null,
  step text not null check (step in (
    'day_2_reminder', 'day_5_success_story', 'day_9_limited_offer', 'day_14_call', 'day_20_final'
  )),
  scheduled_for timestamptz not null,
  status text not null default 'pending' check (status in ('pending', 'sent', 'skipped', 'cancelled')),
  created_at timestamptz not null default now()
);

create index follow_up_schedule_lead_id_idx on follow_up_schedule (lead_id);
create index follow_up_schedule_due_idx on follow_up_schedule (scheduled_for) where status = 'pending';

-- ---------------------------------------------------------------------------
-- automation_events — live event log powering the Intelligence console (Realtime)
-- ---------------------------------------------------------------------------
create table automation_events (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id) on delete set null,
  vertical_id uuid references verticals(id) on delete set null,
  step text not null check (step in (
    'lead_created', 'language_detected', 'voice_call_triggered', 'reasoning_pass',
    'pipeline_updated', 'chat_sent', 'follow_up_scheduled', 'escalated'
  )),
  status text not null default 'started' check (status in ('started', 'completed', 'failed')),
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index automation_events_created_at_idx on automation_events (created_at desc);

-- ---------------------------------------------------------------------------
-- updated_at trigger (verticals, leads, brain_entries)
-- ---------------------------------------------------------------------------
create function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger verticals_set_updated_at before update on verticals
  for each row execute function set_updated_at();
create trigger leads_set_updated_at before update on leads
  for each row execute function set_updated_at();
create trigger brain_entries_set_updated_at before update on brain_entries
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS — enabled everywhere, no anon/authenticated policies (service-role only)
-- ---------------------------------------------------------------------------
alter table verticals enable row level security;
alter table playbooks enable row level security;
alter table leads enable row level security;
alter table calls enable row level security;
alter table chat_messages enable row level security;
alter table brain_entries enable row level security;
alter table escalations enable row level security;
alter table shield_log enable row level security;
alter table follow_up_schedule enable row level security;
alter table automation_events enable row level security;

-- ---------------------------------------------------------------------------
-- Realtime — live call coaching panel + automation console subscribe to these
-- ---------------------------------------------------------------------------
alter publication supabase_realtime add table automation_events;
alter publication supabase_realtime add table calls;
alter publication supabase_realtime add table chat_messages;
