import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Creates a Supabase client scoped to the current server request.
 *
 * Must be called inside a Server Component, Server Action, or Route Handler
 * — never at module level, because `cookies()` is request-scoped.
 *
 * The setAll implementation silently swallows the ReadonlyHeaders error that
 * occurs when called from a Server Component (cookies are read-only there).
 * Token refresh is handled by proxy.js before the component renders.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component — mutation is a no-op.
            // The proxy handles token refresh before render.
          }
        },
      },
    },
  );
}
