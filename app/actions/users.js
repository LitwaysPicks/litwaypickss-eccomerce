"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/session";

/**
 * Permanently delete a user account.
 * Removes the profile row first, then the Supabase auth record.
 * Requires an active admin session.
 */
export async function deleteUserAction(userId) {
  const me = await requireAdmin();
  if (me.id === userId) throw new Error("You cannot delete your own account.");

  const adminSupabase = createAdminClient();

  await adminSupabase.from("users").delete().eq("id", userId);
  await adminSupabase.from("carts").delete().eq("user_id", userId);

  const { error } = await adminSupabase.auth.admin.deleteUser(userId);
  if (error) throw new Error(error.message);
}

/**
 * Create a new admin account.
 * Uses the service-role client so no email confirmation is required.
 */
export async function createAdminUserAction({ email, password, firstName, lastName }) {
  await requireAdmin();

  if (!email || !password || !firstName || !lastName) {
    throw new Error("All fields are required.");
  }
  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }

  const adminSupabase = createAdminClient();

  const { data, error } = await adminSupabase.auth.admin.createUser({
    email: email.trim().toLowerCase(),
    password,
    email_confirm: true,
    user_metadata: { first_name: firstName, last_name: lastName },
  });

  if (error) throw new Error(error.message);

  const { error: profileError } = await adminSupabase.from("users").insert({
    id: data.user.id,
    first_name: firstName.trim(),
    last_name: lastName.trim(),
    email: email.trim().toLowerCase(),
    role: "admin",
  });

  if (profileError) {
    // Roll back the auth record
    await adminSupabase.auth.admin.deleteUser(data.user.id).catch(() => {});
    throw new Error(profileError.message);
  }
}
