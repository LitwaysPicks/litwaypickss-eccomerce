"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingCart, X, Star } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";
import { toast } from "sonner";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const FALLBACK_IMAGE =
  "https://images.pexels.com/photos/5632396/pexels-photo-5632396.jpeg?auto=compress&cs=tinysrgb&w=400";

function WishlistContent() {
  const { addItem } = useCart();
  const { items: wishlistItems, removeItem, toggleItem } = useWishlist();

  const handleAddToCart = (product) => {
    if (product.stock === 0) {
      toast.error("Product is out of stock");
      return;
    }
    addItem(product);
  };

  const moveAllToCart = () => {
    const available = wishlistItems.filter((item) => item.stock > 0);
    available.forEach((item) => addItem(item));
    toast.success(`${available.length} items added to cart`);
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-6">
          <div className="bg-gray-100 p-8 rounded-full w-24 h-24 mx-auto flex items-center justify-center">
            <Heart className="h-12 w-12 text-gray-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Your wishlist is empty
            </h1>
            <p className="text-gray-600">Save items you love for later</p>
          </div>
          <Link href="/shop" className="btn btn-primary inline-block">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Wishlist</h1>
          <p className="text-gray-600">{wishlistItems.length} items saved</p>
        </div>
        <button
          onClick={moveAllToCart}
          className="btn btn-primary flex items-center space-x-2"
        >
          <ShoppingCart className="h-4 w-4" />
          <span>Add All to Cart</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {wishlistItems.map((item) => {
          const imageUrl = item.images?.[0] || item.image_urls?.[0] || FALLBACK_IMAGE;
          const salePrice = item.sale_price ?? item.salePrice;
          const price = item.price;
          const reviewCount = item.review_count ?? item.reviewCount ?? 0;
          const rating = item.rating ?? 0;

          return (
            <div
              key={item.id}
              className="group cursor-pointer overflow-hidden card border-0 shadow-md hover:shadow-xl transition-all duration-300"
            >
              <div className="relative">
                <Link href={`/product/${item.slug}`}>
                  <div className="aspect-square overflow-hidden bg-gray-100 relative">
                    <Image
                      src={imageUrl}
                      alt={item.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                </Link>
                <button
                  onClick={() => removeItem(item.id)}
                  aria-label="Remove from wishlist"
                  className="absolute top-3 right-3 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-colors shadow-md"
                >
                  <X className="h-4 w-4 text-gray-600" />
                </button>
                {salePrice && (
                  <span className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded text-sm font-medium">
                    -{Math.round(((price - salePrice) / price) * 100)}%
                  </span>
                )}
                {item.stock === 0 && (
                  <span className="absolute top-3 left-3 bg-gray-500 text-white px-2 py-1 rounded text-sm font-medium">
                    Out of Stock
                  </span>
                )}
              </div>

              <div className="p-4 space-y-3">
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  {item.category_name || item.category || item.category_slug || ""}
                </p>
                <Link href={`/product/${item.slug}`}>
                  <h3 className="font-medium text-gray-900 line-clamp-2 min-h-10 hover:text-primary-600 transition-colors">
                    {item.name}
                  </h3>
                </Link>
                {reviewCount > 0 && (
                  <div className="flex items-center space-x-1">
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < Math.floor(rating)
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">({reviewCount})</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-lg text-gray-900">
                    {formatCurrency(salePrice || price)}
                  </span>
                  {salePrice && (
                    <span className="text-sm text-gray-500 line-through">
                      {formatCurrency(price)}
                    </span>
                  )}
                </div>
                {item.stock > 0 && item.stock <= 5 && (
                  <p className="text-xs text-orange-600">Only {item.stock} left in stock</p>
                )}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleAddToCart(item)}
                    disabled={item.stock === 0}
                    className="flex-1 btn btn-primary py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ShoppingCart className="h-4 w-4 mr-1" />
                    Add to Cart
                  </button>
                  <button
                    onClick={() => removeItem(item.id)}
                    aria-label="Remove from wishlist"
                    className="btn btn-outline p-2"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center mt-12">
        <Link href="/shop" className="btn btn-outline px-8 py-3">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

export default function WishlistPage() {
  return (
    <ProtectedRoute requireAuth={true}>
      <WishlistContent />
    </ProtectedRoute>
  );
}
