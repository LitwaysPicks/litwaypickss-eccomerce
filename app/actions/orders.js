"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * Fetch all orders for the currently authenticated user, matched by email.
 * The orders table has no user_id FK, so we match on customer_email.
 * Re-validates the session on every call — never trusts client-supplied email.
 */
export async function fetchMyOrdersAction() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) throw new Error("Not authenticated.");

  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, external_id, created_at, final_total, payment_status, items, delivery_city, delivery_state, customer_first_name, customer_last_name"
    )
    .eq("customer_email", user.email)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return data ?? [];
}
