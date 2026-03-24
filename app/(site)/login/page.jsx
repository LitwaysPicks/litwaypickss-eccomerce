"use client";

import React, { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import LoginModal from "@/components/auth/LoginModal";

function LoginContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const from = searchParams.get("from") ?? "/";

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(from);
    }
  }, [isLoading, isAuthenticated, router, from]);

  if (isLoading || isAuthenticated) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <LoginModal
        isOpen={true}
        onClose={() => router.replace("/")}
        onSuccess={() => router.replace(from)}
      />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50" />}>
      <LoginContent />
    </Suspense>
  );
}
