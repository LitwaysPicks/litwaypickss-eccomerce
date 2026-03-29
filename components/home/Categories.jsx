"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, slug, image, item_count");

      if (!error) {
        setCategories(data);
      }

      setLoading(false);
    };

    fetchCategories();
  }, []);

  return (
    <section className="py-10 md:py-16">
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Shop by Category</h2>
        <p className="mt-1 text-gray-500">Explore our wide range of product categories</p>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Loading categories...</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link key={category.slug} href={`/shop/${category.slug}`}>
              <div className="group cursor-pointer overflow-hidden card">
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent" />
                  <div className="absolute inset-0 flex flex-col items-end justify-end text-white p-4">
                    <h3 className="font-semibold text-base md:text-lg leading-tight">
                      {category.name}
                    </h3>
                    <p className="text-xs text-white/70 mt-0.5">
                      {category.item_count} items
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
