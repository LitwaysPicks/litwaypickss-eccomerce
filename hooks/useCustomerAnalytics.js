"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

/**
 * Customer analytics for the admin Analytics page. All aggregation happens in
 * the database (get_customer_analytics), which also enforces admin-only access.
 */
export function useCustomerAnalytics(days = 30) {
  return useQuery({
    queryKey: ["admin-customer-analytics", days],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_customer_analytics", { p_days: days });
      if (error) throw error;
      return data;
    },
    staleTime: 60_000,
    placeholderData: keepPreviousData,
    retry: 1,
  });
}
