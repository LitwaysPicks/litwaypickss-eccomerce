"use client";
import { Menu, Bell } from "lucide-react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";

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

export default function AdminTopbar({ onMenuClick }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const crumbs = BREADCRUMBS[pathname] ?? [{ label: TITLES[pathname] ?? "Admin" }];

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
        <button className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
          <Bell className="h-4 w-4" />
        </button>
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
