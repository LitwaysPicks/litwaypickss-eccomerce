"use client";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export const CUSTOMERS_PAGE_SIZE = 25;

export function useCustomers({ search = "", page = 0 } = {}) {
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["admin-customers", { search, page }],
    queryFn: async () => {
      let query = supabase
        .from("users")
        .select("id,first_name,last_name,email,phone,city,country,created_at", { count: "exact" })
        .eq("role", "customer")
        .order("created_at", { ascending: false })
        .range(page * CUSTOMERS_PAGE_SIZE, (page + 1) * CUSTOMERS_PAGE_SIZE - 1);

      if (search) {
        query = query.or(
          `email.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%`
        );
      }

      const { data, error, count } = await query;
      if (error) throw error;
      return { customers: data ?? [], totalCount: count ?? 0 };
    },
    staleTime: 60_000,
    placeholderData: keepPreviousData,
    retry: 1,
  });

  return {
    customers: data?.customers ?? [],
    totalCount: data?.totalCount ?? 0,
    pageCount: Math.ceil((data?.totalCount ?? 0) / CUSTOMERS_PAGE_SIZE),
    isLoading,
    isFetching,
  };
}
