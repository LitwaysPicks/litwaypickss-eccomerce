import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * GET /api/momo/transactions
 * Returns orders list (admin use). Supports ?limit and ?status query params.
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "100", 10), 100);
    const status = searchParams.get("status");

    const db = createAdminClient();
    let query = db
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (status) {
      query = query.eq("payment_status", status.toUpperCase());
    }

    const { data: orders, error } = await query;
    if (error) throw error;

    return NextResponse.json({
      success: true,
      count: orders.length,
      transactions: orders,
    });
  } catch (error) {
    console.error("Transactions error:", error.message);
    return NextResponse.json(
      { success: false, message: "Failed to fetch transactions", error: error.message },
      { status: 500 },
    );
  }
}
