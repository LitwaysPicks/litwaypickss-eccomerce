"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { track } from "@/lib/analytics";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Smartphone,
  CheckCircle2,
  Clock,
  XCircle,
  Phone,
  ShoppingBag,
  Lock,
  Truck,
  ChevronDown,
  Loader2,
  MapPin,
  User,
  RotateCcw,
} from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatCurrency } from "@/lib/currency";
import { momoAPI } from "@/lib/api-config";
import { formatLiberianPhone } from "@/lib/momo/phoneFormatter";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

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
const MAX_CONSECUTIVE_POLL_ERRORS = 5;

const FALLBACK_IMAGE =
  "https://images.pexels.com/photos/5632396/pexels-photo-5632396.jpeg?auto=compress&cs=tinysrgb&w=160";

const itemKey = (item) => item.cartKey ?? item.id;

const variantLabel = (item) =>
  [item.selectedSize, item.selectedColor].filter(Boolean).join(" · ");

function formatCountdown(ms) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

/* ── Small presentational pieces ─────────────────────────────────────────── */

function Stepper({ current }) {
  const steps = ["Cart", "Details", "Payment", "Confirmation"];
  return (
    <ol className="flex items-center gap-2 text-xs font-medium sm:text-sm">
      {steps.map((label, index) => {
        const state =
          index < current ? "done" : index === current ? "active" : "todo";
        return (
          <li key={label} className="flex items-center gap-2">
            <span
              className={
                state === "active"
                  ? "flex items-center gap-2 rounded-full bg-primary-600 px-3 py-1 text-white"
                  : state === "done"
                    ? "flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-primary-700"
                    : "flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-gray-500"
              }
              aria-current={state === "active" ? "step" : undefined}
            >
              {state === "done" ? (
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <span className="grid h-4 w-4 place-items-center rounded-full border border-current text-[10px] leading-none">
                  {index + 1}
                </span>
              )}
              {label}
            </span>
            {index < steps.length - 1 && (
              <span
                className="h-px w-3 bg-gray-300 sm:w-6"
                aria-hidden="true"
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

function SectionCard({ step, icon: Icon, title, description, children }) {
  return (
    <section className="card p-5 sm:p-6">
      <header className="mb-5 flex items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary-50 text-primary-600">
          <Icon className="h-4.5 w-4.5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-gray-900 sm:text-lg">
            <span className="mr-1.5 text-gray-400">{step}.</span>
            {title}
          </h2>
          {description && (
            <p className="mt-0.5 text-sm text-gray-500">{description}</p>
          )}
        </div>
      </header>
      {children}
    </section>
  );
}

function Field({
  label,
  hint,
  htmlFor,
  children,
  className = "",
  required = false,
  optional = false,
}) {
  return (
    <div className={className}>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 flex items-center gap-1 text-sm font-medium text-gray-700"
      >
        {label}
        {required && (
          <>
            {/* aria-hidden: the input's own `required` already announces this
                to screen readers, so the glyph would just be noise. */}
            <span className="text-red-500" aria-hidden="true">
              *
            </span>
            <span className="sr-only">(required)</span>
          </>
        )}
        {optional && (
          <span className="font-normal text-gray-400">(optional)</span>
        )}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-xs text-gray-500">{hint}</p>}
    </div>
  );
}

function StatusPanel({ tone, icon: Icon, title, children, spin = false }) {
  const tones = {
    amber: "border-amber-200 bg-amber-50 text-amber-900",
    green: "border-green-200 bg-green-50 text-green-900",
    orange: "border-orange-200 bg-orange-50 text-orange-900",
    red: "border-red-200 bg-red-50 text-red-900",
  };
  const iconTones = {
    amber: "bg-amber-100 text-amber-700",
    green: "bg-green-100 text-green-700",
    orange: "bg-orange-100 text-orange-700",
    red: "bg-red-100 text-red-700",
  };
  return (
    <div
      role="status"
      aria-live="polite"
      className={`rounded-xl border-2 p-5 sm:p-6 ${tones[tone]}`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <span
          className={`grid h-12 w-12 shrink-0 place-items-center rounded-full ${iconTones[tone]}`}
        >
          <Icon
            className={`h-6 w-6 ${spin ? "animate-spin" : ""}`}
            aria-hidden="true"
          />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold sm:text-xl">{title}</h2>
          <div className="mt-2 space-y-2 text-sm">{children}</div>
        </div>
      </div>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────── */

function CheckoutContent() {
  const router = useRouter();
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [referenceId, setReferenceId] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [remainingMs, setRemainingMs] = useState(PAYMENT_POLL_TIMEOUT_MS);
  const [summaryOpen, setSummaryOpen] = useState(false);

  const isPolling = useRef(false);
  const consecutiveErrors = useRef(0);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
  });

  // Pre-fill from the account profile once it resolves. Only fills blanks so
  // it never clobbers something the customer already typed.
  // Funnel step for the admin Analytics page — once per checkout visit.
  useEffect(() => {
    track("checkout_start");
  }, []);

  useEffect(() => {
    if (!user) return;
    setFormData((prev) => ({
      ...prev,
      firstName: prev.firstName || user.first_name || "",
      lastName: prev.lastName || user.last_name || "",
      phone: prev.phone || user.phone || "",
      address: prev.address || user.address || "",
      city: prev.city || user.city || "",
    }));
  }, [user]);

  const finalTotal = total;
  const itemCount = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items],
  );

  // Refs so the polling closure always sees the latest values
  // without adding them as effect deps (which would restart the interval)
  const latestRef = useRef({});
  latestRef.current = { formData, finalTotal, orderId, clearCart, router };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /* ── Payment polling ───────────────────────────────────────────────────── */
  useEffect(() => {
    if (!referenceId || isPolling.current) return;

    isPolling.current = true;
    consecutiveErrors.current = 0;
    setPaymentStatus("pending");
    setRemainingMs(PAYMENT_POLL_TIMEOUT_MS);

    toast.info("Check your phone and approve the payment request", {
      icon: <Phone className="h-5 w-5" />,
      duration: 10000,
    });

    let interval;
    let ticker;
    let timeout;

    const stop = () => {
      clearInterval(interval);
      clearInterval(ticker);
      clearTimeout(timeout);
      isPolling.current = false;
    };

    const registerPollFailure = () => {
      consecutiveErrors.current += 1;
      if (consecutiveErrors.current >= MAX_CONSECUTIVE_POLL_ERRORS) {
        stop();
        setPaymentStatus("timeout");
        toast.error(
          "We lost contact with MoMo. Check your MoMo messages before retrying.",
        );
        setLoading(false);
      }
    };

    const checkStatus = async () => {
      let data;
      try {
        data = await momoAPI.checkStatus(referenceId);
      } catch {
        // Network error / client-side timeout
        registerPollFailure();
        return;
      }

      // apiCall resolves non-2xx JSON too, so an API-level failure has to
      // count against the same error budget or the guard never trips.
      if (!data?.success) {
        registerPollFailure();
        return;
      }
      consecutiveErrors.current = 0;

      const status = data.status;

      if (status === "SUCCESSFUL") {
        stop();
        setPaymentStatus("success");
        toast.success("Payment successful — taking you to your receipt");

        const {
          formData: fd,
          finalTotal: ft,
          orderId: oid,
          clearCart: cc,
          router: r,
        } = latestRef.current;

        cc();

        // Only the referenceId is load-bearing; /confirmation re-fetches the
        // authoritative order from the server using it.
        sessionStorage.setItem(
          "lastOrder",
          JSON.stringify({
            name: `${fd.firstName} ${fd.lastName}`.trim(),
            phone: fd.phone,
            amount: ft,
            referenceId,
            orderId: oid,
          }),
        );

        setTimeout(() => r.push("/confirmation"), 1500);
      } else if (
        status === "FAILED" ||
        status === "REJECTED" ||
        status === "DISPUTED"
      ) {
        stop();
        setPaymentStatus(status === "DISPUTED" ? "disputed" : "failed");
        toast.error(
          status === "DISPUTED"
            ? "Payment amount did not match your order. Support has been notified."
            : "Payment was declined or failed.",
        );
        setLoading(false);
      }
    };

    // Check once immediately so a fast approval isn't stuck behind the interval
    checkStatus();
    interval = setInterval(checkStatus, PAYMENT_POLL_INTERVAL_MS);

    const startedAt = Date.now();
    ticker = setInterval(() => {
      setRemainingMs(PAYMENT_POLL_TIMEOUT_MS - (Date.now() - startedAt));
    }, 1000);

    timeout = setTimeout(() => {
      if (!isPolling.current) return;
      stop();
      setPaymentStatus("timeout");
      toast.error("The payment request expired. Please try again.");
      setLoading(false);
    }, PAYMENT_POLL_TIMEOUT_MS);

    return stop;
  }, [referenceId]);

  /* ── Submit ────────────────────────────────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!(finalTotal > 0)) {
      toast.error("Your order total is invalid. Please review your cart.");
      return;
    }

    // Same normaliser the API route uses, so the client can't accept a number
    // the server will turn around and reject.
    const phoneResult = formatLiberianPhone(formData.phone);
    if (!phoneResult.success) {
      toast.error(phoneResult.error);
      return;
    }

    setLoading(true);
    setPaymentStatus(null);
    setReferenceId(null);
    setOrderId(null);
    isPolling.current = false;

    try {
      // Prices, totals and identity are all recomputed server-side from the
      // session and the products table — only cart selection is sent.
      const payload = {
        phone: phoneResult.phone,
        payerMessage: "Payment for Litway Picks Order",
        items: items.map((item) => ({
          id: item.id,
          quantity: item.quantity,
          ...(item.selectedSize ? { selectedSize: item.selectedSize } : {}),
          ...(item.selectedColor ? { selectedColor: item.selectedColor } : {}),
        })),
        userInfo: {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
        },
        deliveryInfo: {
          deliveryAddress: formData.address.trim(),
          city: formData.city.trim(),
          state: formData.state,
        },
      };

      const data = await momoAPI.initiatePayment(payload);

      if (!data.success) {
        if (data.message === "Authentication required") {
          toast.error("Please sign in to complete your payment.");
          setLoading(false);
          router.push("/login?from=/checkout");
          return;
        }
        throw new Error(data.message || "Payment failed to start.");
      }

      setOrderId(data.orderId);
      setReferenceId(data.referenceId);
      // Flip to the pending panel in the same commit that clears `loading`,
      // so the form can't reappear enabled for a frame between the two.
      setPaymentStatus("pending");
      setLoading(false); // submission complete — polling takes over
      toast.success("Payment request sent to your phone", {
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

  /* ── Render ────────────────────────────────────────────────────────────── */

  // Guard on paymentStatus too: clearCart() runs the moment payment succeeds,
  // and without this the success panel would be replaced by "cart is empty".
  if (items.length === 0 && !paymentStatus) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-md space-y-6 text-center">
          <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-gray-100">
            <ShoppingBag className="h-10 w-10 text-gray-400" aria-hidden="true" />
          </div>
          <div>
            <h1 className="mb-2 text-2xl font-bold text-gray-900">
              Nothing to check out
            </h1>
            <p className="text-gray-600">
              Add a few items to your cart and come back.
            </p>
          </div>
          <Link href="/shop" className="btn btn-primary inline-block">
            Browse products
          </Link>
        </div>
      </div>
    );
  }

  const isProcessing =
    paymentStatus === "pending" || paymentStatus === "success";
  const showForm = !isProcessing;
  const stepIndex = paymentStatus === "success" ? 3 : isProcessing ? 2 : 1;

  const summary = (
    <>
      <ul className="divide-y divide-gray-100">
        {items.map((item) => {
          const variant = variantLabel(item);
          return (
            <li key={itemKey(item)} className="flex gap-3 py-3 first:pt-0">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                <Image
                  src={item.images?.[0] || FALLBACK_IMAGE}
                  alt={item.name}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
                <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-gray-900 px-1 text-[11px] font-semibold text-white">
                  {item.quantity}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">
                  {item.name}
                </p>
                {variant && (
                  <p className="mt-0.5 truncate text-xs text-gray-500">
                    {variant}
                  </p>
                )}
              </div>
              <p className="shrink-0 text-sm font-semibold text-gray-900">
                {formatCurrency((item.sale_price || item.price) * item.quantity)}
              </p>
            </li>
          );
        })}
      </ul>

      <dl className="mt-4 space-y-2.5 border-t border-gray-200 pt-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-gray-600">
            Subtotal · {itemCount} {itemCount === 1 ? "item" : "items"}
          </dt>
          <dd className="font-medium text-gray-900">{formatCurrency(total)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-gray-600">Delivery</dt>
          <dd className="font-semibold text-green-600">Free</dd>
        </div>
        <div className="flex items-baseline justify-between border-t border-gray-200 pt-3">
          <dt className="text-base font-semibold text-gray-900">Total</dt>
          <dd className="text-2xl font-bold text-primary-600">
            {formatCurrency(finalTotal)}
          </dd>
        </div>
      </dl>
    </>
  );

  return (
    <div className="container mx-auto max-w-6xl px-4 py-6 pb-28 sm:py-8 lg:pb-8">
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Checkout
          </h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-500">
            <Lock className="h-3.5 w-3.5" aria-hidden="true" />
            Secure payment via MTN Mobile Money
          </p>
        </div>
        <Stepper current={stepIndex} />
      </div>

      {/* Mobile order summary — collapsed by default so the form is first */}
      <div className="mb-6 lg:hidden">
        <div className="card overflow-hidden">
          <button
            type="button"
            onClick={() => setSummaryOpen((v) => !v)}
            aria-expanded={summaryOpen}
            className="flex w-full items-center justify-between gap-3 p-4 text-left"
          >
            <span className="flex items-center gap-2 text-sm font-medium text-gray-900">
              <ShoppingBag className="h-4 w-4 text-gray-400" aria-hidden="true" />
              Order summary
              <ChevronDown
                className={`h-4 w-4 text-gray-400 transition-transform ${
                  summaryOpen ? "rotate-180" : ""
                }`}
                aria-hidden="true"
              />
            </span>
            <span className="text-base font-bold text-primary-600">
              {formatCurrency(finalTotal)}
            </span>
          </button>
          {summaryOpen && (
            <div className="border-t border-gray-100 p-4">{summary}</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5 lg:gap-8">
        {/* LEFT — form / payment state */}
        <div className="space-y-5 lg:col-span-3">
          {paymentStatus === "pending" && (
            <StatusPanel
              tone="amber"
              icon={Loader2}
              spin
              title="Waiting for your approval"
            >
              <p>
                A payment prompt was sent to{" "}
                <strong className="font-mono">{formData.phone}</strong>. Open it
                and enter your MoMo PIN to confirm{" "}
                <strong>{formatCurrency(finalTotal)}</strong>.
              </p>
              <p className="flex items-center gap-1.5 text-amber-700">
                <Clock className="h-4 w-4" aria-hidden="true" />
                Expires in{" "}
                <span className="font-mono font-semibold tabular-nums">
                  {formatCountdown(remainingMs)}
                </span>
              </p>
              <p className="text-xs text-amber-700/80">
                No prompt? Dial <strong>*156#</strong> and approve from your
                pending-approvals menu. Keep this page open.
              </p>
            </StatusPanel>
          )}

          {paymentStatus === "success" && (
            <StatusPanel
              tone="green"
              icon={CheckCircle2}
              title="Payment successful"
            >
              <p>
                We received {formatCurrency(finalTotal)}. Taking you to your
                receipt…
              </p>
            </StatusPanel>
          )}

          {paymentStatus === "timeout" && (
            <StatusPanel tone="orange" icon={Clock} title="Request expired">
              <p>
                The payment prompt timed out before it was approved. Your card
                was not charged.
              </p>
              <button
                type="button"
                onClick={handleRetry}
                className="btn btn-primary mt-2 gap-2"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Try again
              </button>
            </StatusPanel>
          )}

          {paymentStatus === "failed" && (
            <StatusPanel tone="red" icon={XCircle} title="Payment failed">
              <p>The payment was declined. This usually means:</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>Not enough balance in the MoMo wallet</li>
                <li>The wrong PIN was entered</li>
                <li>The request was cancelled on the phone</li>
              </ul>
              <button
                type="button"
                onClick={handleRetry}
                className="btn btn-primary mt-2 gap-2"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Try again
              </button>
            </StatusPanel>
          )}

          {paymentStatus === "disputed" && (
            <StatusPanel tone="red" icon={XCircle} title="Payment needs review">
              <p>
                The amount received did not match your order total, so we have
                put this order on hold and flagged it for our team. Please
                don&apos;t pay again — contact support and we&apos;ll sort it
                out.
              </p>
              <Link href="/contact" className="btn btn-primary mt-2">
                Contact support
              </Link>
            </StatusPanel>
          )}

          {showForm && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <p className="text-sm text-gray-500">
                Fields marked{" "}
                <span className="font-medium text-red-500">*</span> are
                required.
              </p>

              <SectionCard
                step={1}
                icon={User}
                title="Contact details"
                description="Where we send your order updates."
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="First name" htmlFor="firstName" required>
                    <input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      autoComplete="given-name"
                      placeholder="Musu"
                      className="input"
                      disabled={loading}
                    />
                  </Field>
                  <Field label="Last name" htmlFor="lastName" required>
                    <input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      autoComplete="family-name"
                      placeholder="Kollie"
                      className="input"
                      disabled={loading}
                    />
                  </Field>
                  <Field
                    label="Email"
                    htmlFor="email"
                    className="sm:col-span-2"
                    hint={
                      <>
                        Receipts go to your account email.{" "}
                        <Link
                          href="/account"
                          className="font-medium text-primary-600 underline underline-offset-2"
                        >
                          Change it in your account
                        </Link>
                      </>
                    }
                  >
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={user?.email || ""}
                      readOnly
                      autoComplete="email"
                      className="input cursor-not-allowed bg-gray-50 text-gray-600"
                    />
                  </Field>
                </div>
              </SectionCard>

              <SectionCard
                step={2}
                icon={MapPin}
                title="Delivery address"
                description="Free delivery anywhere in Liberia."
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field
                    label="Street address"
                    htmlFor="address"
                    className="sm:col-span-2"
                    required
                  >
                    <input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      autoComplete="street-address"
                      placeholder="Tubman Blvd, Sinkor, opposite the Total station"
                      className="input"
                      disabled={loading}
                    />
                  </Field>
                  <Field label="City / town" htmlFor="city" required>
                    <input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      autoComplete="address-level2"
                      placeholder="Monrovia"
                      className="input"
                      disabled={loading}
                    />
                  </Field>
                  <Field label="County" htmlFor="state" required>
                    <select
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      required
                      className="input"
                      disabled={loading}
                    >
                      <option value="">Select county</option>
                      {LIBERIA_COUNTIES.map((c) => (
                        <option key={c} value={c.toLowerCase().replace(/ /g, "-")}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
              </SectionCard>

              <SectionCard
                step={3}
                icon={Smartphone}
                title="Payment"
                description="MTN Mobile Money is the only method right now."
              >
                <div className="flex items-center gap-3 rounded-xl border-2 border-primary-200 bg-primary-50/60 p-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white text-primary-600 shadow-sm">
                    <Smartphone className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900">
                      MTN Mobile Money
                    </p>
                    <p className="text-sm text-gray-600">
                      Approve on your phone — no card needed
                    </p>
                  </div>
                  <CheckCircle2
                    className="ml-auto h-5 w-5 shrink-0 text-primary-600"
                    aria-hidden="true"
                  />
                </div>

                <Field
                  label="MoMo number"
                  htmlFor="phone"
                  className="mt-4"
                  required
                  hint="MTN Liberia number — starts with 055 or 088. E.g. 0555 123 456, 0881 234 567, or 231555123456"
                >
                  <input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="0555 123 456"
                    className="input font-mono"
                    disabled={loading}
                  />
                </Field>

                <ol className="mt-4 space-y-1.5 rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
                  <li>1. Place your order below</li>
                  <li>2. A prompt appears on your phone</li>
                  <li>3. Enter your MoMo PIN to approve</li>
                  <li>4. Your receipt loads automatically</li>
                </ol>
              </SectionCard>

              {/* Desktop submit */}
              <button
                type="submit"
                disabled={loading}
                className="hidden w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-6 py-4 text-base font-bold text-white shadow-lg transition hover:bg-primary-700 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-400 disabled:shadow-none lg:flex"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                    Sending request…
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" aria-hidden="true" />
                    Place order · {formatCurrency(finalTotal)}
                  </>
                )}
              </button>

              {/* Mobile sticky submit */}
              <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 p-3 backdrop-blur lg:hidden">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-6 py-3.5 text-base font-bold text-white shadow-lg transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  {loading ? (
                    <>
                      <Loader2
                        className="h-5 w-5 animate-spin"
                        aria-hidden="true"
                      />
                      Sending request…
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" aria-hidden="true" />
                      Place order · {formatCurrency(finalTotal)}
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* RIGHT — sticky summary (desktop) */}
        <aside className="hidden lg:col-span-2 lg:block">
          <div className="sticky top-8 space-y-4">
            <div className="card p-5 sm:p-6">
              <h2 className="mb-4 text-base font-semibold text-gray-900">
                Order summary
              </h2>
              <div className="max-h-80 overflow-y-auto pr-1">{summary}</div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
              <Truck
                className="h-5 w-5 shrink-0 text-green-600"
                aria-hidden="true"
              />
              <div className="text-sm">
                <p className="font-semibold text-green-900">
                  Free delivery nationwide
                </p>
                <p className="text-green-700">Montserrado: 24 hours · Other counties: 2–7 business days</p>
              </div>
            </div>

            <p className="flex items-center justify-center gap-1.5 text-xs text-gray-500">
              <Lock className="h-3.5 w-3.5" aria-hidden="true" />
              Payment handled by MTN MoMo — we never see your PIN
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <ProtectedRoute>
      <CheckoutContent />
    </ProtectedRoute>
  );
}
