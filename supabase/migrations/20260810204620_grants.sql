-- Table-level GRANTs for existing and future tables in `public`. RLS still
-- gates actual row access (see the init migration and the realtime
-- read-policies migration) — a GRANT without a matching policy leaves a
-- role able to attempt the query but seeing zero rows, not able to bypass
-- RLS. service_role additionally has the bypassrls attribute, so it needs
-- the GRANT to operate at all (RLS is moot for it).

grant usage on schema public to service_role, anon, authenticated;

grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
grant select, insert, update, delete on all tables in schema public to anon, authenticated;
grant usage on all sequences in schema public to anon, authenticated;

alter default privileges in schema public grant all on tables to service_role;
alter default privileges in schema public grant all on sequences to service_role;
alter default privileges in schema public grant select, insert, update, delete on tables to anon, authenticated;
alter default privileges in schema public grant usage on sequences to anon, authenticated;
