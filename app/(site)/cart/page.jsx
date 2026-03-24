"use client";

import React from "react";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatCurrency } from "@/lib/currency";

export default function CartPage() {
  const { items, updateQuantity, removeItem, total, itemsCount } = useCart();

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-6">
          <div className="bg-gray-100 p-8 rounded-full w-24 h-24 mx-auto flex items-center justify-center">
            <ShoppingBag className="h-12 w-12 text-gray-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Your cart is empty
            </h1>
            <p className="text-gray-600">Add some products to get started</p>
          </div>
          <Link href="/shop" className="btn btn-primary inline-block">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Shopping Cart ({itemsCount} items)
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="card p-6">
              <div className="flex space-x-4">
                <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={
                      item.images?.[0] ||
                      "https://images.pexels.com/photos/5632396/pexels-photo-5632396.jpeg"
                    }
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-600">{item.brand}</p>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="btn btn-outline w-8 h-8 p-0 disabled:opacity-50"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-8 text-center font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        className="btn btn-outline w-8 h-8 p-0 disabled:opacity-50"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatCurrency((item.salePrice || item.price) * item.quantity)}
                      </p>
                      {item.salePrice && (
                        <p className="text-sm text-gray-500 line-through">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                      )}
                    </div>
                  </div>

                  {item.quantity >= item.stock && (
                    <p className="text-sm text-orange-600">Maximum quantity reached</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(total)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-green-600 font-medium">Free</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg mb-6">
              <p className="text-sm text-green-700 font-medium">
                🚚 Free nationwide delivery included!
              </p>
            </div>
            <div className="space-y-3">
              <Link href="/checkout" className="w-full btn btn-primary py-3 text-center block">
                Proceed to Checkout
              </Link>
              <Link href="/shop" className="w-full btn btn-outline py-3 text-center block">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
