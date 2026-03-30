"use client";

import React, { useState } from "react";
import { ShoppingCart, Heart } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";
import { toast } from "sonner";

export default function ProductActions({ product }) {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const { addItem } = useCart();
  const { toggleItem, isInWishlist } = useWishlist();
  const inWishlist = isInWishlist(product.id);

  const sizes = Array.isArray(product.sizes) ? product.sizes : [];
  const colors = Array.isArray(product.colors) ? product.colors : [];

  const handleAddToCart = () => {
    if (product.stock === 0) {
      toast.error("Product is out of stock");
      return;
    }
    if (sizes.length > 0 && !selectedSize) {
      toast.error("Please select a size");
      return;
    }
    if (colors.length > 0 && !selectedColor) {
      toast.error("Please select a color");
      return;
    }
    addItem(product, quantity, { size: selectedSize, color: selectedColor });
  };

  return (
    <div className="space-y-4">
      {/* Size selector */}
      {sizes.length > 0 && (
        <div>
          <label className="block font-medium text-gray-900 mb-2">
            Size
            {!selectedSize && <span className="text-red-500 text-sm ml-1">*</span>}
          </label>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setSelectedSize(size === selectedSize ? null : size)}
                className={`px-3 py-1.5 border rounded-lg text-sm font-medium transition-colors ${
                  selectedSize === size
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-700 border-gray-300 hover:border-gray-500"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Color selector */}
      {colors.length > 0 && (
        <div>
          <label className="block font-medium text-gray-900 mb-2">
            Color
            {!selectedColor && <span className="text-red-500 text-sm ml-1">*</span>}
            {selectedColor && (
              <span className="text-sm font-normal text-gray-600 ml-2">{selectedColor}</span>
            )}
          </label>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => {
              // Try to render a colour swatch for simple CSS colour names / hex values
              const isHex = /^#([0-9a-f]{3}){1,2}$/i.test(color);
              return (
                <button
                  key={color}
                  type="button"
                  title={color}
                  onClick={() => setSelectedColor(color === selectedColor ? null : color)}
                  className={`w-8 h-8 rounded-full border-2 transition-transform ${
                    selectedColor === color
                      ? "border-gray-900 scale-110"
                      : "border-gray-300 hover:border-gray-500"
                  }`}
                  style={isHex ? { backgroundColor: color } : undefined}
                >
                  {!isHex && (
                    <span className="text-xs leading-none">{color.slice(0, 2).toUpperCase()}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Quantity */}
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
