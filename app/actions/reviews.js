"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { notifyNewReview } from "@/lib/notifications";

/**
 * Fetch all published reviews for a product (readable by anyone).
 */
export async function fetchProductReviewsAction(productId) {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("reviews")
    .select("id, rating, comment, created_at, user_id")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  // Attach first-name initial from profiles table if it exists; fall back gracefully.
  const userIds = [...new Set((data ?? []).map((r) => r.user_id))];
  let profileMap = {};
  if (userIds.length > 0) {
    const { data: profiles } = await admin
      .from("profiles")
      .select("id, first_name, last_name")
      .in("id", userIds);

    (profiles ?? []).forEach((p) => {
      profileMap[p.id] = p;
    });
  }

  return (data ?? []).map((r) => {
    const profile = profileMap[r.user_id];
    const displayName = profile
      ? `${profile.first_name ?? ""} ${profile.last_name?.[0] ?? ""}.`.trim()
      : "Customer";
    return { ...r, displayName };
  });
}

/**
 * Fetch the COMPLETED order items for the current user that can still be reviewed.
 * Returns: [{ orderId, orderRef, productId, productName, productImage, alreadyReviewed }]
 */
export async function fetchReviewableItemsAction() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) throw new Error("Not authenticated.");

  const admin = createAdminClient();

  // Get all COMPLETED orders for this user
  const { data: orders, error: ordersError } = await admin
    .from("orders")
    .select("id, external_id, items, payment_status")
    .ilike("customer_email", user.email)
    .eq("payment_status", "COMPLETED");

  if (ordersError) throw new Error(ordersError.message);
  if (!orders || orders.length === 0) return [];

  // Get existing reviews by this user
  const { data: existingReviews } = await admin
    .from("reviews")
    .select("product_id, order_id")
    .eq("user_id", user.id);

  const reviewedSet = new Set(
    (existingReviews ?? []).map((r) => `${r.product_id}::${r.order_id}`)
  );

  const reviewable = [];

  for (const order of orders) {
    const items = Array.isArray(order.items) ? order.items : [];
    for (const item of items) {
      if (!item.id) continue;
      const key = `${item.id}::${order.id}`;
      reviewable.push({
        orderId: order.id,
        orderRef: order.external_id,
        productId: item.id,
        productName: item.name || item.title || "Product",
        productImage: item.image_urls?.[0] ?? item.images?.[0] ?? null,
        alreadyReviewed: reviewedSet.has(key),
      });
    }
  }

  return reviewable;
}

/**
 * Submit a review for a product.
 * Validates that:
 *  1. The user is authenticated.
 *  2. The order exists, belongs to this user, and has status COMPLETED.
 *  3. The product is part of that order.
 *  4. The user hasn't already reviewed this product for this order.
 */
export async function submitReviewAction({ productId, orderId, rating, comment }) {
  if (!productId || !orderId) throw new Error("productId and orderId are required.");
  if (!rating || rating < 1 || rating > 5) throw new Error("Rating must be between 1 and 5.");

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) throw new Error("Not authenticated.");

  const admin = createAdminClient();

  // Verify the order belongs to this user and is COMPLETED
  const { data: order, error: orderError } = await admin
    .from("orders")
    .select("id, payment_status, items, customer_email")
    .eq("id", orderId)
    .single();

  if (orderError || !order) throw new Error("Order not found.");
  if (order.customer_email !== user.email) throw new Error("Order does not belong to you.");
  if (order.payment_status !== "COMPLETED")
    throw new Error("You can only review products from completed orders.");

  // Verify the product is in this order
  const items = Array.isArray(order.items) ? order.items : [];
  const hasProduct = items.some((item) => item.id === productId);
  if (!hasProduct) throw new Error("This product is not part of the order.");

  // Insert the review (unique constraint handles duplicates)
  const { error: insertError } = await admin.from("reviews").insert({
    product_id: productId,
    user_id: user.id,
    order_id: orderId,
    rating,
    comment: comment?.trim() || null,
  });

  if (insertError) {
    if (insertError.code === "23505") throw new Error("You have already reviewed this product.");
    throw new Error(insertError.message);
  }

  // Recalculate and update the product's aggregated rating + review_count
  const { data: agg } = await admin
    .from("reviews")
    .select("rating")
    .eq("product_id", productId);

  if (agg && agg.length > 0) {
    const avg = agg.reduce((s, r) => s + r.rating, 0) / agg.length;
    await admin
      .from("products")
      .update({
        rating: Math.round(avg * 10) / 10,
        review_count: agg.length,
      })
      .eq("id", productId);
  }

  // Fetch product name for the notification
  const { data: product } = await admin
    .from("products")
    .select("name")
    .eq("id", productId)
    .single();

  // Fetch reviewer name for the notification
  const { data: profile } = await admin
    .from("profiles")
    .select("first_name, last_name")
    .eq("id", user.id)
    .single();

  const reviewerName = profile
    ? `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim() || "A customer"
    : "A customer";

  notifyNewReview({
    productId,
    productName: product?.name ?? "a product",
    reviewerName,
    rating,
  });

  return { success: true };
}
