"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_product_stats");
      if (error) throw error;
      return data;
    },
    staleTime: 60_000, // stats are fine being 1 min stale
  });
}
