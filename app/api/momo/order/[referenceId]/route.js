import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireUserApi } from "@/lib/api-auth";

/**
 * GET /api/momo/order/[referenceId]
 * Fetch a single order by its MoMo reference ID.
 * Authenticated; the caller must either own the order (user_id match, or
 * legacy email match for un-backfilled rows) or be an admin.
 */
export async function GET(request, { params }) {
  const { user, response: authResponse } = await requireUserApi();
  if (authResponse) return authResponse;

  const { referenceId } = await params;

  try {
    const db = createAdminClient();
    const { data: order, error } = await db
      .from("orders")
      .select("*")
      .eq("reference_id", referenceId)
      .single();

    if (error || !order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 },
      );
    }

    const isOwner =
      (order.user_id && order.user_id === user.id) ||
      (!order.user_id &&
        order.customer_email &&
        order.customer_email.toLowerCase() === (user.email || "").toLowerCase());
    const isAdmin = user.role === "admin";

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 },
      );
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch order", error: error.message },
      { status: 500 },
    );
  }
}
