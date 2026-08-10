-- Read-only anon access for the tables the browser subscribes to over
-- Supabase Realtime (live coaching panel, automation console). Realtime's
-- postgres_changes feed respects RLS, so without a SELECT policy the anon-key
-- browser client would never see these rows even though the publication
-- includes them. Writes stay service-role-only — no INSERT/UPDATE/DELETE
-- policy is added here. This is a single-operator hackathon MVP with no
-- multi-tenant separation to enforce; revisit if the product grows
-- multi-tenant (see ROADMAP.md).

create policy "anon can read automation_events" on automation_events
  for select to anon using (true);

create policy "anon can read calls" on calls
  for select to anon using (true);

create policy "anon can read chat_messages" on chat_messages
  for select to anon using (true);
