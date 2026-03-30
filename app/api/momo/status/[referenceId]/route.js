import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAccessToken, fetchTransactionDetails } from "@/lib/momo/service";
import { sendOrderPlacedEmails } from "@/lib/email";

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

    // Terminal statuses already in DB — no need to re-query MoMo
    const TERMINAL_DB_STATUSES = ["SUCCESSFUL", "FAILED", "COMPLETED", "REFUNDED"];
    if (!dbError && order && TERMINAL_DB_STATUSES.includes(order.payment_status)) {
      return NextResponse.json({
        success: true,
        status: order.payment_status,
        orderDetails: order,
        source: "database",
      });
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

    // Normalise MoMo statuses into the app's status set:
    // REJECTED / TIMEOUT → FAILED   (terminal failures)
    // CREATED             → PENDING  (initial pre-approval state)
    const MOMO_STATUS_MAP = {
      REJECTED: "FAILED",
      TIMEOUT: "FAILED",
      CREATED: "PENDING",
    };
    const rawStatus = transaction.status;
    const status = MOMO_STATUS_MAP[rawStatus] ?? rawStatus;

    // 3. Update database with normalised status
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
    if (status === "FAILED" && rawStatus !== status) {
      // Store the original MoMo status as the failure reason
      updateData.failure_reason = rawStatus;
    }

    await db
      .from("orders")
      .update(updateData)
      .eq("reference_id", referenceId);

    // Send order placed email on first SUCCESSFUL confirmation
    if (status === "SUCCESSFUL" && order && !order.payment_confirmed_at && order.customer_email) {
      const orderForEmail = {
        ...order,
        financial_transaction_id: transaction.financialTransactionId || order.financial_transaction_id,
      };
      sendOrderPlacedEmails(orderForEmail).catch((err) =>
        console.error("Order placed email error:", err.message)
      );
    }

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
