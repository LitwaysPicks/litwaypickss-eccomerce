import { createBrowserClient } from "@supabase/ssr";

let _client;

/**
 * Returns a singleton Supabase browser client.
 *
 * `createBrowserClient` from @supabase/ssr stores auth tokens in cookies
 * (not localStorage), keeping them in sync with the server-side session
 * managed by proxy.js. Safe to call multiple times — returns the same
 * instance every time.
 */
export function createClient() {
  if (!_client) {
    _client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    );
  }
  return _client;
}
