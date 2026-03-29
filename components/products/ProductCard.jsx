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
      className="group cursor-pointer overflow-hidden card bg-white"
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
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {discountPercentage > 0 && (
            <span className="absolute top-3 left-3 bg-red-500 text-white px-2 py-0.5 rounded text-xs font-semibold">
              -{discountPercentage}%
            </span>
          )}

          {isOutOfStock && (
            <span className="absolute top-3 right-3 bg-gray-700 text-white px-2 py-0.5 rounded text-xs font-medium">
              Out of Stock
            </span>
          )}

          {product.featured && !isOutOfStock && (
            <span className="absolute top-3 right-3 bg-primary-600 text-white px-2 py-0.5 rounded text-xs font-semibold">
              Featured
            </span>
          )}

          <div
            className={`absolute inset-0 bg-black/25 flex items-center justify-center transition-opacity duration-300 ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="flex gap-2">
              <button
                onClick={handleWishlist}
                aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
                className="w-10 h-10 bg-white hover:bg-gray-50 rounded-md flex items-center justify-center transition-colors shadow-sm"
              >
                <Heart className={`h-4 w-4 ${inWishlist ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
              </button>
              <button
                onClick={handleAddToCart}
                aria-label="Add to cart"
                disabled={isOutOfStock}
                className="w-10 h-10 bg-primary-600 hover:bg-primary-700 text-white rounded-md flex items-center justify-center transition-colors shadow-sm disabled:opacity-50"
              >
                <ShoppingCart className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-3 md:p-5 space-y-1.5 md:space-y-3">
          <p className="text-[10px] md:text-xs text-gray-400 truncate">
            {categoryName}
          </p>

          <h3 className="font-medium text-sm md:text-base text-gray-900 line-clamp-2 leading-snug">
            {product.name}
          </h3>

          {product.review_count > 0 && product.rating && (
            <div className="flex items-center gap-1">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 md:h-3.5 md:w-3.5 ${
                      i < Math.floor(product.rating)
                        ? "text-amber-400 fill-current"
                        : "text-gray-200 fill-current"
                    }`}
                  />
                ))}
              </div>
              <span className="text-[10px] md:text-xs text-gray-500">
                ({product.review_count})
              </span>
            </div>
          )}

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-bold text-sm md:text-lg text-gray-900">
              {formatCurrency(product.sale_price || product.price)}
            </span>
            {product.sale_price && (
              <span className="text-xs text-gray-400 line-through">
                {formatCurrency(product.price)}
              </span>
            )}
          </div>

          {product.stock > 0 && product.stock <= 5 && (
            <p className="text-[10px] md:text-xs text-orange-600 font-medium">
              Only {product.stock} left
            </p>
          )}
        </div>
      </Link>
    </div>
  );
}
