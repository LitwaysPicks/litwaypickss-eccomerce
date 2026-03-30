"use client";
import { useState, useEffect } from "react";
import { Search, Loader2, Eye } from "lucide-react";
import { useOrders, ORDERS_PAGE_SIZE } from "@/hooks/useOrders";
import { formatCurrency } from "@/lib/currency";
import Pagination from "@/components/Admin/Pagination";
import OrderDetailPanel from "@/components/Admin/Orders/OrderDetailPanel";

// SUCCESSFUL = MoMo payment confirmed, awaiting fulfilment
// COMPLETED  = order fulfilled/delivered by admin
const STATUSES = ["", "PENDING", "SUCCESSFUL", "COMPLETED", "FAILED", "REFUNDED"];
const STATUS_LABELS = { "": "All", PENDING: "Pending", SUCCESSFUL: "Paid", COMPLETED: "Completed", FAILED: "Failed", REFUNDED: "Refunded" };
const STATUS_STYLES = {
  SUCCESSFUL: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-green-100 text-green-700",
  PENDING: "bg-orange-100 text-orange-700",
  FAILED: "bg-red-100 text-red-700",
  REFUNDED: "bg-purple-100 text-purple-700",
};

export default function OrdersPage() {
  const [status, setStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(searchQuery); setPage(0); }, 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const { orders, totalCount, pageCount, isLoading, isFetching, updateStatus } = useOrders({
    status, search: debouncedSearch, page,
  });

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-white p-1">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => { setStatus(s); setPage(0); }}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                status === s
                  ? "bg-secondary-900 text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search orders…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input h-9 pl-9 pr-3 text-sm w-64"
          />
        </div>
      </div>

      {/* Table */}
      <div className={`card overflow-hidden transition-opacity ${isFetching ? "opacity-60" : ""}`}>
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
          <p className="text-xs text-gray-500">
            {isLoading ? "Loading…" : `${totalCount} order${totalCount !== 1 ? "s" : ""}`}
            {isFetching && !isLoading && <Loader2 className="ml-2 inline h-3 w-3 animate-spin" />}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Reference</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Customer</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Items</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500">Total</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Status</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Method</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Date</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr><td colSpan={8} className="px-5 py-8 text-center text-gray-400 text-sm">Loading…</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={8} className="px-5 py-12 text-center text-gray-400 text-sm">No orders found</td></tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-xs text-gray-700">{order.external_id?.slice(0, 12)}…</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-gray-900">{order.customer_first_name} {order.customer_last_name}</p>
                      <p className="text-xs text-gray-500">{order.customer_email}</p>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">
                      {Array.isArray(order.items) ? order.items.length : "—"}
                    </td>
                    <td className="px-5 py-3.5 text-right font-semibold text-gray-900">
                      {formatCurrency(order.final_total)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[order.payment_status] ?? "bg-gray-100 text-gray-600"}`}>
                        {order.payment_status?.charAt(0) + order.payment_status?.slice(1).toLowerCase()}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-600 uppercase">{order.payment_method}</td>
                    <td className="px-5 py-3.5 text-xs text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          page={page} pageCount={pageCount} totalCount={totalCount}
          pageSize={ORDERS_PAGE_SIZE} isFetching={isFetching} onPageChange={setPage}
        />
      </div>

      {selectedOrder && (
        <OrderDetailPanel
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdateStatus={(id, s) => {
            updateStatus.mutate({ orderId: id, status: s });
            setSelectedOrder((prev) => ({ ...prev, payment_status: s }));
          }}
          updating={updateStatus.isPending}
        />
      )}
    </div>
  );
}
