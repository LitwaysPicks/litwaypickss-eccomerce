import Link from "next/link";
import { RefreshCw, CheckCircle, XCircle, Clock, Package, Phone, AlertCircle } from "lucide-react";

export const metadata = {
  title: "Return & Refund Policy | LitwayPicks",
  description:
    "7-day return policy on all eligible items. Refunds processed within 3 business days to your original payment method.",
};

export default function ReturnsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-100 to-orange-100 rounded-full px-6 py-2 mb-6">
          <RefreshCw className="h-4 w-4 text-primary-600" />
          <span className="text-primary-600 font-semibold text-sm">7-DAY RETURNS</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Return & Refund Policy
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          We want you to love every purchase. If something isn't right, we make the return process simple and hassle-free.
        </p>
      </div>

      {/* Key Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {[
          {
            icon: Clock,
            title: "7-Day Window",
            description: "You have 7 days after receiving your item to request a return.",
            gradient: "from-primary-500 to-primary-600",
            bg: "from-primary-50 to-orange-100",
          },
          {
            icon: RefreshCw,
            title: "Easy Returns",
            description: "Contact our team and we'll guide you through every step.",
            gradient: "from-blue-500 to-blue-600",
            bg: "from-blue-50 to-blue-100",
          },
          {
            icon: Package,
            title: "Fast Refunds",
            description: "Approved refunds are processed within 3 business days.",
            gradient: "from-green-500 to-green-600",
            bg: "from-green-50 to-green-100",
          },
        ].map((item, i) => (
          <div
            key={i}
            className={`card-elevated p-6 text-center bg-gradient-to-br ${item.bg} border-0`}
          >
            <div
              className={`bg-gradient-to-br ${item.gradient} p-4 rounded-2xl w-14 h-14 mx-auto mb-4 flex items-center justify-center shadow-lg`}
            >
              <item.icon className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
            <p className="text-gray-700 text-sm leading-relaxed">{item.description}</p>
          </div>
        ))}
      </div>

      {/* Detailed Policy */}
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Return Window */}
        <div className="card-elevated p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-2.5 rounded-xl shadow">
              <Clock className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Return Window</h2>
          </div>
          <p className="text-gray-700 leading-relaxed">
            We offer a <strong>7-day return policy</strong>. You have 7 days after receiving your item to request a return. Returns requested after this window will not be accepted.
          </p>
        </div>

        {/* Eligibility */}
        <div className="card-elevated p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2.5 rounded-xl shadow">
              <CheckCircle className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Return Eligibility</h2>
          </div>
          <p className="text-gray-700 leading-relaxed mb-5">
            To be eligible for a return, your item must meet <strong>all</strong> of the following conditions:
          </p>
          <ul className="space-y-3 mb-6">
            {[
              "In the same condition as received — unworn or unused",
              "With all original tags still attached",
              "In its original packaging",
              "Returned within 7 days of delivery",
            ].map((point, i) => (
              <li key={i} className="flex items-start gap-3 text-gray-700">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                {point}
              </li>
            ))}
          </ul>
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <XCircle className="h-5 w-5 text-red-500" />
              <p className="font-semibold text-red-700">Items NOT eligible for return:</p>
            </div>
            <ul className="space-y-2">
              {[
                "Items that have been used, worn, or washed",
                "Items without original tags or packaging",
                "Perishable or consumable goods",
                "Items marked as final sale or non-returnable",
              ].map((point, i) => (
                <li key={i} className="flex items-start gap-3 text-red-700 text-sm">
                  <XCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Refund Process */}
        <div className="card-elevated p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-br from-green-500 to-green-600 p-2.5 rounded-xl shadow">
              <RefreshCw className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Refund Process</h2>
          </div>
          <p className="text-gray-700 leading-relaxed mb-5">
            Once we receive and inspect your returned item, we will notify you of the outcome. Here's how the process works:
          </p>
          <div className="space-y-4">
            {[
              { step: "1", label: "Request Return", desc: "Contact us within 7 days of receiving your order via phone or WhatsApp." },
              { step: "2", label: "Ship Item Back", desc: "Send the item back in its original condition and packaging." },
              { step: "3", label: "Inspection", desc: "We inspect the returned item and notify you of the outcome within 1 business day." },
              { step: "4", label: "Refund Issued", desc: "If approved, a refund is issued to your original payment method within 3 business days." },
            ].map((s) => (
              <div key={s.step} className="flex items-start gap-4">
                <div className="bg-gradient-to-br from-primary-500 to-primary-600 text-white text-sm font-bold rounded-full w-8 h-8 flex items-center justify-center shrink-0 shadow">
                  {s.step}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{s.label}</p>
                  <p className="text-gray-600 text-sm">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Return Shipping */}
        <div className="card-elevated p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-2.5 rounded-xl shadow">
              <Package className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Return Shipping Costs</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 shrink-0" />
              <p className="text-yellow-800 text-sm leading-relaxed">
                <strong>Customer pays return shipping</strong> unless the item arrived damaged, defective, or is incorrect.
              </p>
            </div>
            <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
              <p className="text-green-800 text-sm leading-relaxed">
                <strong>We cover return shipping</strong> if your item arrived damaged, defective, or you received the wrong item. Contact us and we'll arrange pickup.
              </p>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="card-elevated p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-2.5 rounded-xl shadow">
              <Phone className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Start a Return</h2>
          </div>
          <p className="text-gray-700 leading-relaxed mb-4">
            To initiate a return, contact our customer support team. Please have your order details ready.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <Phone className="h-5 w-5 text-primary-500 shrink-0" />
              <div>
                <p className="font-semibold text-gray-900 text-sm">Phone / WhatsApp</p>
                <p className="text-gray-600 text-sm">+231-888-640-502</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <Package className="h-5 w-5 text-primary-500 shrink-0" />
              <div>
                <p className="font-semibold text-gray-900 text-sm">Email</p>
                <p className="text-gray-600 text-sm">support@litwaypicks.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center mt-12">
        <p className="text-gray-600 mb-6">Need help with a return or refund?</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/contact"
            className="btn btn-primary px-8 py-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            Contact Support
          </Link>
          <Link
            href="/shop"
            className="btn btn-outline px-8 py-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
