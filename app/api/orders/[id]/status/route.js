import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendOrderCompletedEmails, sendOrderRefundedEmails } from "@/lib/email";

/**
 * PATCH /api/orders/[id]/status
 * Updates order payment_status (admin only). Sends email notifications
 * when status changes to COMPLETED or REFUNDED.
 */
export async function PATCH(request, { params }) {
  const { id } = await params;

  try {
    const { status } = await request.json();

    const allowed = ["PENDING", "SUCCESSFUL", "COMPLETED", "FAILED", "REFUNDED"];
    if (!status || !allowed.includes(status)) {
      return NextResponse.json(
        { success: false, message: `Invalid status. Must be one of: ${allowed.join(", ")}` },
        { status: 400 }
      );
    }

    const db = createAdminClient();

    // Fetch current order for email data
    const { data: order, error: fetchError } = await db
      .from("orders")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    const { error: updateError } = await db
      .from("orders")
      .update({ payment_status: status, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (updateError) {
      return NextResponse.json(
        { success: false, message: updateError.message },
        { status: 500 }
      );
    }

    // Send email notifications for terminal admin-set statuses
    if (order.customer_email) {
      const updatedOrder = { ...order, payment_status: status };

      if (status === "COMPLETED") {
        sendOrderCompletedEmails(updatedOrder).catch((err) =>
          console.error("Order completed email error:", err.message)
        );
      } else if (status === "REFUNDED") {
        sendOrderRefundedEmails(updatedOrder).catch((err) =>
          console.error("Order refunded email error:", err.message)
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Order status update error:", error.message);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
