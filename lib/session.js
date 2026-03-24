/**
 * Server-only session utilities.
 *
 * Import only from Server Components, Server Actions, or Route Handlers.
 * These functions call supabase.auth.getUser() which validates the JWT
 * against Supabase's auth server on every call — never trusting a stale
 * local token. This is the correct pattern for production security.
 */
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

/**
 * Returns the authenticated user's full profile from the `users` table,
 * or null if the request is not authenticated.
 *
 * Uses getUser() (not getSession()) so the JWT is always validated
 * server-side — prevents privilege escalation via tampered cookies.
 */
export async function getServerUser() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;

  const { data: profile } = await supabase
    .from("users")
    .select("id, first_name, last_name, email, phone, address, city, country, role")
    .eq("id", user.id)
    .single();

  if (!profile) {
    // Auth record exists but profile row is missing — return minimal identity.
    return { id: user.id, email: user.email, role: null };
  }

  return profile;
}

/**
 * Requires an authenticated session.
 * Redirects to /login (preserving the current path) if not authenticated.
 * Returns the user profile on success.
 */
export async function requireAuth(currentPath = "") {
  const user = await getServerUser();
  if (!user) {
    const to = currentPath ? `/login?from=${encodeURIComponent(currentPath)}` : "/login";
    redirect(to);
  }
  return user;
}

/**
 * Requires an authenticated admin session.
 * Redirects to /login if not authenticated.
 * Redirects to /unauthorized if authenticated but not an admin.
 * Returns the user profile on success.
 *
 * Always reads role from the DB — never trusts the JWT claim alone.
 */
export async function requireAdmin() {
  const user = await getServerUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/unauthorized");
  return user;
}
