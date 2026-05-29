"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { addCategoryAction, editCategoryAction, deleteCategoryAction } from "@/app/actions/categories";

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
    mutationFn: async (data) => {
      const result = await addCategoryAction(data);
      if (result?.error) throw new Error(result.error);
    },
    onSuccess: () => {
      toast.success("Category added");
      invalidate();
    },
    onError: (err) => toast.error(err.message || "Failed to add category"),
  });

  const deleteCategory = useMutation({
    mutationFn: async (id) => {
      const result = await deleteCategoryAction(id);
      if (result?.error) throw new Error(result.error);
    },
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

  const updateCategory = useMutation({
    mutationFn: async ({ id, updates }) => {
      const result = await editCategoryAction(id, updates);
      if (result?.error) throw new Error(result.error);
    },
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: ["admin-categories"] });
      const previous = queryClient.getQueryData(["admin-categories"]);
      queryClient.setQueryData(["admin-categories"], (old = []) =>
        old.map((c) => (c.id === id ? { ...c, ...updates } : c))
      );
      return { previous };
    },
    onError: (err, _vars, context) => {
      queryClient.setQueryData(["admin-categories"], context?.previous);
      toast.error(err.message || "Failed to update category");
    },
    onSuccess: () => {
      toast.success("Category updated");
      invalidate();
    },
  });

  return { categories, isLoading, addCategory, updateCategory, deleteCategory };
}
