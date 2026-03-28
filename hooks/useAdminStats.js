"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [totalRes, lowStockRes] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase
          .from("products")
          .select("id", { count: "exact", head: true })
          .lte("stock", 10),
      ]);

      if (totalRes.error) throw totalRes.error;
      if (lowStockRes.error) throw lowStockRes.error;

      return {
        total_products: totalRes.count ?? 0,
        low_stock: lowStockRes.count ?? 0,
      };
    },
    staleTime: 60_000,
    retry: 1,
  });
}
