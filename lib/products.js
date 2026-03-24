import { unstable_cache } from "next/cache";
import { createClient } from "@supabase/supabase-js";

export const PAGE_SIZE = 24;

// Only columns needed for product cards — avoids transferring description, video_url, etc.
const CARD_COLUMNS = [
  "id", "name", "slug", "price", "sale_price", "stock",
  "featured", "image_urls", "category_slug", "category_name",
  "brand", "rating", "review_count", "created_at", "sizes", "colors",
].join(",");

function anonClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { auth: { persistSession: false } },
  );
}

// Normalize params before passing to unstable_cache so cache keys are consistent
// regardless of undefined vs missing fields, and array order.
function normalizeParams({
  category, search, sortBy, minPrice, maxPrice, brands, sizes, page,
} = {}) {
  return {
    category: category || null,
    search: search || null,
    sortBy: sortBy || "featured",
    minPrice: minPrice ?? null,
    maxPrice: maxPrice ?? null,
    brands: brands?.length ? [...brands].sort() : null,
    sizes: sizes?.length ? [...sizes].sort() : null,
    page: page || 1,
  };
}

// Cached at the server level — all users with the same params share one DB query.
// Revalidates every 60 s; call revalidateTag("products") after any product mutation.
const _fetchProducts = unstable_cache(
  async ({ category, search, sortBy, minPrice, maxPrice, brands, sizes, page }) => {
    const db = anonClient();
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let q = db
      .from("products_with_categories")
      .select(CARD_COLUMNS, { count: "exact" });

    // Push all filtering to the DB — no client-side filtering
    if (category) q = q.eq("category_slug", category);
    if (search) q = q.or(`name.ilike.%${search}%,brand.ilike.%${search}%,keywords.ilike.%${search}%`);
    // price is a numeric column — cast params to string so PostgREST matches the type
    if (minPrice != null) q = q.gte("price", String(minPrice));
    if (maxPrice != null) q = q.lte("price", String(maxPrice));
    if (brands) q = q.in("brand", brands);
    if (sizes) q = q.overlaps("sizes", sizes);

    switch (sortBy) {
      case "price-low":  q = q.order("price", { ascending: true }); break;
      case "price-high": q = q.order("price", { ascending: false }); break;
      case "newest":     q = q.order("created_at", { ascending: false }); break;
      case "rating":     q = q.order("rating", { ascending: false }); break;
      case "name":       q = q.order("name", { ascending: true }); break;
      default:
        q = q.order("featured", { ascending: false }).order("rating", { ascending: false });
    }

    q = q.range(from, to);

    const { data, count, error } = await q;
    if (error) throw new Error(error.message);

    return {
      products: (data || []).map((p) => ({ ...p, images: p.image_urls ?? [] })),
      total: count ?? 0,
      pageCount: Math.ceil((count ?? 0) / PAGE_SIZE),
    };
  },
  ["products"],
  { revalidate: 60, tags: ["products"] },
);

// Meta (categories + brands) changes far less often — cache for 5 minutes
const _fetchProductMeta = unstable_cache(
  async () => {
    const db = anonClient();
    const [{ data: cats }, { data: brandsData }] = await Promise.all([
      db.from("categories").select("id,name,slug"),
      db.rpc("get_distinct_brands"),
    ]);
    return {
      categories: cats || [],
      brands: (brandsData || []).map((r) => r.brand),
    };
  },
  ["product-meta"],
  { revalidate: 300, tags: ["products"] },
);

export async function fetchProducts(rawParams = {}) {
  return _fetchProducts(normalizeParams(rawParams));
}

export async function fetchProductMeta() {
  return _fetchProductMeta();
}
