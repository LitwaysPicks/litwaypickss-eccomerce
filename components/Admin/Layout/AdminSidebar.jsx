"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { logoutUser } from "@/lib/auth";
import {
  LayoutDashboard, Package, ShoppingCart, Users, Settings,
  LogOut,
} from "lucide-react";

const NAV = [
  {
    group: "Overview",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    ],
  },
  {
    group: "Catalog",
    items: [
      { href: "/admin/products", label: "Products", icon: Package },
    ],
  },
  {
    group: "Commerce",
    items: [
      { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
      { href: "/admin/customers", label: "Customers", icon: Users },
    ],
  },
  {
    group: "Account",
    items: [
      { href: "/admin/settings", label: "Settings", icon: Settings },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  const logout = useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      queryClient.clear();
      router.push("/login");
    },
  });

  const isActive = (href, exact) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <div className="flex h-full w-64 flex-col bg-secondary-900">
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center gap-2.5 px-5 border-b border-white/8">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500 shadow-lg">
          <ShoppingCart className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-white leading-none">LitwayPicks</p>
          <p className="text-[10px] text-secondary-400 mt-0.5">Admin Portal</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-5">
          {NAV.map(({ group, items }) => (
            <div key={group}>
              <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-secondary-500">
                {group}
              </p>
              <div className="space-y-0.5">
                {items.map(({ href, label, icon: Icon, exact }) => {
                  const active = isActive(href, exact);
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 ${
                        active
                          ? "bg-primary-500/10 text-primary-400 shadow-sm"
                          : "text-secondary-400 hover:bg-white/[0.06] hover:text-secondary-100"
                      }`}
                    >
                      <div className={`flex h-5 w-5 items-center justify-center transition-colors ${
                        active ? "text-primary-400" : "text-secondary-500 group-hover:text-secondary-300"
                      }`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      {label}
                      {active && (
                        <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary-400" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>

      {/* User footer */}
      <div className="shrink-0 border-t border-white/8 p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-500 text-xs font-bold text-white">
            {user?.first_name?.[0]?.toUpperCase() ?? "A"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-secondary-100">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="truncate text-[10px] text-secondary-500">{user?.email}</p>
          </div>
          <button
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
            title="Sign out"
            className="shrink-0 rounded-md p-1.5 text-secondary-500 hover:bg-white/[0.08] hover:text-secondary-200 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
