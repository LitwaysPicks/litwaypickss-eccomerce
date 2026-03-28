import { createClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client.
 *
 * Bypasses Row-Level Security — use only for server-side admin operations
 * (e.g. cleaning up orphaned auth records on signup failure).
 *
 * NEVER expose this client or its key to the browser.
 * NEVER import this file from client components.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
