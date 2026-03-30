import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAccessToken, fetchTransactionDetails } from "@/lib/momo/service";

export async function GET(request, { params }) {
  const { referenceId } = await params;

  try {
    const db = createAdminClient();

    // 1. Check database for a terminal status first (fastest path)
    const { data: order, error: dbError } = await db
      .from("orders")
      .select("*")
      .eq("reference_id", referenceId)
      .single();

    if (!dbError && order) {
      if (order.payment_status === "SUCCESSFUL" || order.payment_status === "FAILED") {
        return NextResponse.json({
          success: true,
          status: order.payment_status,
          orderDetails: order,
          source: "database",
        });
      }
    }

    // 2. Check live with MoMo API
    const accessToken = await getAccessToken();
    const transaction = await fetchTransactionDetails(referenceId, accessToken);

    if (!transaction) {
      // Return whatever the DB has (likely PENDING), or 404
      if (order) {
        return NextResponse.json({
          success: true,
          status: order.payment_status || "PENDING",
          message: "Transaction is being processed",
          source: "database",
        });
      }
      return NextResponse.json(
        { success: false, message: "Transaction not found" },
        { status: 404 },
      );
    }

    const status = transaction.status;

    // 3. Update database with latest status
    const updateData = {
      payment_status: status,
      last_status_check: new Date().toISOString(),
    };
    if (transaction.financialTransactionId) {
      updateData.financial_transaction_id = transaction.financialTransactionId;
    }
    if (status === "SUCCESSFUL") {
      updateData.payment_confirmed_at = new Date().toISOString();
    }

    await db
      .from("orders")
      .update(updateData)
      .eq("reference_id", referenceId);

    return NextResponse.json({
      success: true,
      status,
      data: transaction,
      source: "momo_api",
    });
  } catch (error) {
    console.error("Status check error:", error.message);
    return NextResponse.json(
      { success: false, message: "Failed to check payment status", error: error.message },
      { status: 500 },
    );
  }
}
