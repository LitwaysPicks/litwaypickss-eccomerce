/**
 * Deducts an order's item quantities from product stock. Runs once per order:
 * the database function stamps orders.stock_deducted_at and ignores repeat
 * calls, so the MoMo callback and the status poller can both call this.
 * Never throws — a stock hiccup must not fail the payment confirmation.
 */
export async function deductStockForOrder(db, orderId) {
  try {
    const { error } = await db.rpc("deduct_stock_for_order", { p_order_id: String(orderId) });
    if (error) console.error("Stock deduction failed for order", orderId, error.message);
  } catch (err) {
    console.error("Stock deduction failed for order", orderId, err?.message || err);
  }
}
