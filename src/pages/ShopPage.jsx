import React, { useState, useEffect, useMemo } from "react";
import { useParams, useSearchParams, Link } from "react-router";
import { Filter, Grid, List, Search, X } from "lucide-react";
import ProductCard from "../components/products/ProductCard";
import ProductCardSkeleton from "../components/products/ProductCardSkeleton";
import { supabase } from "../lib/supabase";

export default function ShopPage() {
  const { category } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("search");

  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("featured");
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [currentSearchQuery, setCurrentSearchQuery] = useState(
    searchQuery || "",
  );
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  // Fetch categories and brands once
  useEffect(() => {
    const fetchInitialData = async () => {
      const { data: categoriesData } = await supabase
        .from("categories")
        .select("*");
      if (categoriesData) setCategories(categoriesData);

      const { data: brandsData } = await supabase
        .from("products")
        .select("brand")
        .not("brand", "is", null);

      if (brandsData) {
        const uniqueBrands = [...new Set(brandsData.map((item) => item.brand))];
        setBrands(uniqueBrands.sort());
      }
    };

    fetchInitialData();
  }, []);

  // Fetch products only when category or searchQuery changes
  // Filters and sort are applied client-side — no re-fetch needed
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let queryResult = [];

        if (searchQuery) {
          const { data: searchData } = await supabase.rpc("search_products", {
            search_term: searchQuery,
          });
          queryResult = searchData || [];
        } else if (category) {
          const { data: categoryData } = await supabase.rpc(
            "get_products_by_category",
            { category_slug_param: category },
          );
          queryResult = categoryData || [];
        } else {
          const { data } = await supabase
            .from("products_with_categories")
            .select("*");
          queryResult = data || [];
        }

        // Fix #4: fetch ALL images in one query, join in JS
        const { data: allImages } = await supabase
          .from("product_images")
          .select("product_id, url");

        const productsWithImages = queryResult.map((product) => {
          const imageRecords =
            allImages?.filter((img) => img.product_id === product.id) || [];
          const images = imageRecords.map(
            (img) =>
              supabase.storage.from("product-images").getPublicUrl(img.url).data
                .publicUrl,
          );
          return { ...product, images };
        });

        setAllProducts(productsWithImages);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, searchQuery]);

  useEffect(() => {
    setCurrentSearchQuery(searchQuery || "");
  }, [searchQuery]);

  // Fix #6: filters and sort applied client-side with useMemo — no re-fetch
  const filteredProducts = useMemo(() => {
    let result = allProducts.filter((product) => {
      const price = product.sale_price || product.price;
      const inPriceRange = price >= priceRange[0] && price <= priceRange[1];
      const inSelectedBrands =
        selectedBrands.length === 0 || selectedBrands.includes(product.brand);
      const inSelectedSizes =
        selectedSizes.length === 0 ||
        selectedSizes.some((size) => product.sizes?.includes(size));
      return inPriceRange && inSelectedBrands && inSelectedSizes;
    });

    switch (sortBy) {
      case "price-low":
        result.sort(
          (a, b) => (a.sale_price || a.price) - (b.sale_price || b.price),
        );
        break;
      case "price-high":
        result.sort(
          (a, b) => (b.sale_price || b.price) - (a.sale_price || a.price),
        );
        break;
      case "rating":
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "newest":
        result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        result.sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return (b.rating || 0) - (a.rating || 0);
        });
    }

    return result;
  }, [allProducts, priceRange, selectedBrands, selectedSizes, sortBy]);

  const clearFilters = () => {
    setPriceRange([0, 500]);
    setSelectedBrands([]);
    setSelectedSizes([]);
    setSortBy("featured");
  };

  const clearSearch = () => {
    setCurrentSearchQuery("");
    setSearchParams({});
  };

  const hasActiveFilters =
    priceRange[1] < 500 ||
    selectedBrands.length > 0 ||
    selectedSizes.length > 0;

  const currentCategory = categories.find((c) => c.slug === category);
  const pageTitle = searchQuery
    ? `Search results for "${searchQuery}"`
    : currentCategory?.name || "All Products";

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{pageTitle}</h1>
          <div className="flex items-center space-x-4">
            <p className="text-gray-600">
              {loading
                ? "Loading..."
                : `${filteredProducts.length} products found`}
            </p>
            {searchQuery && (
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
          <div className="flex border rounded-lg">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 ${
                viewMode === "grid"
                  ? "bg-primary-600 text-white"
                  : "text-gray-600"
              }`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 ${
                viewMode === "list"
                  ? "bg-primary-600 text-white"
                  : "text-gray-600"
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
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
            className={`btn flex items-center space-x-2 ${
              hasActiveFilters ? "btn-primary" : "btn-outline"
            }`}
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="bg-white text-primary-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                {(priceRange[1] < 500 ? 1 : 0) +
                  selectedBrands.length +
                  selectedSizes.length}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
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

            {/* Price Range */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Price Range</h4>
              <div className="space-y-3">
                <input
                  type="range"
                  min="0"
                  max="500"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                  className="w-full accent-primary-600"
                />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>LRD 0</span>
                  <span>LRD {priceRange[1]}</span>
                </div>
              </div>
            </div>

            {/* Brands */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Brands</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {brands.map((brand) => (
                  <label
                    key={brand}
                    className="flex items-center p-1 hover:bg-gray-50 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(brand)}
                      onChange={(e) =>
                        setSelectedBrands(
                          e.target.checked
                            ? [...selectedBrands, brand]
                            : selectedBrands.filter((b) => b !== brand),
                        )
                      }
                      className="mr-2 accent-primary-600"
                    />
                    <span className="text-sm text-gray-700">{brand}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Sizes */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Sizes</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {["XS", "S", "M", "L", "XL", "XXL"].map((size) => (
                  <label
                    key={size}
                    className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={selectedSizes.includes(size)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedSizes([...selectedSizes, size]);
                        } else {
                          setSelectedSizes(
                            selectedSizes.filter((s) => s !== size),
                          );
                        }
                      }}
                      className="mr-2 accent-primary-600"
                    />
                    <span className="text-sm text-gray-700">{size}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Categories — Fix #10: <a href> → <Link> */}
            {!category && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Categories</h4>
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <Link
                      key={cat.slug}
                      to={`/shop/${cat.slug}`}
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

        {/* Product Grid */}
        <div className="flex-1">
          {(searchQuery || hasActiveFilters) && (
            <div className="mb-6 flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-gray-700">
                Active filters:
              </span>
              {searchQuery && (
                <span className="inline-flex items-center bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm">
                  <Search className="h-3 w-3 mr-1" />"{searchQuery}"
                  <button
                    onClick={clearSearch}
                    className="ml-2 hover:text-primary-900"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {priceRange[1] < 500 && (
                <span className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  Up to LRD {priceRange[1]}
                  <button
                    onClick={() => setPriceRange([0, 500])}
                    className="ml-2 hover:text-blue-900"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {selectedBrands.map((brand) => (
                <span
                  key={brand}
                  className="inline-flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                >
                  {brand}
                  <button
                    onClick={() =>
                      setSelectedBrands(
                        selectedBrands.filter((b) => b !== brand),
                      )
                    }
                    className="ml-2 hover:text-green-900"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              {selectedSizes.map((size) => (
                <span
                  key={size}
                  className="inline-flex items-center space-x-1 bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-sm"
                >
                  <span>{size}</span>
                  <button
                    onClick={() =>
                      setSelectedSizes(selectedSizes.filter((s) => s !== size))
                    }
                    className="hover:text-pink-900"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {loading ? (
            <div
              className={`grid ${
                viewMode === "grid"
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  : "grid-cols-1"
              } gap-6`}
            >
              {Array.from({ length: 12 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div
              className={`grid ${
                viewMode === "grid"
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  : "grid-cols-1"
              } gap-6`}
            >
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Search className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No products found
              </h3>
              <p className="text-gray-600 mb-4">
                {searchQuery
                  ? `No products match "${searchQuery}". Try different keywords or adjust your filters.`
                  : "Try adjusting your filters or search terms"}
              </p>
              <div className="space-x-4">
                {searchQuery && (
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
          )}
        </div>
      </div>
    </div>
  );
}
