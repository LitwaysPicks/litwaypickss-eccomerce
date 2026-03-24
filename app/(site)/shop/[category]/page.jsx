import ShopContent from "@/components/shop/ShopContent";
import { fetchProducts, fetchProductMeta } from "@/lib/products";

export default async function CategoryShopPage({ params: routeParams, searchParams }) {
  const { category } = await routeParams;
  const sp = await searchParams;

  const params = {
    category,
    search: sp.search || undefined,
    sortBy: sp.sort || "featured",
    minPrice: sp.minPrice ? Number(sp.minPrice) : undefined,
    maxPrice: sp.maxPrice ? Number(sp.maxPrice) : undefined,
    brands: sp.brands ? sp.brands.split(",") : undefined,
    sizes: sp.sizes ? sp.sizes.split(",") : undefined,
    page: sp.page ? Number(sp.page) : 1,
  };

  const [{ products, total, pageCount }, { categories, brands }] = await Promise.all([
    fetchProducts(params),
    fetchProductMeta(),
  ]);

  return (
    <ShopContent
      initialProducts={products}
      initialTotal={total}
      initialPageCount={pageCount}
      categories={categories}
      brands={brands}
      params={params}
    />
  );
}
