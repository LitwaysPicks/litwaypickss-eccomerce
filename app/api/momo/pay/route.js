import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAccessToken, requestToPay } from "@/lib/momo/service";
import { formatLiberianPhone } from "@/lib/momo/phoneFormatter";
import { requireUserApi } from "@/lib/api-auth";

export async function POST(request) {
  try {
    const { user, response: authResponse } = await requireUserApi();
    if (authResponse) return authResponse;

    const body = await request.json();
    const {
      phone,
      externalId,
      payerMessage,
      items,
      deliveryInfo,
    } = body;

    if (!phone) {
      return NextResponse.json(
        { success: false, message: "Missing required field: phone" },
        { status: 400 },
      );
    }
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: "No items in order" },
        { status: 400 },
      );
    }
    if (!deliveryInfo?.deliveryAddress) {
      return NextResponse.json(
        { success: false, message: "Delivery address required" },
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

    const db = createAdminClient();

    // Server-side recompute: NEVER trust prices, amounts, or discounts from
    // the client. Re-fetch every product by id and recompute totals from
    // the DB so an attacker can't pay $0.01 for a $1000 cart.
    const itemIds = [...new Set(items.map((i) => i.id).filter(Boolean))];
    if (itemIds.length === 0) {
      return NextResponse.json(
        { success: false, message: "Invalid items" },
        { status: 400 },
      );
    }

    const { data: products, error: productsError } = await db
      .from("products")
      .select("id, name, price, sale_price, stock")
      .in("id", itemIds);

    if (productsError) {
      console.error("Product lookup error:", productsError);
      return NextResponse.json(
        { success: false, message: "Failed to verify products" },
        { status: 500 },
      );
    }

    const productMap = new Map((products ?? []).map((p) => [p.id, p]));

    let computedSubtotal = 0;
    const verifiedItems = [];
    for (const item of items) {
      const product = productMap.get(item.id);
      if (!product) {
        return NextResponse.json(
          { success: false, message: `Product not available: ${item.name || item.id}` },
          { status: 400 },
        );
      }
      const qty = parseInt(item.quantity, 10);
      if (!Number.isFinite(qty) || qty <= 0) {
        return NextResponse.json(
          { success: false, message: `Invalid quantity for ${product.name}` },
          { status: 400 },
        );
      }
      if (qty > product.stock) {
        return NextResponse.json(
          { success: false, message: `Insufficient stock for ${product.name}` },
          { status: 400 },
        );
      }
      const unitPrice = Number(product.sale_price ?? product.price);
      if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
        return NextResponse.json(
          { success: false, message: `Invalid price for ${product.name}` },
          { status: 500 },
        );
      }
      computedSubtotal += unitPrice * qty;
      verifiedItems.push({
        id: product.id,
        name: product.name,
        price: unitPrice,
        quantity: qty,
        ...(item.selectedSize ? { size: item.selectedSize } : {}),
        ...(item.selectedColor ? { color: item.selectedColor } : {}),
      });
    }

    // Discounts are intentionally NOT honored from the client — without a
    // server-side discount engine, any client-supplied discount is forgeable.
    const computedTotal = Number(computedSubtotal.toFixed(2));
    const currency = "USD";
    const processId = externalId || `ORDER-${Date.now()}`;

    // Create order in database — customer identity comes from the session,
    // not the request body, so it can't be spoofed.
    const { data: order, error: dbError } = await db
      .from("orders")
      .insert({
        user_id: user.id,
        reference_id: null,
        external_id: processId,
        customer_first_name: user.first_name || "",
        customer_last_name: user.last_name || "",
        customer_email: user.email,
        customer_phone: formattedPhone,
        delivery_address: deliveryInfo.deliveryAddress,
        delivery_city: deliveryInfo.city || "",
        delivery_state: deliveryInfo.state || "",
        amount: computedTotal,
        currency,
        payment_method: "momo",
        payment_status: "PENDING",
        items: verifiedItems,
        subtotal: computedTotal,
        discount: 0,
        final_total: computedTotal,
        points_earned: Math.floor(computedTotal),
        loyalty_discount_applied: null,
      })
      .select()
      .single();

    if (dbError || !order) {
      console.error("DB insert error:", dbError);
      return NextResponse.json(
        { success: false, message: "Failed to create order" },
        { status: 500 },
      );
    }

    const accessToken = await getAccessToken();
    const result = await requestToPay(
      {
        amount: computedTotal,
        currency,
        process_id: processId,
        phone_no: formattedPhone,
        message: payerMessage || "Payment for Litway Picks Order",
      },
      accessToken,
    );

    await db
      .from("orders")
      .update({ reference_id: result.referenceId })
      .eq("id", order.id);

    return NextResponse.json({
      success: true,
      message: "Payment request sent to customer's phone",
      referenceId: result.referenceId,
      orderId: order.id,
      amount: computedTotal,
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
