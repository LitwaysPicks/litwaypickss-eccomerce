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
  acceptedTerms,
}) {
  if (!email || !password || !firstName || !lastName) {
    return { error: "All required fields must be filled." };
  }
  if (acceptedTerms !== true) {
    return { error: "Please accept the Terms of Service and Privacy Policy to create an account." };
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
        // Profile extras ride along in metadata so they survive email
        // verification (there's no session to write the profile row until
        // the code is confirmed — see verifySignupCodeAction).
        data: {
          first_name: firstName,
          last_name: lastName,
          phone: phone?.trim() || null,
          address: address?.trim() || null,
          city: city?.trim() || "",
          country: country?.trim() || "",
          terms_accepted_at: new Date().toISOString(),
        },
      },
    });
    if (error) return { error: error.message };

    // Email confirmation is on: Supabase has emailed a 6-digit code and
    // there's no session yet. The modal switches to the code screen.
    if (!data.session) {
      return { needsVerification: true, email: email.trim().toLowerCase() };
    }

    if (data?.user?.id && data.session) {
      // upsert: the on_auth_user_created trigger has usually created the row already.
      const { error: profileError } = await supabase.from("users").upsert({
        id: data.user.id,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim() ?? null,
        address: address?.trim() ?? null,
        city: city?.trim() || "",
        country: country?.trim() || "",
        role: "customer",
      }, { onConflict: "id" });

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

// Confirms the 6-digit code from the sign-up email. On success Supabase
// creates the session (auth cookies are set by the server client).
export async function verifySignupCodeAction({ email, code }) {
  const token = String(code ?? "").replace(/\D/g, "");
  if (!email || token.length !== 6) {
    return { error: "Enter the 6-digit code from your email." };
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token,
      type: "email",
    });
    if (error) return { error: "That code is invalid or has expired. Request a new one." };

    // The DB trigger created the profile row with just the name; fill in the
    // rest of what the customer entered at sign-up.
    const meta = data?.user?.user_metadata ?? {};
    if (data?.user?.id) {
      await supabase
        .from("users")
        .update({
          phone: meta.phone ?? null,
          address: meta.address ?? null,
          city: meta.city ?? "",
          country: meta.country ?? "",
        })
        .eq("id", data.user.id);
    }

    revalidatePath("/", "layout");
    return {};
  } catch (err) {
    return { error: err.message || "Verification failed." };
  }
}

export async function resendSignupCodeAction(email) {
  if (!email?.trim()) return { error: "Email is required." };
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: email.trim().toLowerCase(),
    });
    if (error) return { error: error.message };
    return {};
  } catch (err) {
    return { error: err.message || "Failed to resend code." };
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
