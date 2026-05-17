import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendOrderPlacedEmails } from "@/lib/email";
import crypto from "crypto";

/**
 * POST /api/momo/callback
 * Webhook from MTN MoMo when payment status changes.
 * Must always respond 200 — MoMo retries on any other status.
 */
export async function POST(request) {
  const startTime = Date.now();

  try {
    // HMAC must be verified against the RAW body (not re-serialized JSON),
    // otherwise key-order differences between sender and receiver break
    // signature equality. Read text first, then JSON.parse.
    const rawBody = await request.text();

    const secret = process.env.MOMO_CALLBACK_SECRET;
    if (!secret) {
      console.error("MOMO_CALLBACK_SECRET not configured — rejecting all callbacks");
      return NextResponse.json(
        { success: false, message: "Server misconfigured" },
        { status: 500 },
      );
    }
    const signature = request.headers.get("x-momo-signature");
    if (!signature) {
      return NextResponse.json(
        { success: false, message: "Missing signature" },
        { status: 401 },
      );
    }
    const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expected);
    if (
      sigBuf.length !== expBuf.length ||
      !crypto.timingSafeEqual(sigBuf, expBuf)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid signature" },
        { status: 401 },
      );
    }

    let payload;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid JSON" },
        { status: 400 },
      );
    }

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
      case "SUCCESSFUL": {
        // Fetch current order to check if email already sent (dedup with status polling)
        const { data: existingOrder } = await db
          .from("orders")
          .select("*")
          .or(filter)
          .maybeSingle();

        // Verify the paid amount and currency match the order. A mismatch
        // means the customer paid less (or in a different currency) than
        // the order records — never mark it SUCCESSFUL.
        if (existingOrder) {
          const paidAmount = Number(amount);
          const expectedAmount = Number(existingOrder.amount);
          const amountOk =
            Number.isFinite(paidAmount) &&
            Number.isFinite(expectedAmount) &&
            Math.abs(paidAmount - expectedAmount) < 0.01;
          const currencyOk = !currency || currency === existingOrder.currency;

          if (!amountOk || !currencyOk) {
            console.error(
              "MoMo callback amount/currency mismatch:",
              { orderId: existingOrder.id, paidAmount, expectedAmount, paidCurrency: currency, expectedCurrency: existingOrder.currency },
            );
            await db.from("orders").update({
              payment_status: "DISPUTED",
              failure_reason: `Amount mismatch: paid ${paidAmount} ${currency || "?"}, expected ${expectedAmount} ${existingOrder.currency}`,
              callback_received: true,
              callback_data: callbackData,
              last_status_check: new Date().toISOString(),
            }).or(filter);
            break;
          }
        }

        await db.from("orders").update({
          payment_status: "SUCCESSFUL",
          payment_confirmed_at: new Date().toISOString(),
          financial_transaction_id: financialTransactionId,
          callback_received: true,
          callback_data: callbackData,
          last_status_check: new Date().toISOString(),
        }).or(filter);

        // Only send email if not already confirmed (avoid duplicates)
        if (existingOrder && !existingOrder.payment_confirmed_at && existingOrder.customer_email) {
          const orderForEmail = {
            ...existingOrder,
            financial_transaction_id: financialTransactionId,
          };
          sendOrderPlacedEmails(orderForEmail).catch((err) =>
            console.error("Order placed email error:", err.message)
          );
        }
        break;
      }

      // REJECTED and TIMEOUT are terminal failure states from MTN MoMo
      case "FAILED":
      case "REJECTED":
      case "TIMEOUT":
        await db.from("orders").update({
          payment_status: "FAILED",
          failure_reason: reason || status || "Unknown",
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
        console.warn("Unhandled MoMo callback status:", status);
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
