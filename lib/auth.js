import { supabase } from "./supabase";

/**
 * Fetches the authenticated user + their profile row.
 *
 * Used as the React Query queryFn in AuthProvider (client-side).
 *
 * Uses getUser() — not getSession() — because getUser() makes a network
 * call to Supabase to validate the JWT, whereas getSession() only reads
 * the local cookie value without server-side verification.
 *
 * Returns null when there is no active session.
 */
export async function fetchAuthUser() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) return null;

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("id, first_name, last_name, email, phone, address, city, country, role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    console.warn(
      "fetchAuthUser: users row not found for",
      user.id,
      profileError?.message,
    );
    return { user: { id: user.id, email: user.email }, role: null };
  }

  return { user: profile, role: profile.role ?? null };
}

export async function logoutUser() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
