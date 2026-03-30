import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import crypto from "crypto";

/**
 * POST /api/momo/callback
 * Webhook from MTN MoMo when payment status changes.
 * Must always respond 200 — MoMo retries on any other status.
 */
export async function POST(request) {
  const startTime = Date.now();

  try {
    const payload = await request.json();

    const {
      financialTransactionId = null,
      externalId = null,
      amount = null,
      currency = null,
      status = null,
      payer = {},
      payeeNote = null,
      payerMessage = null,
      reason = null,
    } = payload;

    const referenceId =
      request.headers.get("x-reference-id") || payload.referenceId || externalId;

    if (!referenceId && !financialTransactionId) {
      return NextResponse.json(
        { success: false, message: "No transaction identifier in callback" },
        { status: 400 },
      );
    }

    // Verify HMAC signature if secret is configured
    const signature = request.headers.get("x-momo-signature");
    const secret = process.env.MOMO_CALLBACK_SECRET;
    if (secret && signature) {
      const expected = crypto
        .createHmac("sha256", secret)
        .update(JSON.stringify(payload))
        .digest("hex");
      const sigBuf = Buffer.from(signature);
      const expBuf = Buffer.from(expected);
      if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
        return NextResponse.json({ success: false, message: "Invalid signature" }, { status: 401 });
      }
    }

    const transactionId = referenceId || financialTransactionId;
    const db = createAdminClient();

    const callbackData = {
      financialTransactionId,
      externalId,
      amount,
      currency,
      status,
      payer,
      payerPhone: payer.partyId || null,
      payeeNote,
      payerMessage,
      reason,
      callbackReceivedAt: new Date().toISOString(),
    };

    const filter = externalId
      ? `reference_id.eq.${transactionId},external_id.eq.${externalId}`
      : `reference_id.eq.${transactionId}`;

    switch (status) {
      case "SUCCESSFUL":
        await db.from("orders").update({
          payment_status: "SUCCESSFUL",
          payment_confirmed_at: new Date().toISOString(),
          financial_transaction_id: financialTransactionId,
          callback_received: true,
          callback_data: callbackData,
          last_status_check: new Date().toISOString(),
        }).or(filter);
        break;

      case "FAILED":
        await db.from("orders").update({
          payment_status: "FAILED",
          failure_reason: reason || "Unknown",
          callback_received: true,
          callback_data: callbackData,
          last_status_check: new Date().toISOString(),
        }).or(filter);
        break;

      case "PENDING":
      case "CREATED":
        await db.from("orders").update({
          payment_status: "PENDING",
          callback_received: true,
          callback_data: callbackData,
          last_status_check: new Date().toISOString(),
        }).or(filter);
        break;

      default:
        console.warn("Unknown callback status:", status);
    }

    return NextResponse.json({
      success: true,
      message: "Callback received and processed",
      referenceId: transactionId,
      status,
      processingTime: `${Date.now() - startTime}ms`,
    });
  } catch (error) {
    console.error("Callback error:", error.message);
    // Still return 200 to prevent MoMo retries — investigate via logs
    return NextResponse.json({
      success: false,
      message: "Callback received but processing failed",
      error: error.message,
    });
  }
}
