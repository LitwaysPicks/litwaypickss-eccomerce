/**
 * Admin notification helpers.
 * All writes use the service-role admin client (bypasses RLS).
 * All reads in the dashboard also use the admin client.
 */
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Insert a notification row. Fire-and-forget — never throws.
 */
export async function createAdminNotification({ type, title, message, data = null }) {
  try {
    const db = createAdminClient();
    await db.from("admin_notifications").insert({ type, title, message, data });
  } catch (err) {
    console.error("createAdminNotification error:", err?.message);
  }
}

// ─── Convenience factories ────────────────────────────────────────────────────

export function notifyOrderPlaced(order) {
  const name = `${order.customer_first_name} ${order.customer_last_name}`.trim();
  return createAdminNotification({
    type: "order_placed",
    title: "New Order Placed",
    message: `${name} placed order ${order.external_id} for $${Number(order.final_total).toFixed(2)}.`,
    data: { order_id: order.id, external_id: order.external_id, amount: order.final_total },
  });
}

export function notifyOrderFailed(order) {
  const name = `${order.customer_first_name} ${order.customer_last_name}`.trim();
  return createAdminNotification({
    type: "order_failed",
    title: "Payment Failed",
    message: `Payment for order ${order.external_id} by ${name} failed.`,
    data: { order_id: order.id, external_id: order.external_id },
  });
}

export function notifyNewReview({ productId, productName, reviewerName, rating }) {
  return createAdminNotification({
    type: "new_review",
    title: "New Product Review",
    message: `${reviewerName} rated "${productName}" ${rating}/5 ★.`,
    data: { product_id: productId, rating },
  });
}

export function notifyLowStock({ productId, productName, stock }) {
  return createAdminNotification({
    type: "low_stock",
    title: "Low Stock Alert",
    message: `"${productName}" only has ${stock} unit${stock !== 1 ? "s" : ""} left.`,
    data: { product_id: productId, stock },
  });
}
