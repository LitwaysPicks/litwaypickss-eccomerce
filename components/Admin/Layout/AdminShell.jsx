"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";

export default function AdminShell({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  return (
    <ProtectedRoute requireAdmin>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        {sidebarOpen && (
          <div className="fixed inset-0 z-20 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}
        <aside className={`fixed inset-y-0 left-0 z-30 w-64 transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0 lg:flex lg:shrink-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <AdminSidebar />
        </aside>
        <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
          <AdminTopbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
          <main className="flex-1 overflow-y-auto">
            <div className="p-4 sm:p-6 lg:p-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
