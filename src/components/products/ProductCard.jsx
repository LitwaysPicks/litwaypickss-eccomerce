import React, { useState } from "react";
import { Link } from "react-router";
import { Heart, ShoppingCart, Eye, Star } from "lucide-react";
import { formatCurrency } from "../../lib/currency";
import { useCart } from "../../lib/cart-context";
import { toast } from "sonner";
import { supabase } from "../../lib/supabase";

export default function ProductCard({ product }) {
  const [isHovered, setIsHovered] = useState(false);
  const { addItem } = useCart();

  // Resolve image URLs if paths were passed instead of full URLs
  const imageUrls = (product.images || []).map((img) =>
    img.startsWith("http")
      ? img
      : supabase.storage.from("product-images").getPublicUrl(img).data
          .publicUrl,
  );

  // Use category_name from products_with_categories view, fallback to slug
  const categoryName =
    product.category_name || product.category || product.category_slug || "";

  const primaryImage =
    imageUrls[0] ||
    "https://images.pexels.com/photos/5632396/pexels-photo-5632396.jpeg";
  const hoverImage = imageUrls[1] || primaryImage;

  const discountPercentage = product.sale_price
    ? Math.round(((product.price - product.sale_price) / product.price) * 100)
    : 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!product.stock || product.stock === 0) {
      toast.error("Product is out of stock");
      return;
    }

    addItem({ ...product, images: imageUrls, category: categoryName });
  };

  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toast.info("Quick view coming soon!");
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toast.success("Added to wishlist!");
  };

  return (
    <div
      className="group cursor-pointer overflow-hidden card-elevated border-0 bg-white hover:bg-gradient-to-br hover:from-white hover:to-primary-25 transition-all duration-500"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/product/${product.slug}`}>
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          <img
            src={isHovered ? hoverImage : primaryImage}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />

          {discountPercentage > 0 && (
            <span className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
              -{discountPercentage}%
            </span>
          )}

          {(!product.stock || product.stock === 0) && (
            <span className="absolute top-3 right-3 bg-gray-600 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
              Out of Stock
            </span>
          )}

          {product.featured && product.stock > 0 && (
            <span className="absolute top-3 right-3 bg-gradient-to-r from-primary-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
              ⭐ FEATURED
            </span>
          )}

          <div
            className={`absolute inset-0 bg-black/30 flex items-center justify-center transition-all duration-500 ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="flex space-x-3">
              <button
                onClick={handleQuickView}
                className="rounded-full w-12 h-12 bg-white/95 hover:bg-white flex items-center justify-center transition-all duration-300 transform hover:scale-110 shadow-lg"
              >
                <Eye className="h-5 w-5 text-gray-700" />
              </button>
              <button
                onClick={handleWishlist}
                className="rounded-full w-12 h-12 bg-white/95 hover:bg-white flex items-center justify-center transition-all duration-300 transform hover:scale-110 shadow-lg"
              >
                <Heart className="h-5 w-5 text-gray-700" />
              </button>
              <button
                onClick={handleAddToCart}
                disabled={!product.stock}
                className="rounded-full w-12 h-12 bg-primary-600 hover:bg-primary-700 text-white flex items-center justify-center transition-all duration-300 transform hover:scale-110 disabled:opacity-50 shadow-lg"
              >
                <ShoppingCart className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-3">
          <p className="text-xs text-primary-600 uppercase tracking-wide font-semibold">
            {categoryName}
          </p>

          <h3 className="font-semibold text-gray-900 line-clamp-2 min-h-[2.5rem] group-hover:text-primary-700 transition-colors">
            {product.name}
          </h3>

          {product.review_count > 0 && product.rating && (
            <div className="flex items-center space-x-2">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(product.rating)
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600 font-medium">
                ({product.review_count})
              </span>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <span className="font-bold text-xl text-gray-900">
              {formatCurrency(product.sale_price || product.price)}
            </span>
            {product.sale_price && (
              <span className="text-sm text-gray-500 line-through">
                {formatCurrency(product.price)}
              </span>
            )}
          </div>

          {product.stock > 0 && product.stock <= 5 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg px-3 py-1">
              <p className="text-xs text-orange-700 font-medium">
                ⚡ Only {product.stock} left in stock
              </p>
            </div>
          )}
        </div>
      </Link>
    </div>
  );
}
