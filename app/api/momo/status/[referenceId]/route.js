import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAccessToken, fetchTransactionDetails } from "@/lib/momo/service";
import { sendOrderPlacedEmails, sendOrderFailedEmails } from "@/lib/email";
import { notifyOrderPlaced, notifyOrderFailed } from "@/lib/notifications";

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
    const TERMINAL_DB_STATUSES = ["SUCCESSFUL", "FAILED", "COMPLETED", "REFUNDED", "DISPUTED"];
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
    let status = MOMO_STATUS_MAP[rawStatus] ?? rawStatus;

    // Verify the paid amount/currency match the order before marking SUCCESSFUL.
    // Without this check, MoMo returning SUCCESSFUL for any amount would
    // mark the full DB-recorded total as paid.
    let amountMismatchReason = null;
    if (status === "SUCCESSFUL" && order) {
      const paidAmount = Number(transaction.amount);
      const expectedAmount = Number(order.amount);
      const amountOk =
        Number.isFinite(paidAmount) &&
        Number.isFinite(expectedAmount) &&
        Math.abs(paidAmount - expectedAmount) < 0.01;
      const currencyOk = !transaction.currency || transaction.currency === order.currency;
      if (!amountOk || !currencyOk) {
        amountMismatchReason = `Amount mismatch: paid ${paidAmount} ${transaction.currency || "?"}, expected ${expectedAmount} ${order.currency}`;
        console.error("MoMo status amount/currency mismatch:", { orderId: order.id, paidAmount, expectedAmount });
        status = "DISPUTED";
      }
    }

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
    if (status === "DISPUTED") {
      updateData.failure_reason = amountMismatchReason;
    }
    if (status === "FAILED" && rawStatus !== status) {
      // Store the original MoMo status as the failure reason
      updateData.failure_reason = rawStatus;
    }

    // Gate the transition on prior PENDING so concurrent pollers / the
    // callback can race here without both crossing the side-effect line.
    // The row updates iff payment_status is still PENDING; otherwise no row
    // is returned and we skip emails/notifications.
    // NOTE: Supabase builder is immutable — each .eq() returns a new object,
    // so we must reassign rather than chain onto the discarded return value.
    const isTerminal = ["SUCCESSFUL", "FAILED", "DISPUTED"].includes(status);
    let updateQuery = db.from("orders").update(updateData).eq("reference_id", referenceId);
    if (isTerminal) updateQuery = updateQuery.eq("payment_status", "PENDING");
    const { data: updated } = await updateQuery.select();
    const transitionedRow = isTerminal && updated && updated.length === 1 ? updated[0] : null;

    if (transitionedRow && transitionedRow.customer_email) {
      const orderForEmail = {
        ...transitionedRow,
        financial_transaction_id: transaction.financialTransactionId || transitionedRow.financial_transaction_id,
        failure_reason: rawStatus !== status ? rawStatus : transitionedRow.failure_reason,
      };

      if (status === "SUCCESSFUL") {
        sendOrderPlacedEmails(orderForEmail).catch((err) =>
          console.error("Order placed email error:", err.message)
        );
        notifyOrderPlaced(orderForEmail);
      } else if (status === "FAILED") {
        sendOrderFailedEmails(orderForEmail).catch((err) =>
          console.error("Order failed email error:", err.message)
        );
        notifyOrderFailed(orderForEmail);
      }
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
