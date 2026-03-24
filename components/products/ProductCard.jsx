"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";
import { toast } from "sonner";

const FALLBACK_IMAGE =
  "https://images.pexels.com/photos/5632396/pexels-photo-5632396.jpeg?auto=compress&cs=tinysrgb&w=600";

export default function ProductCard({ product }) {
  const [isHovered, setIsHovered] = useState(false);
  const { addItem } = useCart();
  const { toggleItem, isInWishlist } = useWishlist();
  const inWishlist = isInWishlist(product.id);

  const imageUrls = product.images?.length
    ? product.images
    : product.image_urls?.length
      ? product.image_urls
      : [];

  const categoryName =
    product.category_name || product.category || product.category_slug || "";

  const primaryImage = imageUrls[0] || FALLBACK_IMAGE;
  const hoverImage = imageUrls[1] || primaryImage;
  const displayImage = isHovered ? hoverImage : primaryImage;

  const discountPercentage = product.sale_price
    ? Math.round(((product.price - product.sale_price) / product.price) * 100)
    : 0;

  const isOutOfStock = !product.stock || product.stock === 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) {
      toast.error("Product is out of stock");
      return;
    }
    addItem({ ...product, images: imageUrls, category: categoryName });
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleItem({ ...product, images: imageUrls, category: categoryName });
  };

  return (
    <div
      className="group cursor-pointer overflow-hidden card-elevated border-0 bg-white transition-all duration-500"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/product/${product.slug}`}>
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          <Image
            src={displayImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />

          {discountPercentage > 0 && (
            <span className="absolute top-3 left-3 bg-linear-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
              -{discountPercentage}%
            </span>
          )}

          {isOutOfStock && (
            <span className="absolute top-3 right-3 bg-gray-600 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
              Out of Stock
            </span>
          )}

          {product.featured && !isOutOfStock && (
            <span className="absolute top-3 right-3 bg-linear-to-r from-primary-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
              ⭐ FEATURED
            </span>
          )}

          <div
            className={`absolute inset-0 bg-black/30 flex items-center justify-center transition-opacity duration-500 ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="flex space-x-3">
              <button
                onClick={handleWishlist}
                aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
                className="rounded-full w-12 h-12 bg-white/95 hover:bg-white flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg"
              >
                <Heart className={`h-5 w-5 ${inWishlist ? "fill-red-500 text-red-500" : "text-gray-700"}`} />
              </button>
              <button
                onClick={handleAddToCart}
                aria-label="Add to cart"
                disabled={isOutOfStock}
                className="rounded-full w-12 h-12 bg-primary-600 hover:bg-primary-700 text-white flex items-center justify-center transition-all duration-300 hover:scale-110 disabled:opacity-50 shadow-lg"
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

          <h3 className="font-semibold text-gray-900 line-clamp-2 min-h-10 group-hover:text-primary-700 transition-colors">
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
