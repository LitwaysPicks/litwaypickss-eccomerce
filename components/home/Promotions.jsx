"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Clock, ArrowRight } from "lucide-react";
import ProductCard from "@/components/products/ProductCard";
import ProductCardSkeleton from "@/components/products/ProductCardSkeleton";
import { supabase } from "@/lib/supabase";

const PER_SECTION = 3;

const CARD_COLUMNS = [
  "id", "name", "slug", "price", "sale_price", "stock",
  "featured", "image_urls", "category_slug", "category_name",
  "brand", "rating", "review_count", "created_at", "sizes", "colors",
].join(",");

const discountOf = (p) =>
  p.sale_price && p.price ? (p.price - p.sale_price) / p.price : 0;

async function fetchPromotions() {
  const base = () =>
    supabase.from("products_with_categories").select(CARD_COLUMNS).gt("stock", 0);

  const [deals, bestSellers, trending] = await Promise.all([
    base().not("sale_price", "is", null).limit(30),
    base()
      .order("review_count", { ascending: false, nullsFirst: false })
      .order("rating", { ascending: false, nullsFirst: false })
      .limit(PER_SECTION),
    base().order("created_at", { ascending: false }).limit(PER_SECTION),
  ]);

  const firstError = deals.error || bestSellers.error || trending.error;
  if (firstError) throw firstError;

  // Biggest real discounts first (sale price must actually be below price).
  const todaysDeals = (deals.data ?? [])
    .filter((p) => discountOf(p) > 0)
    .sort((a, b) => discountOf(b) - discountOf(a))
    .slice(0, PER_SECTION);

  return {
    deals: todaysDeals,
    bestSellers: bestSellers.data ?? [],
    trending: trending.data ?? [],
  };
}

// Time left until local midnight, i.e. when "today's" deals roll over.
function timeUntilMidnight() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const total = Math.max(0, Math.floor((midnight - now) / 1000));
  return {
    hours: Math.floor(total / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

const pad = (n) => String(n).padStart(2, "0");

export default function Promotions() {
  // Starts null so server and client render the same markup; filled in after mount.
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    const tick = () => setTimeLeft(timeUntilMidnight());
    const first = setTimeout(tick, 0);
    const timer = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, []);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["home-promotions"],
    queryFn: fetchPromotions,
    staleTime: 1000 * 60 * 5,
  });

  const sections = [
    {
      key: "deals",
      title: "Today's Deal",
      badge: "Limited Time",
      badgeColor: "bg-red-500",
      href: "/shop",
      hasTimer: true,
    },
    {
      key: "bestSellers",
      title: "Best Sellers",
      badge: "Top Rated",
      badgeColor: "bg-amber-500",
      href: "/shop?sort=rating",
    },
    {
      key: "trending",
      title: "Trending Now",
      badge: "Hot",
      badgeColor: "bg-orange-500",
      href: "/shop?sort=newest",
    },
  ];

  // Nothing worth showing (error, or the store has no products yet).
  if (isError) return null;
  if (!isLoading && sections.every((s) => !data?.[s.key]?.length)) return null;

  return (
    <section className="py-10 md:py-16">
      <div className="mb-6 md:mb-10">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Special Offers</h2>
        <p className="mt-1 text-sm md:text-base text-gray-500">Deals and trending products, updated regularly</p>
      </div>

      <div className="space-y-10 md:space-y-12">
        {sections.map((section) => {
          const products = data?.[section.key] ?? [];
          if (!isLoading && products.length === 0) return null;

          return (
            <div key={section.key}>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
                  <span className={`${section.badgeColor} text-white px-2 py-0.5 rounded text-xs font-semibold`}>
                    {section.badge}
                  </span>
                </div>

                {section.hasTimer && timeLeft && (
                  <div className="flex items-center gap-1.5 text-sm font-semibold tabular-nums text-red-600">
                    <Clock className="h-3.5 w-3.5" />
                    <span>
                      {pad(timeLeft.hours)}:{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                {isLoading
                  ? Array.from({ length: PER_SECTION }).map((_, i) => <ProductCardSkeleton key={i} />)
                  : products.map((product) => <ProductCard key={product.id} product={product} />)}

                {/* View All — the whole card is the link */}
                <Link
                  href={section.href}
                  className="card flex flex-col items-center justify-center p-4 text-center border-dashed gap-3 hover:border-primary-400 hover:bg-primary-50/40 transition-colors"
                >
                  <p className="font-medium text-sm text-gray-700">View All {section.title}</p>
                  <span className="btn btn-outline text-xs inline-flex items-center gap-1.5">
                    Browse More
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
