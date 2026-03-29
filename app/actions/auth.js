"use server";

/**
 * Server Actions — authentication and profile mutations.
 *
 * All functions run exclusively on the server. Supabase auth cookies are
 * read and written via the SSR client, which keeps the session in sync
 * between the browser and Next.js server components.
 *
 * Security model (defense in depth):
 *  1. proxy.js  — fast edge check: unauthenticated → redirect before render
 *  2. Server Actions — re-validate session on every mutation
 *  3. Supabase RLS — database-level enforcement regardless of app layer
 *
 * Functions throw on error so React Query's `useMutation` catches them
 * naturally. Non-throwing variants that return `{ error }` are used by
 * `useActionState` forms.
 */

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

// ─── Authentication ────────────────────────────────────────────────────────────

/**
 * Sign in with email + password.
 * Session is written to HttpOnly cookies by the SSR client.
 */
export async function loginAction({ email, password }) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/", "layout");
}

/**
 * Create a new customer account + matching row in the `users` table.
 * Signup is only considered successful if both the auth record and the
 * profile row are created — partial success throws so the caller can
 * surface the error without leaving orphaned auth records.
 */
export async function signupAction({
  email,
  password,
  firstName,
  lastName,
  phone,
  address,
  city,
  country,
}) {
  if (!email || !password || !firstName || !lastName) {
    throw new Error("All required fields must be filled.");
  }
  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: {
      data: { first_name: firstName, last_name: lastName },
    },
  });

  if (error) throw new Error(error.message);

  // Only create the profile row when a live session exists (i.e. email
  // confirmation is disabled). When confirmation is required, data.session
  // is null and the profile is created after the user confirms their email.
  if (data?.user?.id && data.session) {
    const { error: profileError } = await supabase.from("users").insert({
      id: data.user.id,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() ?? null,
      address: address?.trim() ?? null,
      city: city?.trim() ?? null,
      country: country?.trim() ?? null,
      role: "customer",
    });

    if (profileError) {
      // Roll back the auth record so the user can retry without a "email
      // already registered" error on their next signup attempt.
      const adminSupabase = createAdminClient();
      await adminSupabase.auth.admin.deleteUser(data.user.id);
      throw new Error("Signup failed — please try again.");
    }
  }

  revalidatePath("/", "layout");
}

/**
 * Sign the current user out. Clears auth cookies.
 * Does NOT redirect — the caller is responsible for navigation so that
 * React Query can invalidate its cache before the route changes.
 */
export async function logoutAction() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

// ─── Password management ───────────────────────────────────────────────────────

/**
 * Send a password-reset email with a PKCE token_hash link pointing to
 * /reset-password. Uses the server client so the redirectTo URL is read
 * from an env variable rather than `window.location` (which is unavailable
 * server-side).
 */
export async function sendPasswordResetAction(email) {
  if (!email?.trim()) throw new Error("Email is required.");

  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(
    email.trim().toLowerCase(),
    {
      redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password`,
    },
  );

  if (error) throw new Error(error.message);
}

/**
 * Update the current user's password.
 * Requires an active recovery session (user arrived via a reset-password
 * link that was verified client-side via verifyOtp).
 * Signs the user out after updating so they must re-authenticate.
 */
export async function updatePasswordAction(newPassword) {
  if (!newPassword || newPassword.length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }

  const supabase = await createClient();

  // Re-validate: must have an active session
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) throw new Error("Session expired. Please request a new reset link.");

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw new Error(error.message);

  await supabase.auth.signOut();
  revalidatePath("/", "layout");
}

/**
 * Change password for an already-authenticated user.
 * Unlike updatePasswordAction (recovery flow), this keeps the session alive.
 */
export async function changePasswordInAppAction(newPassword) {
  if (!newPassword || newPassword.length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }

  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("Not authenticated.");

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw new Error(error.message);
}

/**
 * Permanently delete the current user's account.
 * Removes the profile row, cart, and the Supabase auth record.
 * Uses the service-role admin client to bypass RLS for the auth deletion.
 */
export async function deleteAccountAction() {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("Not authenticated.");

  const adminSupabase = createAdminClient();

  // Delete profile and cart rows first (auth record deletion won't cascade these)
  await supabase.from("users").delete().eq("id", user.id);
  await supabase.from("carts").delete().eq("user_id", user.id);

  // Delete the auth record — this is irreversible
  const { error } = await adminSupabase.auth.admin.deleteUser(user.id);
  if (error) throw new Error(error.message);

  revalidatePath("/", "layout");
}

// ─── Profile ───────────────────────────────────────────────────────────────────

/**
 * Update profile fields for `userId`.
 *
 * Security: the server re-validates the JWT and confirms the caller owns
 * the target row before writing. The `role` field is explicitly stripped
 * to prevent privilege escalation through profile edits.
 */
export async function updateProfileAction(userId, data) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) throw new Error("Not authenticated.");
  if (user.id !== userId) throw new Error("Unauthorized.");

  // Strip role and email — role changes require a separate admin action;
  // email is owned by Supabase Auth and must be updated via updateUser(),
  // not directly in the profile row.
  const { role: _role, email: _email, ...rawData } = data;

  const KEY_MAP = {
    firstName: "first_name",
    lastName: "last_name",
    county: "country",
  };

  const safeData = Object.fromEntries(
    Object.entries(rawData).map(([k, v]) => [KEY_MAP[k] ?? k, v]),
  );

  const { error } = await supabase
    .from("users")
    .update(safeData)
    .eq("id", userId);

  if (error) throw new Error(error.message);

  revalidatePath("/account");
}
