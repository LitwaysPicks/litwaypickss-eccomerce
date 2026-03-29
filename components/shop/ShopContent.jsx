"use client";

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Filter, Grid, List, Search, X, ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "@/components/products/ProductCard";
import ProductCardSkeleton from "@/components/products/ProductCardSkeleton";

const PAGE_SIZE = 24;

function buildUrl(category, filters) {
  const base = category ? `/shop/${category}` : "/shop";
  const p = new URLSearchParams();
  if (filters.search) p.set("search", filters.search);
  if (filters.sortBy && filters.sortBy !== "featured") p.set("sort", filters.sortBy);
  if (filters.minPrice) p.set("minPrice", filters.minPrice);
  if (filters.maxPrice && filters.maxPrice < 500) p.set("maxPrice", filters.maxPrice);
  if (filters.brands?.length) p.set("brands", filters.brands.join(","));
  if (filters.sizes?.length) p.set("sizes", filters.sizes.join(","));
  if (filters.page && filters.page > 1) p.set("page", filters.page);
  const qs = p.toString();
  return qs ? `${base}?${qs}` : base;
}

export default function ShopContent({
  initialProducts,
  initialTotal,
  initialPageCount,
  categories,
  brands: allBrands,
  params,
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);

  // Local-only state for the price slider — commits to URL on pointer release
  const [localMaxPrice, setLocalMaxPrice] = useState(params.maxPrice ?? 500);

  // Sync slider position when params change (e.g. navigated back / cleared)
  useEffect(() => {
    setLocalMaxPrice(params.maxPrice ?? 500);
  }, [params.maxPrice]);

  const category = params.category;
  const currentPage = params.page ?? 1;

  const hasActiveFilters =
    (params.maxPrice ?? 500) < 500 ||
    (params.brands?.length ?? 0) > 0 ||
    (params.sizes?.length ?? 0) > 0;

  const filterCount =
    ((params.maxPrice ?? 500) < 500 ? 1 : 0) +
    (params.brands?.length ?? 0) +
    (params.sizes?.length ?? 0);

  // Navigate with new filter values, always reset to page 1
  const navigate = (patch) => {
    startTransition(() => {
      router.push(buildUrl(category, { ...params, ...patch, page: 1 }));
    });
  };

  const navigatePage = (page) => {
    startTransition(() => {
      router.push(buildUrl(category, { ...params, page }));
    });
  };

  const clearFilters = () => {
    setLocalMaxPrice(500);
    startTransition(() => {
      router.push(buildUrl(category, { search: params.search, sortBy: params.sortBy }));
    });
  };

  const clearSearch = () => {
    startTransition(() => {
      router.push(category ? `/shop/${category}` : "/shop");
    });
  };

  const toggleBrand = (brand) => {
    const current = params.brands ?? [];
    navigate({
      brands: current.includes(brand) ? current.filter((b) => b !== brand) : [...current, brand],
    });
  };

  const toggleSize = (size) => {
    const current = params.sizes ?? [];
    navigate({
      sizes: current.includes(size) ? current.filter((s) => s !== size) : [...current, size],
    });
  };

  const currentCategory = categories.find((c) => c.slug === category);
  const pageTitle = params.search
    ? `Search results for "${params.search}"`
    : currentCategory?.name || "All Products";

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{pageTitle}</h1>
          <div className="flex items-center space-x-4">
            <p className="text-gray-600">
              {isPending ? "Loading..." : `${initialTotal} products found`}
            </p>
            {params.search && (
              <button
                onClick={clearSearch}
                className="flex items-center space-x-1 text-sm text-red-600 hover:text-red-700 transition-colors"
              >
                <X className="h-4 w-4" />
                <span>Clear search</span>
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          <div className="flex border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 transition-colors ${viewMode === "grid" ? "bg-primary-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 transition-colors ${viewMode === "list" ? "bg-primary-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          <select
            value={params.sortBy ?? "featured"}
            onChange={(e) => navigate({ sortBy: e.target.value })}
            className="input w-auto"
          >
            <option value="featured">Featured</option>
            <option value="newest">Newest</option>
            <option value="name">Name A-Z</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn flex items-center space-x-2 ${hasActiveFilters ? "btn-primary" : "btn-outline"}`}
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="bg-white text-primary-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                {filterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters sidebar */}
        <div className={`lg:w-64 ${showFilters ? "block" : "hidden lg:block"}`}>
          <div className="card p-6 space-y-6 sticky top-24">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Filters</h3>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-primary-600 hover:text-primary-700 transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Price range — local state, commits on pointer release */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Price Range</h4>
              <input
                type="range"
                min="0"
                max="500"
                value={localMaxPrice}
                onChange={(e) => setLocalMaxPrice(Number(e.target.value))}
                onPointerUp={() =>
                  navigate({ maxPrice: localMaxPrice < 500 ? localMaxPrice : undefined })
                }
                className="w-full accent-primary-600"
              />
              <div className="flex justify-between text-sm text-gray-600 mt-1">
                <span>LRD 0</span>
                <span>LRD {localMaxPrice}</span>
              </div>
            </div>

            {/* Brands */}
            {allBrands.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Brands</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {allBrands.map((brand) => (
                    <label
                      key={brand}
                      className="flex items-center p-1 hover:bg-gray-50 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={(params.brands ?? []).includes(brand)}
                        onChange={() => toggleBrand(brand)}
                        className="mr-2 accent-primary-600"
                      />
                      <span className="text-sm text-gray-700">{brand}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Sizes</h4>
              <div className="space-y-2">
                {["XS", "S", "M", "L", "XL", "XXL"].map((size) => (
                  <label
                    key={size}
                    className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={(params.sizes ?? []).includes(size)}
                      onChange={() => toggleSize(size)}
                      className="mr-2 accent-primary-600"
                    />
                    <span className="text-sm text-gray-700">{size}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Category links */}
            {!category && categories.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Categories</h4>
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <Link
                      key={cat.slug}
                      href={`/shop/${cat.slug}`}
                      className="block text-sm text-gray-700 hover:text-primary-600 transition-colors p-1 hover:bg-gray-50 rounded"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Product grid */}
        <div className="flex-1">
          {/* Active filter chips */}
          {(params.search || hasActiveFilters) && (
            <div className="mb-6 flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Active filters:</span>
              {params.search && (
                <span className="inline-flex items-center bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm">
                  <Search className="h-3 w-3 mr-1" />"{params.search}"
                  <button onClick={clearSearch} className="ml-2 hover:text-primary-900">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {(params.maxPrice ?? 500) < 500 && (
                <span className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  Up to LRD {params.maxPrice}
                  <button
                    onClick={() => { setLocalMaxPrice(500); navigate({ maxPrice: undefined }); }}
                    className="ml-2 hover:text-blue-900"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {(params.brands ?? []).map((brand) => (
                <span key={brand} className="inline-flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                  {brand}
                  <button onClick={() => toggleBrand(brand)} className="ml-2 hover:text-green-900">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              {(params.sizes ?? []).map((size) => (
                <span key={size} className="inline-flex items-center bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-sm">
                  {size}
                  <button onClick={() => toggleSize(size)} className="ml-2 hover:text-pink-900">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Products — dim during transition instead of full skeleton flash */}
          <div
            className={`grid ${
              viewMode === "grid"
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "grid-cols-1"
            } gap-6 transition-opacity duration-150 ${isPending ? "opacity-50 pointer-events-none" : "opacity-100"}`}
          >
            {initialProducts.length > 0 ? (
              initialProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : !isPending ? (
              <div className="col-span-full text-center py-12">
                <Search className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-4">
                  {params.search
                    ? `No products match "${params.search}". Try different keywords or adjust your filters.`
                    : "Try adjusting your filters."}
                </p>
                <div className="space-x-4">
                  {params.search && (
                    <button onClick={clearSearch} className="btn btn-primary">
                      Clear Search
                    </button>
                  )}
                  {hasActiveFilters && (
                    <button onClick={clearFilters} className="btn btn-outline">
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>
            ) : (
              Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))
            )}
          </div>

          {/* Pagination */}
          {initialPageCount > 1 && (
            <div className="mt-8 flex items-center justify-center gap-3">
              <button
                onClick={() => navigatePage(currentPage - 1)}
                disabled={currentPage <= 1 || isPending}
                className="btn btn-outline p-2 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm text-gray-700">
                Page {currentPage} of {initialPageCount}
              </span>
              <button
                onClick={() => navigatePage(currentPage + 1)}
                disabled={currentPage >= initialPageCount || isPending}
                className="btn btn-outline p-2 disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
