"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Clock, Star } from "lucide-react";
import { formatCurrency } from "@/lib/currency";

export default function Promotions() {
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 45, seconds: 30 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const promoSections = [
    {
      title: "Today's Deal",
      badge: "Limited Time",
      badgeColor: "bg-red-500",
      products: [
        {
          name: "Wireless Bluetooth Headphones",
          originalPrice: 150,
          salePrice: 89,
          image: "https://images.pexels.com/photos/3945667/pexels-photo-3945667.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
          rating: 4.8,
          reviews: 234,
        },
      ],
      hasTimer: true,
    },
    {
      title: "Best Sellers",
      badge: "Top Rated",
      badgeColor: "bg-amber-500",
      products: [
        {
          name: "Premium Cotton T-Shirt",
          originalPrice: 45,
          salePrice: 35,
          image: "https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
          rating: 4.9,
          reviews: 456,
        },
        {
          name: "Smart Fitness Watch",
          originalPrice: 299,
          salePrice: 199,
          image: "https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
          rating: 4.7,
          reviews: 189,
        },
      ],
    },
    {
      title: "Trending Now",
      badge: "Hot",
      badgeColor: "bg-orange-500",
      products: [
        {
          name: "Eco-Friendly Water Bottle",
          originalPrice: 25,
          salePrice: 18,
          image: "https://images.pexels.com/photos/3735709/pexels-photo-3735709.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
          rating: 4.6,
          reviews: 123,
        },
        {
          name: "Minimalist Backpack",
          originalPrice: 89,
          salePrice: 65,
          image: "https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
          rating: 4.8,
          reviews: 298,
        },
      ],
    },
  ];

  return (
    <section className="py-10 md:py-16">
      <div className="mb-6 md:mb-10">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Special Offers</h2>
        <p className="mt-1 text-sm md:text-base text-gray-500">Deals and trending products, updated regularly</p>
      </div>

      <div className="space-y-10 md:space-y-12">
        {promoSections.map((section) => {
          // cols = products + 1 view-all card, capped at 4
          const totalCols = Math.min(section.products.length + 1, 4);
          const gridCols =
            totalCols === 2 ? "grid-cols-2"
            : totalCols === 3 ? "grid-cols-2 md:grid-cols-3"
            : "grid-cols-2 md:grid-cols-4";

          return (
            <div key={section.title}>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
                  <span className={`${section.badgeColor} text-white px-2 py-0.5 rounded text-xs font-semibold`}>
                    {section.badge}
                  </span>
                </div>

                {section.hasTimer && (
                  <div className="flex items-center gap-1.5 text-sm font-semibold tabular-nums text-red-600">
                    <Clock className="h-3.5 w-3.5" />
                    <span>
                      {String(timeLeft.hours).padStart(2, "0")}:
                      {String(timeLeft.minutes).padStart(2, "0")}:
                      {String(timeLeft.seconds).padStart(2, "0")}
                    </span>
                  </div>
                )}
              </div>

              <div className={`grid ${gridCols} gap-3 md:gap-4`}>
                {section.products.map((product, productIndex) => (
                  <div key={productIndex} className="card overflow-hidden group cursor-pointer">
                    <div className="relative aspect-4/3 overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute top-2 left-2 bg-green-600 text-white px-2 py-0.5 rounded text-xs font-semibold">
                        {Math.round(((product.originalPrice - product.salePrice) / product.originalPrice) * 100)}% OFF
                      </span>
                    </div>
                    <div className="p-3 md:p-4 space-y-2">
                      <h4 className="font-medium text-sm text-gray-900 line-clamp-2 leading-snug">{product.name}</h4>
                      <div className="flex items-center gap-1">
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${i < Math.floor(product.rating) ? "text-amber-400 fill-current" : "text-gray-200 fill-current"}`}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] text-gray-400">({product.reviews})</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm md:text-base font-bold text-gray-900">{formatCurrency(product.salePrice)}</span>
                        <span className="text-xs text-gray-400 line-through">{formatCurrency(product.originalPrice)}</span>
                      </div>
                      <button className="w-full btn btn-primary text-xs py-1.5">Add to Cart</button>
                    </div>
                  </div>
                ))}

                {/* View All */}
                <div className="card flex flex-col items-center justify-center p-4 text-center border-dashed gap-2">
                  <p className="font-medium text-sm text-gray-700">View All {section.title}</p>
                  <Link href="/shop" className="btn btn-outline text-xs">Browse More</Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
