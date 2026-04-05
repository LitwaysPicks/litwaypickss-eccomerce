import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAccessToken, requestToPay } from "@/lib/momo/service";
import { formatLiberianPhone } from "@/lib/momo/phoneFormatter";

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      phone,
      amount,
      externalId,
      payerMessage,
      items,
      userInfo,
      deliveryInfo,
      appliedDiscount,
      subtotal,
    } = body;

    if (!phone || !amount) {
      return NextResponse.json(
        { success: false, message: "Missing required fields: phone and amount are required" },
        { status: 400 },
      );
    }

    const phoneResult = formatLiberianPhone(phone);
    if (!phoneResult.success) {
      return NextResponse.json(
        { success: false, message: phoneResult.error },
        { status: 400 },
      );
    }
    const formattedPhone = phoneResult.phone;

    const currency = "USD";
    const processId = externalId || `ORDER-${Date.now()}`;
    const db = createAdminClient();

    // Create order in database
    let order = null;
    if (userInfo && deliveryInfo) {
      const { data, error: dbError } = await db
        .from("orders")
        .insert({
          reference_id: null,
          external_id: processId,
          customer_first_name: userInfo.firstName,
          customer_last_name: userInfo.lastName,
          customer_email: userInfo.email,
          customer_phone: formattedPhone,
          delivery_address: deliveryInfo.deliveryAddress,
          delivery_city: deliveryInfo.city || "",
          delivery_state: deliveryInfo.state || "",
          amount: parseFloat(amount),
          currency,
          payment_method: "momo",
          payment_status: "PENDING",
          items,
          subtotal: parseFloat(subtotal || amount),
          discount: appliedDiscount ? parseFloat(appliedDiscount.discount) : 0,
          final_total: parseFloat(amount),
          points_earned: Math.floor(amount * 1),
          loyalty_discount_applied: appliedDiscount || null,
        })
        .select()
        .maybeSingle();

      if (dbError) {
        console.error("DB insert error:", dbError);
      } else {
        order = data;
      }
    }

    const accessToken = await getAccessToken();
    console.log("[MoMo Pay] phone:", formattedPhone, "amount:", amount, "currency:", currency, "env:", process.env.MOMO_ENVIRONMENT);
    const result = await requestToPay(
      {
        amount,
        currency,
        process_id: processId,
        phone_no: formattedPhone,
        message: payerMessage || "Payment for Litway Picks Order",
      },
      accessToken,
    );

    // Update order with the MoMo reference ID
    if (order) {
      await db
        .from("orders")
        .update({ reference_id: result.referenceId })
        .eq("id", order.id);
    }

    return NextResponse.json({
      success: true,
      message: "Payment request sent to customer's phone",
      referenceId: result.referenceId,
      orderId: order?.id,
      transaction: result.transaction,
    });
  } catch (error) {
    console.error("Payment error:", error.message);
    return NextResponse.json(
      { success: false, message: error.message || "Payment initiation failed" },
      { status: 500 },
    );
  }
}
