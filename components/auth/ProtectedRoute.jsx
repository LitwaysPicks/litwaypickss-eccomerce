"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function ProtectedRoute({
  children,
  requireAdmin = false,
  requireAuth = true,
}) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    if ((requireAuth || requireAdmin) && !isAuthenticated) {
      router.replace(`/login?from=${encodeURIComponent(pathname)}`);
      return;
    }

    if (requireAdmin && !isAdmin) {
      router.replace("/unauthorized");
    }
  }, [isLoading, isAuthenticated, isAdmin, requireAuth, requireAdmin, router, pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  if ((requireAuth || requireAdmin) && !isAuthenticated) return null;
  if (requireAdmin && !isAdmin) return null;

  return children;
}
