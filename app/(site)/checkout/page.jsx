"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Smartphone, CheckCircle, Clock, XCircle, Phone } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatCurrency } from "@/lib/currency";
import { momoAPI } from "@/lib/api-config";
import { toast } from "sonner";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/lib/auth-context";

const LIBERIA_COUNTIES = [
  "Montserrado",
  "Nimba",
  "Bong",
  "Lofa",
  "Grand Bassa",
  "Margibi",
  "Grand Cape Mount",
  "Maryland",
  "Grand Gedeh",
  "Sinoe",
  "River Gee",
  "Grand Kru",
  "Gbarpolu",
  "River Cess",
  "Bomi",
];

const PAYMENT_POLL_INTERVAL_MS = 4000;
const PAYMENT_POLL_TIMEOUT_MS = 300000;

function CheckoutContent() {
  const router = useRouter();
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [referenceId, setReferenceId] = useState(null);
  const [orderId, setOrderId] = useState(null);

  const isPolling = useRef(false);
  const consecutiveErrors = useRef(0);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    paymentMethod: "momo",
  });

  // Pre-fill form once user profile is available
  useEffect(() => {
    if (!user) return;
    setFormData((prev) => ({
      ...prev,
      firstName: prev.firstName || user.first_name || "",
      lastName: prev.lastName || user.last_name || "",
      email: prev.email || user.email || "",
      phone: prev.phone || user.phone || "",
      address: prev.address || user.address || "",
      city: prev.city || user.city || "",
    }));
  }, [user]);

  // Refs so the polling closure always sees the latest values
  // without adding them as effect deps (which would restart the interval)
  const latestRef = useRef({});
  latestRef.current = { formData, finalTotal, orderId, clearCart, router };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const finalTotal = total;

  useEffect(() => {
    if (!referenceId || isPolling.current) return;

    isPolling.current = true;
    setPaymentStatus("pending");

    toast.info("Please check your phone and approve the payment request!", {
      icon: <Phone className="h-5 w-5" />,
      duration: 10000,
    });

    const checkStatus = async () => {
      try {
        const data = await momoAPI.checkStatus(referenceId);

        if (!data.success) return;

        const status = data.status;

        if (status === "SUCCESSFUL") {
          setPaymentStatus("success");
          toast.success("Payment successful! Redirecting...", {
            duration: 3000,
          });

          const { formData: fd, finalTotal: ft, orderId: oid, clearCart: cc, router: r } =
            latestRef.current;

          cc();

          const orderData = {
            name: `${fd.firstName} ${fd.lastName}`,
            email: fd.email,
            phone: fd.phone,
            amount: ft,
            referenceId,
            orderId: oid,
            orderDetails: data.orderDetails || {},
          };

          // Persist to sessionStorage so refresh doesn't lose data
          sessionStorage.setItem("lastOrder", JSON.stringify(orderData));

          setTimeout(() => {
            r.push("/confirmation");
          }, 2000);

          isPolling.current = false;
        } else if (status === "FAILED" || status === "REJECTED") {
          setPaymentStatus("failed");
          toast.error("Payment was declined or failed.");
          setLoading(false);
          isPolling.current = false;
        }
      } catch {
        consecutiveErrors.current += 1;
        if (consecutiveErrors.current >= 5) {
          clearInterval(interval);
          setPaymentStatus("timeout");
          toast.error(
            "Payment check failed — please verify with MoMo and try again.",
          );
          setLoading(false);
          isPolling.current = false;
        }
        return;
      }
      consecutiveErrors.current = 0;
    };

    const interval = setInterval(checkStatus, PAYMENT_POLL_INTERVAL_MS);

    const timeout = setTimeout(() => {
      clearInterval(interval);
      if (isPolling.current) {
        setPaymentStatus("timeout");
        toast.error("Payment timeout — please try again.");
        setLoading(false);
        isPolling.current = false;
      }
    }, PAYMENT_POLL_TIMEOUT_MS);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
      isPolling.current = false;
    };
  }, [referenceId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setPaymentStatus(null);
    setReferenceId(null);
    setOrderId(null);
    isPolling.current = false;

    const rawPhone = formData.phone.replace(/\D/g, "");
    if (rawPhone.length < 9 || rawPhone.length > 12) {
      toast.error("Please enter a valid Liberian phone number");
      setLoading(false);
      return;
    }

    const formattedPhone = rawPhone.startsWith("231")
      ? rawPhone
      : `231${rawPhone.replace(/^0+/, "")}`;

    if (formattedPhone.length !== 12) {
      toast.error("Invalid phone number format");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        phone: formattedPhone,
        amount: finalTotal,
        externalId: `ORDER-${Date.now()}`,
        payerMessage: `Payment for Litway Picks Order - ${formatCurrency(finalTotal)}`,
        subtotal: total,
        items: items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.sale_price || item.price,
          quantity: item.quantity,
        })),
        userInfo: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
        },
        deliveryInfo: {
          deliveryAddress: formData.address,
          city: formData.city,
          state: formData.state,
          deliveryFee: "0",
          quantity: items.reduce((sum, i) => sum + i.quantity, 0).toString(),
        },
      };

      const data = await momoAPI.initiatePayment(payload);

      if (!data.success) {
        throw new Error(data.message || "Payment failed to start.");
      }

      setReferenceId(data.referenceId);
      setOrderId(data.orderId);
      toast.success("Payment request sent to your phone!", {
        icon: <Smartphone className="h-5 w-5" />,
      });
    } catch (error) {
      toast.error(error.message || "Payment failed to start.");
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setPaymentStatus(null);
    setReferenceId(null);
    setOrderId(null);
    setLoading(false);
    isPolling.current = false;
    consecutiveErrors.current = 0;
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
        <Link href="/shop" className="btn btn-primary">
          Continue Shopping
        </Link>
      </div>
    );
  }

  // Form is hidden while polling or after success
  const showForm = paymentStatus !== "pending" && paymentStatus !== "success";

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT COLUMN */}
        <div className="space-y-6">
          {/* PAYMENT STATUS UI */}
          {paymentStatus === "pending" && (
            <div className="card p-6 bg-yellow-50 border-2 border-yellow-300 rounded-xl shadow-sm">
              <div className="flex items-center space-x-4">
                <Clock className="h-12 w-12 text-yellow-600 animate-pulse" />
                <div>
                  <h3 className="text-xl font-bold text-yellow-800">
                    Waiting for Payment Approval
                  </h3>
                  <p className="text-yellow-700 mt-2">
                    A payment request was sent to:
                  </p>
                  <p className="text-lg font-mono font-bold text-primary-600">
                    {formData.phone}
                  </p>
                  <p className="text-sm text-yellow-700 mt-3">
                    Enter your MoMo PIN to approve.
                  </p>
                </div>
              </div>
            </div>
          )}

          {paymentStatus === "success" && (
            <div className="card p-6 bg-green-50 border-2 border-green-300 rounded-xl">
              <div className="flex items-center space-x-4">
                <CheckCircle className="h-12 w-12 text-green-600" />
                <div>
                  <h3 className="text-xl font-bold text-green-800">
                    Payment Successful!
                  </h3>
                  <p className="text-green-700">Redirecting...</p>
                </div>
              </div>
            </div>
          )}

          {paymentStatus === "timeout" && (
            <div className="card p-6 bg-orange-50 border-2 border-orange-300 rounded-xl">
              <div className="flex items-center space-x-4">
                <XCircle className="h-12 w-12 text-orange-600" />
                <div>
                  <h3 className="text-xl font-bold text-orange-800">
                    Payment Timeout
                  </h3>
                  <p className="text-orange-700">
                    The request expired. Try again.
                  </p>
                  <button
                    onClick={handleRetry}
                    className="mt-4 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          )}

          {paymentStatus === "failed" && (
            <div className="card p-6 bg-red-50 border-2 border-red-300 rounded-xl">
              <div className="flex items-center space-x-4">
                <XCircle className="h-12 w-12 text-red-600" />
                <div>
                  <h3 className="text-xl font-bold text-red-800">
                    Payment Failed
                  </h3>
                  <p className="text-red-700 mt-2">Possible reasons:</p>
                  <ul className="text-sm text-red-700 mt-2 list-disc pl-5">
                    <li>Insufficient balance</li>
                    <li>Wrong PIN entered</li>
                    <li>Payment cancelled</li>
                  </ul>
                  <button
                    onClick={handleRetry}
                    className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          )}

          {showForm && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="card p-6">
                <h2 className="text-xl font-semibold mb-4">
                  Personal Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    placeholder="First Name"
                    className="input"
                    disabled={loading}
                  />
                  <input
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    placeholder="Last Name"
                    className="input"
                    disabled={loading}
                  />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="Email Address"
                    className="input"
                    disabled={loading}
                  />
                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    placeholder="Phone (0880555511)"
                    className="input font-mono"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="card p-6">
                <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
                <input
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  placeholder="Street Address"
                  className="input mb-4"
                  disabled={loading}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    placeholder="City"
                    className="input"
                    disabled={loading}
                  />
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    required
                    className="input"
                    disabled={loading}
                  >
                    <option value="">Select County</option>
                    {LIBERIA_COUNTIES.map((c) => (
                      <option
                        key={c}
                        value={c.toLowerCase().replace(/ /g, "-")}
                      >
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="card p-6">
                <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
                <label className="flex items-center p-5 border-2 border-primary-200 rounded-xl cursor-pointer hover:bg-primary-50 transition">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="momo"
                    checked
                    readOnly
                    className="mr-4"
                  />
                  <Smartphone className="h-6 w-6 text-primary-600 mr-3" />
                  <div>
                    <div className="font-semibold">Mobile Money (MTN MoMo)</div>
                    <div className="text-sm text-gray-600">Recommended</div>
                  </div>
                </label>
                <div className="mt-6 p-5 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-bold text-blue-900 mb-3">
                    How MTN MoMo Works:
                  </h4>
                  <ol className="text-sm text-blue-800 space-y-2 list-decimal pl-5">
                    <li>Click &quot;Place Order&quot; below</li>
                    <li>You&apos;ll receive a pop-up on your phone</li>
                    <li>Enter your MoMo PIN to approve</li>
                    <li>Order confirmed instantly!</li>
                  </ol>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-bold py-4 px-6 rounded-xl text-lg transition transform hover:scale-105 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading
                  ? "Processing..."
                  : `Place Order — ${formatCurrency(finalTotal)}`}
              </button>
            </form>
          )}
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex space-x-4 pb-4 border-b last:border-0"
                >
                  <Image
                    src={item.images?.[0] || "https://images.pexels.com/photos/5632396/pexels-photo-5632396.jpeg?auto=compress&cs=tinysrgb&w=80"}
                    alt={item.name}
                    width={80}
                    height={80}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium">{item.name}</h4>
                    <p className="text-sm text-gray-600">
                      Qty: {item.quantity}
                    </p>
                    <p className="font-bold text-lg">
                      {formatCurrency(
                        (item.sale_price || item.price) * item.quantity,
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t-2 pt-4 mt-6 space-y-3">
              <div className="flex justify-between text-lg">
                <span>Subtotal</span>
                <span>{formatCurrency(total)}</span>
              </div>
              <div className="flex justify-between text-lg">
                <span>Shipping</span>
                <span className="text-green-600 font-bold">Free</span>
              </div>
              <div className="flex justify-between text-2xl font-bold border-t-2 pt-4 text-primary-600">
                <span>Total</span>
                <span>{formatCurrency(finalTotal)}</span>
              </div>
            </div>
          </div>

          <div className="card p-6 bg-green-50 border-2 border-green-200 rounded-xl">
            <h3 className="font-bold text-green-800">
              Free Delivery Nationwide
            </h3>
            <p className="text-green-700">1–3 business days</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <ProtectedRoute requireAuth={true}>
      <CheckoutContent />
    </ProtectedRoute>
  );
}
