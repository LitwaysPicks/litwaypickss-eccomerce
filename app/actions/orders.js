"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Fetch all orders for the currently authenticated user, matched by email.
 * The orders table has no user_id FK, so we match on customer_email.
 * Re-validates the session on every call — never trusts client-supplied email.
 * Uses the service-role client to bypass RLS (safe: auth is validated first).
 */
export async function fetchMyOrdersAction() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) throw new Error("Not authenticated.");

  // Use the admin client so RLS doesn't silently block the query.
  // Auth is already validated above — we only return this user's orders.
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("orders")
    .select(
      "id, external_id, created_at, final_total, payment_status, items, delivery_city, delivery_state, customer_first_name, customer_last_name",
    )
    .eq("customer_email", user.email)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  console.log("Fetched orders for", user.email, data);
  return data ?? [];
}
