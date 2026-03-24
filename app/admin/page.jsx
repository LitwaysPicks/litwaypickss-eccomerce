"use client";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { formatCurrency } from "@/lib/currency";
import RevenueChart from "@/components/Admin/Charts/RevenueChart";
import OrdersStatusChart from "@/components/Admin/Charts/OrdersStatusChart";
import {
  DollarSign, ShoppingCart, Clock, Users, Package, AlertTriangle,
  ArrowUpRight, TrendingUp,
} from "lucide-react";
import Link from "next/link";

const PAYMENT_STATUS_STYLES = {
  COMPLETED: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  PENDING:   "bg-amber-50  text-amber-700  ring-1 ring-amber-200",
  FAILED:    "bg-rose-50   text-rose-700   ring-1 ring-rose-200",
  REFUNDED:  "bg-purple-50 text-purple-700 ring-1 ring-purple-200",
};

// colour token → Tailwind utility sets
const COLOR = {
  emerald: { icon: "bg-emerald-50 text-emerald-600", glow: "bg-emerald-100", ring: "ring-emerald-100" },
  blue:    { icon: "bg-blue-50   text-blue-600",    glow: "bg-blue-100",    ring: "ring-blue-100"    },
  amber:   { icon: "bg-amber-50  text-amber-600",   glow: "bg-amber-100",   ring: "ring-amber-100"   },
  purple:  { icon: "bg-purple-50 text-purple-600",  glow: "bg-purple-100",  ring: "ring-purple-100"  },
  indigo:  { icon: "bg-indigo-50 text-indigo-600",  glow: "bg-indigo-100",  ring: "ring-indigo-100"  },
  rose:    { icon: "bg-rose-50   text-rose-600",    glow: "bg-rose-100",    ring: "ring-rose-100"    },
};

function StatCard({ label, value, icon: Icon, color, loading, href }) {
  const c = COLOR[color] ?? COLOR.blue;

  const inner = (
    <div
      className={`group relative overflow-hidden rounded-2xl bg-white p-5 shadow-sm ring-1 ${c.ring} hover:shadow-md transition-all duration-200`}
    >
      {/* Decorative soft blob */}
      <div
        className={`pointer-events-none absolute -right-5 -top-5 h-24 w-24 rounded-full opacity-50 ${c.glow}`}
      />

      <div className="relative flex items-start justify-between gap-3">
        {/* Icon */}
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${c.icon}`}>
          <Icon className="h-5 w-5" />
        </div>

        {/* Value + label */}
        <div className="min-w-0 flex-1 text-right">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">{label}</p>
          <p className="mt-1 text-2xl font-extrabold leading-none text-gray-900 tabular-nums">
            {loading
              ? <span className="inline-block h-7 w-20 animate-pulse rounded-lg bg-gray-100" />
              : value}
          </p>
        </div>
      </div>

      {/* Footer link */}
      {href && (
        <div className="relative mt-4 flex items-center gap-1 text-[11px] font-semibold text-gray-400 transition-colors group-hover:text-primary-600">
          View all
          <ArrowUpRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      )}
    </div>
  );

  return href ? <Link href={href}>{inner}</Link> : inner;
}

export default function AdminDashboard() {
  const {
    productStats, orderStats, customerCount,
    revenueByDay, orderStatusData, recentOrders, isLoading,
  } = useDashboardStats();

  const stats = [
    {
      label: "Total Revenue",
      value: formatCurrency(orderStats?.totalRevenue ?? 0),
      icon: DollarSign,
      color: "emerald",
    },
    {
      label: "Total Orders",
      value: orderStats?.totalOrders ?? 0,
      icon: ShoppingCart,
      color: "blue",
      href: "/admin/orders",
    },
    {
      label: "Pending",
      value: orderStats?.pendingOrders ?? 0,
      icon: Clock,
      color: "amber",
      href: "/admin/orders",
    },
    {
      label: "Customers",
      value: customerCount,
      icon: Users,
      color: "purple",
      href: "/admin/customers",
    },
    {
      label: "Products",
      value: productStats?.total_products ?? 0,
      icon: Package,
      color: "indigo",
      href: "/admin/products",
    },
    {
      label: "Low Stock",
      value: productStats?.low_stock ?? 0,
      icon: AlertTriangle,
      color: "rose",
      href: "/admin/products",
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} loading={isLoading} />
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Revenue</h3>
              <p className="text-xs text-gray-500 mt-0.5">Last 30 days</p>
            </div>
            <div className="flex items-center gap-1 rounded-full bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-600">
              <TrendingUp className="h-3 w-3" />
              30d trend
            </div>
          </div>
          <RevenueChart data={revenueByDay} />
        </div>

        <div className="card p-5">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Orders by Status</h3>
            <p className="text-xs text-gray-500 mt-0.5">Last 30 days</p>
          </div>
          <OrdersStatusChart data={orderStatusData} />
        </div>
      </div>

      {/* Recent orders */}
      <div className="card">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h3 className="text-sm font-semibold text-gray-900">Recent Orders</h3>
          <Link href="/admin/orders" className="text-xs font-medium text-primary-600 hover:underline">
            View all
          </Link>
        </div>
        <div className="divide-y divide-gray-50">
          {isLoading ? (
            <div className="px-5 py-4 text-sm text-gray-500">Loading…</div>
          ) : recentOrders.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-gray-500">No orders yet</div>
          ) : (
            recentOrders.map((order) => (
              <div key={order.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/50 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {order.customer_first_name} {order.customer_last_name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{order.customer_email}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-gray-900">{formatCurrency(order.final_total)}</p>
                  <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${PAYMENT_STATUS_STYLES[order.payment_status] ?? "bg-gray-100 text-gray-700"}`}>
                  {order.payment_status?.charAt(0) + order.payment_status?.slice(1).toLowerCase()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
