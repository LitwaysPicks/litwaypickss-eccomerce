"use client";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { formatCurrency } from "@/lib/currency";
import RevenueChart from "@/components/Admin/Charts/RevenueChart";
import OrdersStatusChart from "@/components/Admin/Charts/OrdersStatusChart";
import Link from "next/link";

const STATUS_STYLES = {
  COMPLETED: "bg-emerald-50 text-emerald-700",
  PENDING:   "bg-amber-50  text-amber-700",
  FAILED:    "bg-rose-50   text-rose-700",
  REFUNDED:  "bg-purple-50 text-purple-700",
};

// Minimal, typography-first stat card — no icons, no decorative blobs
function StatCard({ label, value, loading, href, accent = "bg-gray-300" }) {
  const inner = (
    <div className="group flex flex-col justify-between rounded-xl bg-white p-5 ring-1 ring-gray-100 transition-all hover:ring-gray-200 hover:shadow-sm h-full">
      <div className="flex items-center gap-2 mb-4">
        <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${accent}`} />
        <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 leading-none">
          {label}
        </p>
      </div>

      <p className="text-[2rem] font-bold tracking-tight text-gray-900 tabular-nums leading-none">
        {loading
          ? <span className="inline-block h-8 w-24 animate-pulse rounded-lg bg-gray-100" />
          : value}
      </p>

      {href && (
        <p className="mt-4 text-[11px] font-medium text-gray-400 transition-colors group-hover:text-primary-600">
          View all →
        </p>
      )}
    </div>
  );

  return href ? <Link href={href} className="block h-full">{inner}</Link> : inner;
}

export default function AdminDashboard() {
  const {
    productStats, orderStats, customerCount,
    revenueByDay, orderStatusData, recentOrders, isLoading,
  } = useDashboardStats();

  return (
    <div className="space-y-6">

      {/* KPI strip — 2 cols mobile → 3 tablet → 6 desktop */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        <StatCard
          label="Revenue"
          value={formatCurrency(orderStats?.totalRevenue ?? 0)}
          accent="bg-emerald-500"
          loading={isLoading}
        />
        <StatCard
          label="Orders"
          value={orderStats?.totalOrders ?? 0}
          accent="bg-blue-500"
          href="/admin/orders"
          loading={isLoading}
        />
        <StatCard
          label="Pending"
          value={orderStats?.pendingOrders ?? 0}
          accent="bg-amber-400"
          href="/admin/orders"
          loading={isLoading}
        />
        <StatCard
          label="Customers"
          value={customerCount ?? 0}
          accent="bg-violet-500"
          href="/admin/customers"
          loading={isLoading}
        />
        <StatCard
          label="Products"
          value={productStats?.total_products ?? 0}
          accent="bg-indigo-500"
          href="/admin/products"
          loading={isLoading}
        />
        <StatCard
          label="Low stock"
          value={productStats?.low_stock ?? 0}
          accent="bg-rose-500"
          href="/admin/products"
          loading={isLoading}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Revenue</p>
              <p className="mt-1 text-sm font-semibold text-gray-900">Last 30 days</p>
            </div>
            <Link href="/admin/orders" className="text-xs font-medium text-gray-400 hover:text-primary-600 transition-colors">
              All orders →
            </Link>
          </div>
          <RevenueChart data={revenueByDay} />
        </div>

        <div className="card p-5">
          <div className="mb-5">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Order status</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">Last 30 days</p>
          </div>
          <OrdersStatusChart data={orderStatusData} />
        </div>
      </div>

      {/* Recent orders */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Recent orders</p>
          </div>
          <Link href="/admin/orders" className="text-xs font-medium text-gray-400 hover:text-primary-600 transition-colors">
            View all →
          </Link>
        </div>

        {isLoading ? (
          <div className="divide-y divide-gray-50">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3.5">
                <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />
                <div className="ml-auto h-4 w-16 animate-pulse rounded bg-gray-100" />
              </div>
            ))}
          </div>
        ) : recentOrders.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-gray-400">No orders yet</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/60 transition-colors"
              >
                {/* Customer */}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {order.customer_first_name} {order.customer_last_name}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{order.customer_email}</p>
                </div>

                {/* Date */}
                <p className="shrink-0 text-xs text-gray-400 hidden sm:block">
                  {new Date(order.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </p>

                {/* Status */}
                <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${STATUS_STYLES[order.payment_status] ?? "bg-gray-100 text-gray-600"}`}>
                  {order.payment_status
                    ? order.payment_status.charAt(0) + order.payment_status.slice(1).toLowerCase()
                    : "—"}
                </span>

                {/* Amount */}
                <p className="shrink-0 text-sm font-semibold text-gray-900 tabular-nums">
                  {formatCurrency(order.final_total)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
