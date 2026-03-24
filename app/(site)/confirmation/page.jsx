"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/currency";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

function ConfirmationContent() {
  const router = useRouter();
  const { clearCart } = useCart();
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [order, setOrder] = useState(null);
  const hasCleared = useRef(false);

  useEffect(() => {
    // Read from sessionStorage (set by CheckoutPage on successful payment)
    try {
      const stored = sessionStorage.getItem("lastOrder");
      if (stored) {
        setOrder(JSON.parse(stored));
      } else {
        setPaymentStatus("error");
        toast.error("No payment information available.");
      }
    } catch {
      setPaymentStatus("error");
      toast.error("No payment information available.");
    }
  }, []);

  useEffect(() => {
    if (!order || hasCleared.current) return;

    setPaymentStatus("success");
    toast.success("Payment successful! Thank you for your purchase.");
    clearCart();
    hasCleared.current = true;

    // Clean up sessionStorage after reading
    sessionStorage.removeItem("lastOrder");

    const timer = setTimeout(() => router.push("/shop"), 8000);
    return () => clearTimeout(timer);
  }, [order, router, clearCart]);

  return (
    <div className="container mx-auto px-4 py-16 text-center">
      {paymentStatus === "success" && (
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-10 h-10 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-green-700 mb-2">
              Payment Successful!
            </h1>
            <p className="text-gray-600">
              Thank you for your purchase. Your order is being processed.
            </p>
          </div>

          {order && (
            <div className="bg-white shadow-lg rounded-lg p-6 text-left mb-6">
              <div className="border-b pb-4 mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Order Confirmation
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  A confirmation email has been sent to {order.email}
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Customer Name:</span>
                  <span className="font-medium">{order.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">{order.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-medium">{order.phone}</span>
                </div>
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between text-lg">
                    <span className="text-gray-600">Total Paid:</span>
                    <span className="font-bold text-green-600">
                      {formatCurrency(order.amount)}
                    </span>
                  </div>
                </div>
                {order.referenceId && (
                  <div className="bg-gray-50 rounded-lg p-3 mt-4">
                    <p className="text-xs text-gray-500">Reference ID:</p>
                    <p className="font-mono text-sm text-gray-700">
                      {order.referenceId}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">
              📦 What&apos;s Next?
            </h3>
            <ul className="text-left text-blue-800 text-sm space-y-1">
              <li>✅ Your order is confirmed and being prepared</li>
              <li>✅ You&apos;ll receive tracking information via email</li>
              <li>✅ Delivery within 1-3 business days</li>
            </ul>
          </div>

          <p className="text-sm text-gray-500 mb-4">
            Redirecting you back to the shop in a few seconds...
          </p>
          <button onClick={() => router.push("/shop")} className="btn btn-primary">
            Continue Shopping
          </button>
        </div>
      )}

      {paymentStatus === "error" && (
        <div className="max-w-md mx-auto">
          <div className="mb-8">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-10 h-10 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-red-600 mb-2">
              Payment Error
            </h1>
            <p className="text-gray-600 mt-4">
              No payment information available. This usually happens if you
              navigated here directly.
            </p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800">
              💡 <strong>Tip:</strong> If you just completed a payment, please
              wait a moment for the confirmation to load.
            </p>
          </div>
          <button onClick={() => router.push("/shop")} className="btn btn-primary">
            Back to Shop
          </button>
        </div>
      )}

      {!paymentStatus && (
        <div className="max-w-md mx-auto">
          <div className="animate-pulse">
            <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
          <p className="text-gray-600 mt-4">Loading confirmation...</p>
        </div>
      )}
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <ProtectedRoute requireAuth={true}>
      <ConfirmationContent />
    </ProtectedRoute>
  );
}
