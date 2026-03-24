"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Eye, EyeOff } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { updatePasswordAction } from "@/app/actions/auth";
import { queryClient } from "@/lib/queryClient";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  // "verifying" | "valid" | "invalid"
  const [tokenStatus, setTokenStatus] = useState("verifying");

  // Supabase JS v2 uses PKCE by default. The reset email redirects here with
  // ?token_hash=...&type=recovery in the query string. We must call verifyOtp
  // to exchange that hash for a live recovery session before updateUser works.
  // This stays client-side because it requires the URL params from the browser.
  useEffect(() => {
    const token_hash = searchParams.get("token_hash");
    const type = searchParams.get("type");

    if (!token_hash || type !== "recovery") {
      setTokenStatus("invalid");
      return;
    }

    supabase.auth
      .verifyOtp({ token_hash, type: "recovery" })
      .then(({ error }) => {
        if (error) {
          setTokenStatus("invalid");
          toast.error(error.message || "Reset link is invalid or has expired.");
        } else {
          setTokenStatus("valid");
        }
      });
  }, [searchParams]);

  const resetMutation = useMutation({
    mutationFn: updatePasswordAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth-user"] });
      toast.success("Password updated successfully! Please sign in again.");
      router.push("/login");
    },
    onError: (err) => toast.error(err.message || "Failed to reset password"),
  });

  const mismatch = confirm.length > 0 && password !== confirm;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password.length < 8 || mismatch) return;
    resetMutation.mutate(password);
  };

  if (tokenStatus === "verifying") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (tokenStatus === "invalid") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-8 text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Link Invalid or Expired</h1>
          <p className="text-sm text-gray-500 mb-6">
            This password reset link is invalid or has already been used. Please request a new one.
          </p>
          <button onClick={() => router.push("/login")} className="btn btn-primary">
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Set New Password</h1>
        <p className="text-sm text-gray-500 mb-6">Choose a new password for your account.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input pl-10 pr-10"
                placeholder="At least 8 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className={`input pl-10 ${mismatch ? "border-red-400 focus:ring-red-400" : ""}`}
                placeholder="Repeat your password"
              />
            </div>
            {mismatch && (
              <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
            )}
          </div>

          <button
            type="submit"
            disabled={resetMutation.isPending || mismatch || password.length < 8}
            className="w-full btn btn-primary py-3 disabled:opacity-50"
          >
            {resetMutation.isPending ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" /></div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
