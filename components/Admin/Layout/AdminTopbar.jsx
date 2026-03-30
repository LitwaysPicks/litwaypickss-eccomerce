"use client";

import { useEffect, useRef, useState } from "react";
import { Menu, Bell, Package, ShoppingCart, Star, AlertTriangle, X, CheckCheck } from "lucide-react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import {
  fetchAdminNotificationsAction,
  markNotificationReadAction,
  markAllNotificationsReadAction,
} from "@/app/actions/notifications";

const TITLES = {
  "/admin": "Dashboard",
  "/admin/products": "Products",
  "/admin/orders": "Orders",
  "/admin/customers": "Customers",
  "/admin/settings": "Settings",
};

const BREADCRUMBS = {
  "/admin": [{ label: "Dashboard" }],
  "/admin/products": [{ label: "Catalog" }, { label: "Products" }],
  "/admin/orders": [{ label: "Commerce" }, { label: "Orders" }],
  "/admin/customers": [{ label: "Commerce" }, { label: "Customers" }],
  "/admin/settings": [{ label: "Account" }, { label: "Settings" }],
};

const TYPE_ICON = {
  order_placed:  <ShoppingCart className="h-4 w-4 text-green-600" />,
  order_failed:  <X className="h-4 w-4 text-red-500" />,
  new_review:    <Star className="h-4 w-4 text-yellow-500" />,
  low_stock:     <AlertTriangle className="h-4 w-4 text-orange-500" />,
  default:       <Package className="h-4 w-4 text-gray-500" />,
};

const TYPE_DOT = {
  order_placed: "bg-green-500",
  order_failed: "bg-red-500",
  new_review:   "bg-yellow-500",
  low_stock:    "bg-orange-500",
  default:      "bg-gray-400",
};

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function AdminTopbar({ onMenuClick }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const crumbs = BREADCRUMBS[pathname] ?? [{ label: TITLES[pathname] ?? "Admin" }];

  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const qc = useQueryClient();

  // Poll every 30 seconds
  const { data: notifications = [] } = useQuery({
    queryKey: ["admin-notifications"],
    queryFn: fetchAdminNotificationsAction,
    refetchInterval: 30_000,
    staleTime: 15_000,
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markRead = useMutation({
    mutationFn: markNotificationReadAction,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-notifications"] }),
  });

  const markAllRead = useMutation({
    mutationFn: markAllNotificationsReadAction,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-notifications"] }),
  });

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const handleBellClick = () => setOpen((v) => !v);

  const handleNotificationClick = (n) => {
    if (!n.read) markRead.mutate(n.id);
  };

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 lg:hidden"
        >
          <Menu className="h-4 w-4" />
        </button>

        <nav className="flex items-center gap-1.5 text-sm">
          {crumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-gray-300">/</span>}
              <span className={i === crumbs.length - 1 ? "font-semibold text-gray-900" : "text-gray-500"}>
                {crumb.label}
              </span>
            </span>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-1">
        {/* ── Notification Bell ─────────────────────────────────────── */}
        <div className="relative" ref={panelRef}>
          <button
            onClick={handleBellClick}
            className="relative flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {open && (
            <div className="absolute right-0 top-10 z-50 w-80 rounded-xl border border-gray-200 bg-white shadow-xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <span className="font-semibold text-gray-900 text-sm">
                  Notifications
                  {unreadCount > 0 && (
                    <span className="ml-2 rounded-full bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-600">
                      {unreadCount} new
                    </span>
                  )}
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllRead.mutate()}
                    disabled={markAllRead.isPending}
                    className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 disabled:opacity-50"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    Mark all read
                  </button>
                )}
              </div>

              {/* List */}
              <div className="max-h-96 overflow-y-auto divide-y divide-gray-50">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <Bell className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">No notifications yet</p>
                  </div>
                ) : (
                  notifications.map((n) => {
                    const icon = TYPE_ICON[n.type] ?? TYPE_ICON.default;
                    const dot  = TYPE_DOT[n.type]  ?? TYPE_DOT.default;
                    const linkHref =
                      n.type === "order_placed" || n.type === "order_failed"
                        ? "/admin/orders"
                        : n.type === "new_review"
                        ? `/admin/products`
                        : n.type === "low_stock"
                        ? "/admin/products"
                        : null;

                    const Inner = (
                      <div
                        className={`flex items-start gap-3 px-4 py-3 transition-colors ${
                          n.read ? "bg-white hover:bg-gray-50" : "bg-blue-50 hover:bg-blue-100"
                        }`}
                        onClick={() => handleNotificationClick(n)}
                      >
                        {/* type icon */}
                        <div className="mt-0.5 shrink-0 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-sm border border-gray-100">
                          {icon}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className={`text-sm font-medium truncate ${n.read ? "text-gray-700" : "text-gray-900"}`}>
                              {n.title}
                            </p>
                            {!n.read && (
                              <span className={`shrink-0 h-2 w-2 rounded-full ${dot}`} />
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                          <p className="text-[11px] text-gray-400 mt-1">{timeAgo(n.created_at)}</p>
                        </div>
                      </div>
                    );

                    return linkHref ? (
                      <Link key={n.id} href={linkHref} onClick={() => setOpen(false)}>
                        {Inner}
                      </Link>
                    ) : (
                      <div key={n.id}>{Inner}</div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="border-t border-gray-100 px-4 py-2.5 text-center">
                  <Link
                    href="/admin/orders"
                    onClick={() => setOpen(false)}
                    className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                  >
                    View all orders →
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        <Link
          href="/admin/settings"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-500 text-xs font-bold text-white hover:bg-primary-600 transition-colors"
        >
          {user?.first_name?.[0]?.toUpperCase() ?? "A"}
        </Link>
      </div>
    </header>
  );
}
