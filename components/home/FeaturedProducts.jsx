"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import ProductCard from "@/components/products/ProductCard";
import ProductCardSkeleton from "@/components/products/ProductCardSkeleton";
import { supabase } from "@/lib/supabase";

async function fetchFeaturedProducts() {
  const { data, error } = await supabase
    .from("featured_products")
    .select("*")
    .eq("featured", true)
    .limit(8);
  if (error) throw error;
  return data ?? [];
}

export default function FeaturedProducts() {
  const { data: products = [], isLoading, isError } = useQuery({
    queryKey: ["featured-products"],
    queryFn: fetchFeaturedProducts,
    staleTime: 1000 * 60 * 5,
  });

  return (
    <section className="py-10 md:py-16">
      <div className="mb-6 md:mb-10">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Featured Products</h2>
        <p className="mt-1 text-gray-500 text-sm md:text-base">Handpicked selection of premium products</p>
      </div>

      {isError ? (
        <p className="text-center text-red-500 py-8">Failed to load featured products.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-8">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
        </div>
      )}

      <div>
        <Link href="/shop" className="btn btn-outline inline-flex items-center gap-2">
          View All Products
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
