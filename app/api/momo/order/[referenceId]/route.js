import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * GET /api/momo/order/[referenceId]
 * Fetch a single order by its MoMo reference ID.
 */
export async function GET(request, { params }) {
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

    return NextResponse.json({ success: true, order });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch order", error: error.message },
      { status: 500 },
    );
  }
}
