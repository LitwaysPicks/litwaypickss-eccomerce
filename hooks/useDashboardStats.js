"use client";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAdminStats } from "./useAdminStats";

export function useDashboardStats() {
  const { data: productStats } = useAdminStats();

  const { data: recentOrders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["admin-orders-30d"],
    queryFn: async () => {
      const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from("orders")
        .select("id,created_at,final_total,payment_status,customer_first_name,customer_last_name,customer_email,external_id,payment_method")
        .gte("created_at", since)
        .order("created_at");
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 60_000,
  });

  const { data: orderStats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-order-stats"],
    queryFn: async () => {
      const [totalRes, pendingRes, revenueRes] = await Promise.all([
        supabase.from("orders").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("id", { count: "exact", head: true }).eq("payment_status", "PENDING"),
        supabase.from("orders").select("final_total").eq("payment_status", "COMPLETED"),
      ]);
      const totalRevenue = (revenueRes.data ?? []).reduce((s, o) => s + Number(o.final_total), 0);
      return {
        totalOrders: totalRes.count ?? 0,
        pendingOrders: pendingRes.count ?? 0,
        totalRevenue,
      };
    },
    staleTime: 60_000,
  });

  const { data: customerCount = 0 } = useQuery({
    queryKey: ["admin-customer-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("users")
        .select("id", { count: "exact", head: true })
        .eq("role", "customer");
      if (error) throw error;
      return count ?? 0;
    },
    staleTime: 5 * 60_000,
  });

  const revenueByDay = useMemo(() => {
    const byDay = {};
    recentOrders
      .filter((o) => o.payment_status === "COMPLETED")
      .forEach((o) => {
        const day = o.created_at.split("T")[0];
        byDay[day] = (byDay[day] || 0) + Number(o.final_total);
      });
    const result = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const key = d.toISOString().split("T")[0];
      result.push({
        date: key,
        label: d.toLocaleDateString("en", { month: "short", day: "numeric" }),
        revenue: byDay[key] || 0,
      });
    }
    return result;
  }, [recentOrders]);

  const orderStatusData = useMemo(() => {
    const counts = {};
    recentOrders.forEach((o) => {
      counts[o.payment_status] = (counts[o.payment_status] || 0) + 1;
    });
    const COLORS = { COMPLETED: "#22c55e", PENDING: "#f97316", FAILED: "#ef4444", REFUNDED: "#8b5cf6" };
    return Object.entries(counts).map(([status, count]) => ({
      name: status.charAt(0) + status.slice(1).toLowerCase(),
      value: count,
      color: COLORS[status] || "#94a3b8",
    }));
  }, [recentOrders]);

  return {
    productStats,
    orderStats,
    customerCount,
    revenueByDay,
    orderStatusData,
    recentOrders: [...recentOrders].reverse().slice(0, 5),
    isLoading: ordersLoading || statsLoading,
  };
}
