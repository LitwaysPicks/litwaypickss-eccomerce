import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Star, Truck, Shield, RotateCcw, Tag } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatCurrency } from "@/lib/currency";
import ProductCard from "@/components/products/ProductCard";
import ProductGallery from "@/components/products/ProductGallery";
import ProductActions from "@/components/products/ProductActions";
import ProductReviews from "@/components/products/ProductReviews";

const FALLBACK_IMAGE =
  "https://images.pexels.com/photos/5632396/pexels-photo-5632396.jpeg?auto=compress&cs=tinysrgb&w=600";

function formatCategorySlug(slug) {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: product } = await supabase
    .from("products")
    .select("name, description, image_urls, brand")
    .eq("slug", slug)
    .single();

  if (!product) return { title: "Product Not Found | LitwayPicks" };

  const image = product.image_urls?.[0];
  const description = product.description?.slice(0, 160) ?? "";

  return {
    title: `${product.name} | LitwayPicks`,
    description,
    openGraph: {
      title: `${product.name} | LitwayPicks`,
      description,
      images: image ? [{ url: image, width: 800, height: 800 }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | LitwayPicks`,
      description,
      images: image ? [image] : [],
    },
  };
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: productData, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !productData) notFound();

  const product = { ...productData, images: productData.image_urls ?? [] };

  // Fetch related products and reviews in parallel
  const admin = createAdminClient();
  const [relatedResult, reviewsResult] = await Promise.all([
    supabase
      .from("products")
      .select("*")
      .eq("category_slug", product.category_slug)
      .neq("id", product.id)
      .limit(4),
    admin
      .from("reviews")
      .select("id, rating, comment, created_at, user_id")
      .eq("product_id", product.id)
      .order("created_at", { ascending: false }),
  ]);

  const relatedProducts = (relatedResult.data ?? []).map((item) => ({
    ...item,
    images: item.image_urls ?? [],
  }));

  // Attach reviewer display names
  const rawReviews = reviewsResult.data ?? [];
  let reviews = rawReviews;
  if (rawReviews.length > 0) {
    const userIds = [...new Set(rawReviews.map((r) => r.user_id))];
    const { data: profiles } = await admin
      .from("profiles")
      .select("id, first_name, last_name")
      .in("id", userIds);
    const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]));
    reviews = rawReviews.map((r) => {
      const p = profileMap[r.user_id];
      return {
        ...r,
        displayName: p
          ? `${p.first_name ?? ""} ${p.last_name?.[0] ?? ""}.`.trim()
          : "Customer",
      };
    });
  }

  const discountPercentage = product.sale_price
    ? Math.round(((product.price - product.sale_price) / product.price) * 100)
    : 0;

  const sizes = Array.isArray(product.sizes) ? product.sizes : [];
  const colors = Array.isArray(product.colors) ? product.colors : [];
  const keywords = Array.isArray(product.keywords)
    ? product.keywords
    : typeof product.keywords === "string"
    ? product.keywords.split(",").map((k) => k.trim()).filter(Boolean)
    : [];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
        <Link href="/" className="hover:text-primary-600">Home</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-primary-600">Shop</Link>
        <span>/</span>
        <Link href={`/shop/${product.category_slug}`} className="hover:text-primary-600">
          {formatCategorySlug(product.category_slug)}
        </Link>
        <span>/</span>
        <span className="text-gray-900 line-clamp-1">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
        {/* Image gallery */}
        <ProductGallery
          images={product.images}
          videoUrl={product.video_url}
          name={product.name}
          discountPercentage={discountPercentage}
        />

        {/* Product Info */}
        <div className="space-y-6">
          <p className="text-sm text-gray-500 uppercase tracking-wide">{product.brand}</p>
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>

          {/* Rating summary */}
          {product.review_count > 0 && (
            <div className="flex items-center space-x-2">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(product.rating)
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {product.rating} ({product.review_count} review{product.review_count !== 1 ? "s" : ""})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center space-x-3">
            <span className="text-3xl font-bold text-gray-900">
              {formatCurrency(product.sale_price || product.price)}
            </span>
            {product.sale_price && (
              <span className="text-xl text-gray-500 line-through">
                {formatCurrency(product.price)}
              </span>
            )}
            {discountPercentage > 0 && (
              <span className="text-sm font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded">
                {discountPercentage}% off
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-gray-700 leading-relaxed">{product.description}</p>

          {/* Stock */}
          <p className={`font-medium ${product.stock > 0 ? "text-green-600" : "text-red-600"}`}>
            {product.stock > 0
              ? `✓ In Stock (${product.stock} available)`
              : "✗ Out of Stock"}
          </p>

          {/* Category */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="font-medium text-gray-700">Category:</span>
            <Link
              href={`/shop/${product.category_slug}`}
              className="text-primary-600 hover:underline"
            >
              {product.category_name || formatCategorySlug(product.category_slug)}
            </Link>
          </div>

          {/* Keywords / Tags */}
          {keywords.length > 0 && (
            <div className="flex items-start gap-2">
              <Tag className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
              <div className="flex flex-wrap gap-1.5">
                {keywords.map((kw) => (
                  <span
                    key={kw}
                    className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Variant selectors + Add to Cart */}
          <ProductActions product={product} />

          <div className="border-t pt-6 space-y-4">
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <Truck className="h-5 w-5 text-primary-600" />
              <span>Free nationwide delivery</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <Shield className="h-5 w-5 text-primary-600" />
              <span>Secure payment & warranty</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <RotateCcw className="h-5 w-5 text-primary-600" />
              <span>30-day return policy</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <ProductReviews
        reviews={reviews}
        averageRating={product.rating ?? 0}
        reviewCount={product.review_count ?? 0}
      />

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
