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
    .eq("featured", true);
  if (error) throw error;
  return data ?? [];
}

export default function FeaturedProducts() {
  const { data: products = [], isLoading, isError } = useQuery({
    queryKey: ["featured-products"],
    queryFn: fetchFeaturedProducts,
    staleTime: 1000 * 60 * 5, // 5 minutes — category listings don't change often
  });

  return (
    <section className="py-16">
      <div className="text-center mb-12">
        <div className="inline-flex items-center space-x-2 bg-linear-to-r from-primary-100 to-orange-100 rounded-full px-6 py-2 mb-4">
          <span className="text-primary-600 font-semibold text-sm">✨ FEATURED</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Featured Products
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Discover our handpicked selection of premium products
        </p>
      </div>

      {isError ? (
        <p className="text-center text-red-500 py-8">Failed to load featured products.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
        </div>
      )}

      <div className="text-center">
        <Link
          href="/shop"
          className="btn btn-primary inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
        >
          View All Products
          <ArrowRight className="h-5 w-5" />
        </Link>
      </div>
    </section>
  );
}
