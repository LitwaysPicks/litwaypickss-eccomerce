"use client";

import React, { createContext, useContext, useEffect, useRef, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "./supabase";
import { queryClient } from "./queryClient";
import { fetchAuthUser } from "./auth";

const AuthContext = createContext();

// Admin idle-timeout constants
const IDLE_TIMEOUT_MS = 15 * 60 * 1000;   // 15 min → force logout
const IDLE_WARNING_MS = 13 * 60 * 1000;   // 13 min → toast warning
const IDLE_EVENTS = ["mousemove", "keydown", "click", "scroll", "touchstart"];

export function AuthProvider({ children }) {
  const query = useQuery({
    queryKey: ["auth-user"],
    queryFn: fetchAuthUser,
    staleTime: Infinity, // never refetch on window focus — auth state is
    retry: 1,            // driven by onAuthStateChange subscription below
  });

  const authData = query.data;
  const isLoading = query.isPending;

  const user = authData?.user ?? null;
  const role = authData?.role ?? null;
  const isAuthenticated = !!user;
  const isAdmin = role === "admin";
  const isCustomer = role === "customer";

  // ── Admin idle-timeout ─────────────────────────────────────────────────────
  const idleTimerRef = useRef(null);
  const warningTimerRef = useRef(null);
  const warningToastIdRef = useRef(null);

  const clearIdleTimers = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (warningToastIdRef.current) toast.dismiss(warningToastIdRef.current);
  }, []);

  const forceLogout = useCallback(
    async (reason = "idle") => {
      clearIdleTimers();
      await supabase.auth.signOut();
      queryClient.invalidateQueries({ queryKey: ["auth-user"] });
      if (reason === "idle") {
        toast.warning("You were logged out due to inactivity.");
      } else if (reason === "token") {
        toast.error("Your session expired. Please sign in again.");
      }
    },
    [clearIdleTimers],
  );

  const resetIdleTimer = useCallback(() => {
    clearIdleTimers();
    warningTimerRef.current = setTimeout(() => {
      warningToastIdRef.current = toast.warning(
        "You will be logged out in 2 minutes due to inactivity.",
        { duration: 120_000, id: "idle-warning" },
      );
    }, IDLE_WARNING_MS);
    idleTimerRef.current = setTimeout(() => forceLogout("idle"), IDLE_TIMEOUT_MS);
  }, [clearIdleTimers, forceLogout]);

  useEffect(() => {
    if (!isAdmin) {
      clearIdleTimers();
      return;
    }
    IDLE_EVENTS.forEach((e) =>
      window.addEventListener(e, resetIdleTimer, { passive: true }),
    );
    resetIdleTimer();
    return () => {
      IDLE_EVENTS.forEach((e) => window.removeEventListener(e, resetIdleTimer));
      clearIdleTimers();
    };
  }, [isAdmin, resetIdleTimer, clearIdleTimers]);

  // ── Auth state subscription ────────────────────────────────────────────────
  // onAuthStateChange fires on login, logout, and token refresh events.
  // We skip INITIAL_SESSION since React Query already fetched on mount.
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "INITIAL_SESSION") return;

      if (event === "TOKEN_REFRESHED" && !session) {
        forceLogout("token");
        return;
      }

      queryClient.invalidateQueries({ queryKey: ["auth-user"] });
    });

    return () => subscription.unsubscribe();
  }, [forceLogout]);

  const contextValue = useMemo(
    () => ({
      user,
      role,
      isLoading,
      isAuthenticated,
      isAdmin,
      isCustomer,
    }),
    [user, role, isLoading, isAuthenticated, isAdmin, isCustomer],
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
