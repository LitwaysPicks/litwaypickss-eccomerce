"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

// ─── Authentication ────────────────────────────────────────────────────────────

export async function loginAction({ email, password }) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error) return { error: error.message };
    revalidatePath("/", "layout");
    return {};
  } catch (err) {
    return { error: err.message || "Login failed." };
  }
}

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
    return { error: "All required fields must be filled." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: { first_name: firstName, last_name: lastName },
      },
    });
    if (error) return { error: error.message };

    if (data?.user?.id && data.session) {
      const { error: profileError } = await supabase.from("users").insert({
        id: data.user.id,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim() ?? null,
        address: address?.trim() ?? null,
        city: city?.trim() || "",
        country: country?.trim() || "",
        role: "customer",
      });

      if (profileError) {
        const adminSupabase = createAdminClient();
        await adminSupabase.auth.admin.deleteUser(data.user.id);
        return { error: "Signup failed — please try again." };
      }
    }

    revalidatePath("/", "layout");
    return {};
  } catch (err) {
    return { error: err.message || "Signup failed." };
  }
}

export async function logoutAction() {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();
    if (error) return { error: error.message };
    revalidatePath("/", "layout");
    return {};
  } catch (err) {
    return { error: err.message || "Logout failed." };
  }
}

// ─── Password management ───────────────────────────────────────────────────────

export async function sendPasswordResetAction(email) {
  if (!email?.trim()) return { error: "Email is required." };
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      { redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password` },
    );
    if (error) return { error: error.message };
    return {};
  } catch (err) {
    return { error: err.message || "Failed to send reset email." };
  }
}

export async function updatePasswordAction(newPassword) {
  if (!newPassword || newPassword.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { error: "Session expired. Please request a new reset link." };

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return { error: error.message };

    await supabase.auth.signOut();
    revalidatePath("/", "layout");
    return {};
  } catch (err) {
    return { error: err.message || "Failed to update password." };
  }
}

export async function changePasswordInAppAction(newPassword) {
  if (!newPassword || newPassword.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { error: "Not authenticated." };

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return { error: error.message };
    return {};
  } catch (err) {
    return { error: err.message || "Failed to change password." };
  }
}

export async function deleteAccountAction() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { error: "Not authenticated." };

    const adminSupabase = createAdminClient();
    await supabase.from("users").delete().eq("id", user.id);
    await supabase.from("carts").delete().eq("user_id", user.id);

    const { error } = await adminSupabase.auth.admin.deleteUser(user.id);
    if (error) return { error: error.message };

    revalidatePath("/", "layout");
    return {};
  } catch (err) {
    return { error: err.message || "Failed to delete account." };
  }
}

// ─── Profile ───────────────────────────────────────────────────────────────────

export async function updateProfileAction(userId, data) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { error: "Not authenticated." };
    if (user.id !== userId) return { error: "Unauthorized." };

    const { role: _role, email: _email, ...rawData } = data;
    const KEY_MAP = {
      firstName: "first_name",
      lastName: "last_name",
      county: "country",
    };
    const safeData = Object.fromEntries(
      Object.entries(rawData).map(([k, v]) => [KEY_MAP[k] ?? k, v]),
    );

    const { error } = await supabase.from("users").update(safeData).eq("id", userId);
    if (error) return { error: error.message };

    revalidatePath("/account");
    return {};
  } catch (err) {
    return { error: err.message || "Failed to update profile." };
  }
}
