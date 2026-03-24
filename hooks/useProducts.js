"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export const PAGE_SIZE = 20;

const PRODUCT_FIELDS =
  "id,name,slug,price,sale_price,stock,featured,category_slug,brand,rating,review_count,image_urls,category_name";

async function fetchProducts({ search, category, page }) {
  let query = supabase
    .from("products_with_categories")
    .select(PRODUCT_FIELDS, { count: "exact" })
    .order("id", { ascending: false })
    .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

  if (search) query = query.or(`name.ilike.%${search}%,brand.ilike.%${search}%`);
  if (category) query = query.eq("category_slug", category);

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    products: data.map((p) => ({ ...p, images: p.image_urls ?? [] })),
    totalCount: count ?? 0,
  };
}

// Invalidate every admin query that depends on product data
function useInvalidateAdminData() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    queryClient.invalidateQueries({ queryKey: ["admin-recent-products"] });
    queryClient.invalidateQueries({ queryKey: ["admin-low-stock"] });
  };
}

export function useProducts({ search = "", category = "", page = 0 } = {}) {
  const queryClient = useQueryClient();
  const invalidateAll = useInvalidateAdminData();

  // ── Products (server-side filtered + paginated) ─────────────────────────
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["admin-products", { search, category, page }],
    queryFn: () => fetchProducts({ search, category, page }),
    staleTime: 30_000,
    placeholderData: keepPreviousData, // keeps previous page visible while next loads
  });

  // ── Categories (rarely changes) ─────────────────────────────────────────
  const { data: categories = [] } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*");
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60_000,
  });

  // ── Add ─────────────────────────────────────────────────────────────────
  const addProduct = useMutation({
    mutationFn: async (productData) => {
      const { data: newProduct, error } = await supabase
        .from("products")
        .insert({
          name: productData.name,
          slug: productData.slug,
          description: productData.description,
          price: productData.price,
          sale_price: productData.salePrice,
          stock: productData.stock,
          featured: productData.featured ?? false,
          category_slug: productData.category,
          sizes: productData.sizes,
          brand: productData.brand,
          rating: 0,
          review_count: 0,
          keywords: productData.keywords,
          colors: productData.colors,
          image_urls: productData.images,
          video_url: productData.videoUrl,
        })
        .select()
        .single();

      if (error) throw error;

      if (productData.tags?.length > 0) {
        const { error: tagError } = await supabase
          .from("product_tags")
          .insert(productData.tags.map((tag) => ({ product_id: newProduct.id, tag })));
        if (tagError) throw tagError;
      }

      return newProduct;
    },
    onSuccess: () => {
      toast.success("Product added successfully!");
      invalidateAll();
    },
    onError: () => toast.error("Failed to add product"),
  });

  // ── Update ───────────────────────────────────────────────────────────────
  const updateProduct = useMutation({
    mutationFn: async ({ productData, productId }) => {
      const { error } = await supabase
        .from("products")
        .update({
          name: productData.name,
          slug: productData.slug,
          description: productData.description,
          price: productData.price,
          sale_price: productData.salePrice,
          stock: productData.stock,
          featured: productData.featured ?? false,
          category_slug: productData.category,
          sizes: productData.sizes,
          brand: productData.brand,
          keywords: productData.keywords,
          colors: productData.colors,
          image_urls: productData.images,
          video_url: productData.videoUrl,
        })
        .eq("id", productId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Product updated successfully!");
      invalidateAll();
    },
    onError: () => toast.error("Failed to update product"),
  });

  // ── Delete (optimistic) ──────────────────────────────────────────────────
  const deleteProduct = useMutation({
    mutationFn: async (productId) => {
      await supabase.from("product_tags").delete().eq("product_id", productId);
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productId);
      if (error) throw error;
    },
    onMutate: async (productId) => {
      // Cancel in-flight fetches so they don't overwrite the optimistic update
      await queryClient.cancelQueries({ queryKey: ["admin-products"] });

      // Snapshot all pages so we can roll back any of them
      const previousQueries = queryClient.getQueriesData({
        queryKey: ["admin-products"],
      });

      // Remove from every cached page immediately
      queryClient.setQueriesData({ queryKey: ["admin-products"] }, (old) => {
        if (!old) return old;
        return {
          ...old,
          products: old.products.filter((p) => p.id !== productId),
          totalCount: old.totalCount - 1,
        };
      });

      return { previousQueries };
    },
    onError: (err, productId, context) => {
      // Roll back to the snapshot
      context?.previousQueries?.forEach(([key, value]) => {
        queryClient.setQueryData(key, value);
      });
      toast.error("Failed to delete product");
    },
    onSuccess: () => {
      toast.success("Product deleted successfully!");
      invalidateAll();
    },
  });

  // ── Load product for editing (on-demand, not a query) ───────────────────
  const loadProductForEdit = async (product) => {
    try {
      const { data: productTags } = await supabase
        .from("product_tags")
        .select("tag")
        .eq("product_id", product.id);

      return {
        ...product,
        images: product.image_urls ?? [],
        tags: productTags?.map((t) => t.tag) ?? [],
      };
    } catch {
      toast.error("Failed to load product details");
      return null;
    }
  };

  const products = data?.products ?? [];
  const totalCount = data?.totalCount ?? 0;
  const pageCount = Math.ceil(totalCount / PAGE_SIZE);

  return {
    products,
    totalCount,
    pageCount,
    categories,
    isLoading,
    isFetching,
    addProduct,
    updateProduct,
    deleteProduct,
    loadProductForEdit,
  };
}
