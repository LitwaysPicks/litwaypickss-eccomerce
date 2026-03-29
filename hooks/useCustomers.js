"use client";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { deleteUserAction, createAdminUserAction } from "@/app/actions/users";

export const CUSTOMERS_PAGE_SIZE = 25;

async function fetchUsers({ role, search, page }) {
  let query = supabase
    .from("users")
    .select("id,first_name,last_name,email,phone,city,country,created_at", { count: "exact" })
    .eq("role", role)
    .order("created_at", { ascending: false })
    .range(page * CUSTOMERS_PAGE_SIZE, (page + 1) * CUSTOMERS_PAGE_SIZE - 1);

  if (search) {
    query = query.or(
      `email.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%`
    );
  }

  const { data, error, count } = await query;
  if (error) throw error;
  return { users: data ?? [], totalCount: count ?? 0 };
}

export function useCustomers({ search = "", page = 0 } = {}) {
  const queryClient = useQueryClient();

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["admin-customers", { search, page }],
    queryFn: () => fetchUsers({ role: "customer", search, page }),
    staleTime: 60_000,
    placeholderData: keepPreviousData,
    retry: 1,
  });

  const { data: adminsData, isLoading: adminsLoading } = useQuery({
    queryKey: ["admin-admins"],
    queryFn: () => fetchUsers({ role: "admin", search: "", page: 0 }),
    staleTime: 60_000,
    retry: 1,
  });

  const deleteUser = useMutation({
    mutationFn: deleteUserAction,
    onMutate: async (userId) => {
      await queryClient.cancelQueries({ queryKey: ["admin-customers"] });
      const previous = queryClient.getQueriesData({ queryKey: ["admin-customers"] });
      queryClient.setQueriesData({ queryKey: ["admin-customers"] }, (old) => {
        if (!old) return old;
        return { ...old, users: old.users.filter((u) => u.id !== userId), totalCount: old.totalCount - 1 };
      });
      return { previous };
    },
    onError: (err, _id, context) => {
      context?.previous?.forEach(([key, value]) => queryClient.setQueryData(key, value));
      toast.error(err.message || "Failed to delete user");
    },
    onSuccess: () => {
      toast.success("User deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-customers"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });

  const createAdmin = useMutation({
    mutationFn: createAdminUserAction,
    onSuccess: () => {
      toast.success("Admin account created");
      queryClient.invalidateQueries({ queryKey: ["admin-admins"] });
    },
    onError: (err) => toast.error(err.message || "Failed to create admin"),
  });

  const deleteAdmin = useMutation({
    mutationFn: deleteUserAction,
    onMutate: async (userId) => {
      await queryClient.cancelQueries({ queryKey: ["admin-admins"] });
      const previous = queryClient.getQueryData(["admin-admins"]);
      queryClient.setQueryData(["admin-admins"], (old) => {
        if (!old) return old;
        return { ...old, users: old.users.filter((u) => u.id !== userId) };
      });
      return { previous };
    },
    onError: (err, _id, context) => {
      queryClient.setQueryData(["admin-admins"], context?.previous);
      toast.error(err.message || "Failed to delete admin");
    },
    onSuccess: () => {
      toast.success("Admin deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-admins"] });
    },
  });

  return {
    customers: data?.users ?? [],
    totalCount: data?.totalCount ?? 0,
    pageCount: Math.ceil((data?.totalCount ?? 0) / CUSTOMERS_PAGE_SIZE),
    isLoading,
    isFetching,
    deleteUser,
    admins: adminsData?.users ?? [],
    adminsLoading,
    createAdmin,
    deleteAdmin,
  };
}
