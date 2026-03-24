"use client";

import React, { useState } from "react";
import { ShoppingCart, Heart } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";
import { toast } from "sonner";

export default function ProductActions({ product }) {
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const { toggleItem, isInWishlist } = useWishlist();
  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = () => {
    if (product.stock === 0) {
      toast.error("Product is out of stock");
      return;
    }
    addItem(product, quantity);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <label className="font-medium text-gray-900">Quantity:</label>
        <div className="flex items-center border rounded-lg">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="px-3 py-2 hover:bg-gray-100"
          >
            -
          </button>
          <span className="px-4 py-2 border-x">{quantity}</span>
          <button
            onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
            className="px-3 py-2 hover:bg-gray-100"
            disabled={quantity >= product.stock}
          >
            +
          </button>
        </div>
      </div>

      <div className="flex space-x-4">
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="flex-1 btn btn-primary py-3 text-lg font-semibold disabled:opacity-50"
        >
          <ShoppingCart className="h-5 w-5 mr-2" />
          Add to Cart
        </button>
        <button
          onClick={() => toggleItem(product)}
          aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          className="btn btn-outline p-3"
        >
          <Heart className={`h-5 w-5 ${inWishlist ? "fill-red-500 text-red-500" : ""}`} />
        </button>
      </div>
    </div>
  );
}
