"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function fetchMyOrdersAction() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { error: "Not authenticated." };

    const admin = createAdminClient();
    const { data, error } = await admin
      .from("orders")
      .select(
        "id, external_id, created_at, final_total, payment_status, items, delivery_city, delivery_state, customer_first_name, customer_last_name",
      )
      .ilike("customer_email", user.email)
      .order("created_at", { ascending: false });

    if (error) return { error: error.message };
    return { data: data ?? [] };
  } catch (err) {
    return { error: err.message || "Failed to fetch orders." };
  }
}

export async function retryOrderItemsAction(orderItems) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { error: "Not authenticated." };

    if (!Array.isArray(orderItems) || orderItems.length === 0) {
      return { data: { available: [], unavailable: [] } };
    }

    const ids = orderItems.map((i) => i.id).filter(Boolean);
    const admin = createAdminClient();
    const { data: products, error } = await admin
      .from("products")
      .select("id, name, slug, price, sale_price, stock, image_urls")
      .in("id", ids);

    if (error) return { error: error.message };

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

    return { data: { available, unavailable } };
  } catch (err) {
    return { error: err.message || "Failed to check item availability." };
  }
}
