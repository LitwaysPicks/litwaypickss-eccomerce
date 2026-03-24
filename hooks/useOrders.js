"use client";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export const ORDERS_PAGE_SIZE = 25;

export function useOrders({ status = "", search = "", page = 0 } = {}) {
  const queryClient = useQueryClient();

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["admin-orders", { status, search, page }],
    queryFn: async () => {
      let query = supabase
        .from("orders")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(page * ORDERS_PAGE_SIZE, (page + 1) * ORDERS_PAGE_SIZE - 1);

      if (status) query = query.eq("payment_status", status);
      if (search) {
        query = query.or(
          `customer_email.ilike.%${search}%,customer_first_name.ilike.%${search}%,customer_last_name.ilike.%${search}%,external_id.ilike.%${search}%`
        );
      }

      const { data, error, count } = await query;
      if (error) throw error;
      return { orders: data ?? [], totalCount: count ?? 0 };
    },
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });

  const updateStatus = useMutation({
    mutationFn: async ({ orderId, status }) => {
      const { error } = await supabase
        .from("orders")
        .update({ payment_status: status, updated_at: new Date().toISOString() })
        .eq("id", orderId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Order status updated");
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-order-stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin-orders-30d"] });
    },
    onError: () => toast.error("Failed to update order"),
  });

  return {
    orders: data?.orders ?? [],
    totalCount: data?.totalCount ?? 0,
    pageCount: Math.ceil((data?.totalCount ?? 0) / ORDERS_PAGE_SIZE),
    isLoading,
    isFetching,
    updateStatus,
  };
}
