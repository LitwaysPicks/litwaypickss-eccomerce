"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { addCategoryAction, deleteCategoryAction } from "@/app/actions/categories";

export function useCategories() {
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name", { ascending: true });
      if (error) throw error;
      return data;
    },
    staleTime: 60_000,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
  };

  const addCategory = useMutation({
    mutationFn: addCategoryAction,
    onSuccess: () => {
      toast.success("Category added");
      invalidate();
    },
    onError: (err) => toast.error(err.message || "Failed to add category"),
  });

  const deleteCategory = useMutation({
    mutationFn: deleteCategoryAction,
    onMutate: async (categoryId) => {
      await queryClient.cancelQueries({ queryKey: ["admin-categories"] });
      const previous = queryClient.getQueryData(["admin-categories"]);
      queryClient.setQueryData(["admin-categories"], (old = []) =>
        old.filter((c) => c.id !== categoryId)
      );
      return { previous };
    },
    onError: (err, _id, context) => {
      queryClient.setQueryData(["admin-categories"], context?.previous);
      toast.error(err.message || "Failed to delete category");
    },
    onSuccess: () => {
      toast.success("Category deleted");
      invalidate();
    },
  });

  return { categories, isLoading, addCategory, deleteCategory };
}
