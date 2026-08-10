import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

/**
 * Service-role client for trusted server code only (Route Handlers, cron
 * jobs). Never import this from a Client Component — it bypasses RLS.
 */
export function getSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY — copy .env.example to .env.local and fill them in (see `npx supabase status` for local dev values)."
    );
  }

  return createClient<Database>(url, serviceRoleKey, {
    auth: { persistSession: false },
  });
}
