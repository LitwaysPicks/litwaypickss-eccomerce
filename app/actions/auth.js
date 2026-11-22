"use server";

import { friendlyError } from "@/lib/friendly-error";

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
    if (error) return { error: friendlyError(error) };
    revalidatePath("/", "layout");
    return {};
  } catch (err) {
    return { error: friendlyError(err, "We couldn't sign you in. Please try again.") };
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
    return { error: "Please fill in your first name, last name, email and password." };
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
    if (error) return { error: friendlyError(error) };

    // Email already registered. With "Confirm email" on, Supabase hides this
    // (no error, no email sent) and returns a placeholder user whose
    // identities list is empty, so the customer would wait for a code that
    // never arrives.
    if (data?.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      return {
        error:
          "An account with this email already exists. Sign in instead, or use “Forgot password” if you can't remember it.",
      };
    }

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
        return { error: "We couldn't finish creating your account. Please try again." };
      }
    }

    revalidatePath("/", "layout");
    return {};
  } catch (err) {
    return { error: friendlyError(err, "We couldn't create your account. Please try again.") };
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
    return { error: friendlyError(err, "We couldn't check that code. Please try again.") };
  }
}

export async function resendSignupCodeAction(email) {
  if (!email?.trim()) return { error: "Please enter your email address." };
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: email.trim().toLowerCase(),
    });
    if (error) return { error: friendlyError(error) };
    return {};
  } catch (err) {
    return { error: friendlyError(err, "We couldn't send a new code. Please try again in a minute.") };
  }
}

export async function logoutAction() {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();
    if (error) return { error: friendlyError(error) };
    revalidatePath("/", "layout");
    return {};
  } catch (err) {
    return { error: friendlyError(err, "We couldn't sign you out. Please try again.") };
  }
}

// ─── Password management ───────────────────────────────────────────────────────

export async function sendPasswordResetAction(email) {
  if (!email?.trim()) return { error: "Please enter your email address." };
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      { redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password` },
    );
    if (error) return { error: friendlyError(error) };
    return {};
  } catch (err) {
    return { error: friendlyError(err, "We couldn't send the reset email. Please try again in a moment.") };
  }
}

export async function updatePasswordAction(newPassword) {
  if (!newPassword || newPassword.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { error: "This reset link has expired. Please request a new one." };

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return { error: friendlyError(error) };

    await supabase.auth.signOut();
    revalidatePath("/", "layout");
    return {};
  } catch (err) {
    return { error: friendlyError(err, "We couldn't update your password. Please try again.") };
  }
}

export async function changePasswordInAppAction(newPassword) {
  if (!newPassword || newPassword.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { error: "Please sign in to continue." };

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return { error: friendlyError(error) };
    return {};
  } catch (err) {
    return { error: friendlyError(err, "Failed to change password.") };
  }
}

export async function deleteAccountAction() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { error: "Please sign in to continue." };

    const adminSupabase = createAdminClient();
    await supabase.from("users").delete().eq("id", user.id);
    await supabase.from("carts").delete().eq("user_id", user.id);

    const { error } = await adminSupabase.auth.admin.deleteUser(user.id);
    if (error) return { error: friendlyError(error) };

    revalidatePath("/", "layout");
    return {};
  } catch (err) {
    return { error: friendlyError(err, "We couldn't delete your account. Please contact us and we'll help.") };
  }
}

// ─── Profile ───────────────────────────────────────────────────────────────────

export async function updateProfileAction(userId, data) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { error: "Please sign in to continue." };
    if (user.id !== userId) return { error: "You can only change your own account." };

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
    if (error) return { error: friendlyError(error) };

    revalidatePath("/account");
    return {};
  } catch (err) {
    return { error: friendlyError(err, "We couldn't save your details. Please try again.") };
  }
}
