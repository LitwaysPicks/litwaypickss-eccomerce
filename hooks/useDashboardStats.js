"use client";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAdminStats } from "./useAdminStats";

export function useDashboardStats() {
  const { data: productStats, isLoading: productStatsLoading } = useAdminStats();

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
    retry: 1,
  });

  const { data: orderStats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-order-stats"],
    queryFn: async () => {
      // Single RPC call — aggregation done in Postgres, not in the browser.
      // Previously this fetched every final_total row and summed in JS.
      const { data, error } = await supabase.rpc("get_order_stats");
      if (error) throw error;
      return {
        totalOrders: data?.total_orders ?? 0,
        pendingOrders: data?.pending_orders ?? 0,
        totalRevenue: Number(data?.total_revenue ?? 0),
      };
    },
    staleTime: 60_000,
    retry: 1,
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
    retry: 1,
  });

  const revenueByDay = useMemo(() => {
    const byDay = {};
    recentOrders
      .filter((o) => o.payment_status === "COMPLETED" || o.payment_status === "SUCCESSFUL")
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
    const COLORS = { SUCCESSFUL: "#3b82f6", COMPLETED: "#22c55e", PENDING: "#f97316", FAILED: "#ef4444", REFUNDED: "#8b5cf6" };
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
    isLoading: ordersLoading || statsLoading || productStatsLoading,
  };
}
