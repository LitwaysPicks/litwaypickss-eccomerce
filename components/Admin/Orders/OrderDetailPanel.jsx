"use client";
import { X, Package, User, MapPin, CreditCard } from "lucide-react";
import { formatCurrency } from "@/lib/currency";

// SUCCESSFUL = payment confirmed by MoMo (awaiting fulfilment)
// COMPLETED  = admin has fulfilled/delivered the order
const STATUS_OPTIONS = ["PENDING", "SUCCESSFUL", "COMPLETED", "FAILED", "REFUNDED"];
const STATUS_STYLES = {
  SUCCESSFUL: "bg-blue-100 text-blue-700 border-blue-200",
  COMPLETED: "bg-green-100 text-green-700 border-green-200",
  PENDING: "bg-orange-100 text-orange-700 border-orange-200",
  FAILED: "bg-red-100 text-red-700 border-red-200",
  REFUNDED: "bg-purple-100 text-purple-700 border-purple-200",
};

export default function OrderDetailPanel({ order, onClose, onUpdateStatus, updating }) {
  if (!order) return null;

  const items = Array.isArray(order.items) ? order.items : [];

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />
      <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Order Details</h2>
            <p className="mt-0.5 font-mono text-xs text-gray-500">#{order.external_id}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-gray-100 transition-colors">
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Status */}
          <div className="flex items-center justify-between">
            <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_STYLES[order.payment_status] ?? "bg-gray-100 text-gray-700 border-gray-200"}`}>
              {order.payment_status}
            </span>
            <select
              value={order.payment_status}
              onChange={(e) => onUpdateStatus(order.id, e.target.value)}
              disabled={updating}
              className="input h-8 w-auto text-xs"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Customer */}
          <div className="rounded-xl border border-gray-100 p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <User className="h-3.5 w-3.5" /> Customer
            </div>
            <p className="text-sm font-medium text-gray-900">{order.customer_first_name} {order.customer_last_name}</p>
            <p className="text-xs text-gray-600">{order.customer_email}</p>
            <p className="text-xs text-gray-600">{order.customer_phone}</p>
          </div>

          {/* Delivery */}
          <div className="rounded-xl border border-gray-100 p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <MapPin className="h-3.5 w-3.5" /> Delivery
            </div>
            <p className="text-sm text-gray-700">{order.delivery_address}</p>
            <p className="text-xs text-gray-600">{order.delivery_city}, {order.delivery_state}</p>
          </div>

          {/* Items */}
          <div className="rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              <Package className="h-3.5 w-3.5" /> Items ({items.length})
            </div>
            <div className="space-y-2">
              {items.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  {item.image_url && (
                    <img src={item.image_url} alt={item.name} className="h-10 w-10 rounded-lg object-cover" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 truncate">{item.name}</p>
                    <p className="text-xs text-gray-500">
                      {item.size && `Size: ${item.size} · `}Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="text-xs font-semibold text-gray-900 shrink-0">
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Payment summary */}
          <div className="rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              <CreditCard className="h-3.5 w-3.5" /> Payment
            </div>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span><span>-{formatCurrency(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-gray-100 pt-1.5 font-bold text-gray-900">
                <span>Total</span><span>{formatCurrency(order.final_total)}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Via {order.payment_method} · {order.currency}</p>
            </div>
          </div>

          {/* Timestamps */}
          <div className="text-xs text-gray-400 space-y-1">
            <p>Placed: {new Date(order.created_at).toLocaleString()}</p>
            {order.payment_confirmed_at && (
              <p>Confirmed: {new Date(order.payment_confirmed_at).toLocaleString()}</p>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
