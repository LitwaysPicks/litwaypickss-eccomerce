"use client";

import React from "react";
import Link from "next/link";
import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatCurrency } from "@/lib/currency";

export default function CartSidebar() {
  const {
    items,
    updateQuantity,
    removeItem,
    total,
    itemsCount,
    isOpen,
    setIsOpen,
  } = useCart();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-white/30 backdrop-blur-sm z-50 transition-opacity"
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 transform transition-transform">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">
              Shopping Cart ({itemsCount})
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {items.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Your cart is empty
                </h3>
                <p className="text-gray-600 mb-4">
                  Add some products to get started
                </p>
                <button
                  onClick={() => setIsOpen(false)}
                  className="btn btn-primary"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex space-x-4 p-4 border rounded-lg"
                  >
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
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
                        <h3 className="font-medium text-gray-900 text-sm line-clamp-2">
                          {item.name}
                        </h3>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors ml-2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            disabled={item.quantity <= 1}
                            className="w-6 h-6 flex items-center justify-center border rounded hover:bg-gray-50 disabled:opacity-50"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            disabled={item.quantity >= item.stock}
                            className="w-6 h-6 flex items-center justify-center border rounded hover:bg-gray-50 disabled:opacity-50"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        <div className="text-right">
                          <p className="font-semibold text-gray-900 text-sm">
                            {formatCurrency(
                              (item.salePrice || item.price) * item.quantity,
                            )}
                          </p>
                          {item.salePrice && (
                            <p className="text-xs text-gray-500 line-through">
                              {formatCurrency(item.price * item.quantity)}
                            </p>
                          )}
                        </div>
                      </div>

                      {item.quantity >= item.stock && (
                        <p className="text-xs text-orange-600">
                          Maximum quantity reached
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">
                  Total:
                </span>
                <span className="text-xl font-bold text-primary-600">
                  {formatCurrency(total)}
                </span>
              </div>

              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-sm text-green-700 font-medium text-center">
                  🚚 Free nationwide delivery included!
                </p>
              </div>

              <div className="space-y-2">
                <Link
                  href="/checkout"
                  onClick={() => setIsOpen(false)}
                  className="w-full btn btn-primary py-3 text-center block"
                >
                  Checkout
                </Link>
                <Link
                  href="/cart"
                  onClick={() => setIsOpen(false)}
                  className="w-full btn btn-outline py-3 text-center block"
                >
                  View Cart
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
