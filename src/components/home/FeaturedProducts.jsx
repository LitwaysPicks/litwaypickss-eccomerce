import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import ProductCard from "../products/ProductCard";
import { supabase } from "../../lib/supabase"; // Make sure you have this configured

export default function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchFeaturedProducts() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("featured_products") // Using the view we created
          .select("*")
          .eq("featured", true); // Just in case you want to double filter

        if (error) throw error;
        setProducts(data);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching featured products:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchFeaturedProducts();
  }, []);

  if (loading)
    return (
      <section className="py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Loading Featured Products...
          </h2>
        </div>
      </section>
    );

  if (error)
    return (
      <section className="py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Error Loading Products
          </h2>
          <p className="text-red-500">{error}</p>
        </div>
      </section>
    );

  return (
    <section className="py-16">
      <div className="text-center mb-12">
        <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary-100 to-orange-100 rounded-full px-6 py-2 mb-4">
          <span className="text-primary-600 font-semibold text-sm">
            ✨ FEATURED
          </span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Featured Products
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Discover our handpicked selection of premium products
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <div className="text-center">
        <Link
          to="/shop"
          className="btn btn-primary px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
        >
          View All Products
          <svg
            className="ml-2 h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </Link>
      </div>
    </section>
  );
}
