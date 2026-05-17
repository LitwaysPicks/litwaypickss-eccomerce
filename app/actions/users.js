"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/session";

export async function deleteUserAction(userId) {
  try {
    const me = await requireAdmin();
    if (me.id === userId) return { error: "You cannot delete your own account." };

    const adminSupabase = createAdminClient();
    await adminSupabase.from("users").delete().eq("id", userId);
    await adminSupabase.from("carts").delete().eq("user_id", userId);

    const { error } = await adminSupabase.auth.admin.deleteUser(userId);
    if (error) return { error: error.message };

    return {};
  } catch (err) {
    if (err?.digest?.startsWith("NEXT_REDIRECT")) throw err;
    return { error: err.message || "Failed to delete user." };
  }
}

export async function createAdminUserAction({ email, password, firstName, lastName }) {
  try {
    await requireAdmin();

    if (!email || !password || !firstName || !lastName) {
      return { error: "All fields are required." };
    }
    if (password.length < 8) {
      return { error: "Password must be at least 8 characters." };
    }

    const adminSupabase = createAdminClient();
    const { data, error } = await adminSupabase.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password,
      email_confirm: true,
      user_metadata: { first_name: firstName, last_name: lastName },
    });

    if (error) return { error: error.message };

    const { error: profileError } = await adminSupabase.from("users").insert({
      id: data.user.id,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      email: email.trim().toLowerCase(),
      role: "admin",
    });

    if (profileError) {
      await adminSupabase.auth.admin.deleteUser(data.user.id).catch(() => {});
      return { error: profileError.message };
    }

    return {};
  } catch (err) {
    if (err?.digest?.startsWith("NEXT_REDIRECT")) throw err;
    return { error: err.message || "Failed to create admin user." };
  }
}
