"use server";

import { friendlyError } from "@/lib/friendly-error";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { notifyNewReview } from "@/lib/notifications";

export async function fetchProductReviewsAction(productId) {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("reviews")
      .select("id, rating, comment, created_at, user_id")
      .eq("product_id", productId)
      .order("created_at", { ascending: false });

    if (error) return { error: friendlyError(error) };

    const userIds = [...new Set((data ?? []).map((r) => r.user_id))];
    let profileMap = {};
    if (userIds.length > 0) {
      const { data: profiles } = await admin
        .from("users")
        .select("id, first_name, last_name")
        .in("id", userIds);
      (profiles ?? []).forEach((p) => { profileMap[p.id] = p; });
    }

    const reviews = (data ?? []).map((r) => {
      const profile = profileMap[r.user_id];
      const displayName = profile
        ? `${profile.first_name ?? ""} ${profile.last_name?.[0] ?? ""}.`.trim()
        : "Customer";
      return { ...r, displayName };
    });

    return { data: reviews };
  } catch (err) {
    return { error: friendlyError(err, "Reviews couldn't be loaded right now.") };
  }
}

export async function fetchReviewableItemsAction() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { error: "Please sign in to continue." };

    const admin = createAdminClient();
    const { data: orders, error: ordersError } = await admin
      .from("orders")
      .select("id, external_id, items, payment_status")
      .ilike("customer_email", user.email)
      .eq("payment_status", "COMPLETED");

    if (ordersError) return { error: ordersError.message };
    if (!orders || orders.length === 0) return { data: [] };

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
        reviewable.push({
          orderId: order.id,
          orderRef: order.external_id,
          productId: item.id,
          productName: item.name || item.title || "Product",
          productImage: item.image_urls?.[0] ?? item.images?.[0] ?? null,
          alreadyReviewed: reviewedSet.has(`${item.id}::${order.id}`),
        });
      }
    }

    return { data: reviewable };
  } catch (err) {
    return { error: friendlyError(err, "We couldn't load items to review right now.") };
  }
}

export async function submitReviewAction({ productId, orderId, rating, comment }) {
  if (!productId || !orderId) return { error: "We couldn't tell which item you're reviewing. Please refresh and try again." };
  if (!rating || rating < 1 || rating > 5) return { error: "Please choose a rating from 1 to 5 stars." };

  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { error: "Please sign in to continue." };

    const admin = createAdminClient();

    const { data: order, error: orderError } = await admin
      .from("orders")
      .select("id, payment_status, items, customer_email")
      .eq("id", orderId)
      .single();

    if (orderError || !order) return { error: "We couldn't find that order." };
    if (order.customer_email !== user.email) return { error: "You can only review items from your own orders." };
    if (order.payment_status !== "COMPLETED")
      return { error: "You can review this item once your order is marked complete." };

    const items = Array.isArray(order.items) ? order.items : [];
    if (!items.some((item) => item.id === productId))
      return { error: "That item isn't part of this order." };

    const { error: insertError } = await admin.from("reviews").insert({
      product_id: productId,
      user_id: user.id,
      order_id: orderId,
      rating,
      comment: comment?.trim() || null,
    });

    if (insertError) {
      if (insertError.code === "23505") return { error: "You have already reviewed this product." };
      return { error: insertError.message };
    }

    // Recalculate aggregated rating
    const { data: agg } = await admin
      .from("reviews")
      .select("rating")
      .eq("product_id", productId);

    if (agg && agg.length > 0) {
      const avg = agg.reduce((s, r) => s + r.rating, 0) / agg.length;
      await admin
        .from("products")
        .update({ rating: Math.round(avg * 10) / 10, review_count: agg.length })
        .eq("id", productId);
    }

    const { data: product } = await admin.from("products").select("name, slug").eq("id", productId).single();
    const { data: profile } = await admin.from("users").select("first_name, last_name").eq("id", user.id).single();
    const reviewerName = profile
      ? `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim() || "A customer"
      : "A customer";

    notifyNewReview({ productId, productSlug: product?.slug, productName: product?.name ?? "a product", reviewerName, rating });

    return { data: { success: true } };
  } catch (err) {
    return { error: friendlyError(err, "We couldn't post your review. Please try again.") };
  }
}
