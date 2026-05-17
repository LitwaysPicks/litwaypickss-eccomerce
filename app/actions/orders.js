"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Fetch all orders for the currently authenticated user.
 * Matches by user_id (new orders) OR customer_email when user_id is null
 * (legacy rows from before the user_id column existed).
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

  const admin = createAdminClient();

  const { data, error } = await admin
    .from("orders")
    .select(
      "id, external_id, created_at, final_total, payment_status, items, delivery_city, delivery_state, customer_first_name, customer_last_name",
    )
    .or(
      `user_id.eq.${user.id},and(user_id.is.null,customer_email.ilike.${user.email})`,
    )
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

/**
 * Given the items array from a failed order, checks the products table
 * and returns two lists:
 *  - available: products that still exist and have stock > 0
 *  - unavailable: item names that are gone or out of stock
 *
 * Each available product is returned with current DB data (price, stock, images)
 * and the original quantity the customer ordered.
 */
export async function retryOrderItemsAction(orderItems) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("Not authenticated.");

  if (!Array.isArray(orderItems) || orderItems.length === 0) {
    return { available: [], unavailable: [] };
  }

  const ids = orderItems.map((i) => i.id).filter(Boolean);

  const admin = createAdminClient();
  const { data: products, error } = await admin
    .from("products")
    .select("id, name, slug, price, sale_price, stock, image_urls")
    .in("id", ids);

  if (error) throw new Error(error.message);

  const productMap = new Map((products ?? []).map((p) => [p.id, p]));

  const available = [];
  const unavailable = [];

  for (const item of orderItems) {
    const product = productMap.get(item.id);
    if (!product || product.stock <= 0) {
      unavailable.push(item.name || "Unknown item");
    } else {
      available.push({
        ...product,
        quantity: Math.min(item.quantity ?? 1, product.stock),
      });
    }
  }

  return { available, unavailable };
}
