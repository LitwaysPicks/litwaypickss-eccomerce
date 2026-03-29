import Link from "next/link";
import {
  Truck,
  Clock,
  MapPin,
  Package,
  CheckCircle,
  Phone,
} from "lucide-react";

export const metadata = {
  title: "Shipping & Delivery | LitwayPicks",
  description:
    "Free nationwide delivery across all 15 counties in Liberia. Orders processed within 1-2 business days.",
};

export default function ShippingPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-100 to-orange-100 rounded-full px-6 py-2 mb-6">
          <Truck className="h-4 w-4 text-primary-600" />
          <span className="text-primary-600 font-semibold text-sm">
            FREE DELIVERY
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Shipping & Delivery
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          We deliver to every corner of Liberia — completely free. Here's
          everything you need to know about our shipping process.
        </p>
      </div>

      {/* Key Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {[
          {
            icon: Truck,
            title: "Free Delivery",
            description: "All orders ship free, no minimum order required.",
            gradient: "from-green-500 to-green-600",
            bg: "from-green-50 to-green-100",
          },
          {
            icon: Clock,
            title: "1–2 Day Processing",
            description:
              "Orders are processed within 1-2 business days of placement.",
            gradient: "from-blue-500 to-blue-600",
            bg: "from-blue-50 to-blue-100",
          },
          {
            icon: MapPin,
            title: "All 15 Counties",
            description:
              "Delivering nationwide across every county in Liberia.",
            gradient: "from-primary-500 to-primary-600",
            bg: "from-primary-50 to-orange-100",
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {item.title}
            </h3>
            <p className="text-gray-700 text-sm leading-relaxed">
              {item.description}
            </p>
          </div>
        ))}
      </div>

      {/* Detailed Policy */}
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Processing Time */}
        <div className="card-elevated p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-2.5 rounded-xl shadow">
              <Clock className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Processing Time
            </h2>
          </div>
          <p className="text-gray-700 leading-relaxed mb-4">
            All orders are processed within <strong>1–2 business days</strong>{" "}
            after your order is placed and payment is confirmed.
          </p>
          <ul className="space-y-2">
            {[
              "Orders placed Monday–Friday before 5:00 PM are processed the same or next business day.",
              "Orders placed on weekends or public holidays are processed the next business day.",
              "You will receive a confirmation notification once your order has been dispatched.",
            ].map((point, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-gray-700 text-sm"
              >
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                {point}
              </li>
            ))}
          </ul>
        </div>

        {/* Shipping Rates */}
        <div className="card-elevated p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-br from-green-500 to-green-600 p-2.5 rounded-xl shadow">
              <Truck className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Shipping Rates</h2>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 mb-4">
            <p className="text-2xl font-bold text-green-700 mb-1">FREE</p>
            <p className="text-green-700">
              All deliveries are <strong>completely free</strong> — no hidden
              fees, no minimum order amount required.
            </p>
          </div>
          <p className="text-gray-700 leading-relaxed text-sm">
            Whether you're ordering a single item or a full cart, shipping is
            always on us. This applies to all locations within Liberia.
          </p>
        </div>

        {/* Delivery Coverage */}
        <div className="card-elevated p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2.5 rounded-xl shadow">
              <MapPin className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Delivery Coverage
            </h2>
          </div>
          <p className="text-gray-700 leading-relaxed mb-4">
            We deliver to all <strong>15 counties</strong> across Liberia,
            including:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {[
              "Montserrado",
              "Nimba",
              "Bong",
              "Lofa",
              "Margibi",
              "Grand Bassa",
              "Grand Cape Mount",
              "Grand Gedeh",
              "Grand Kru",
              "Maryland",
              "Sinoe",
              "River Cess",
              "River Gee",
              "Gbarpolu",
              "Bomi",
            ].map((county) => (
              <div
                key={county}
                className="flex items-center gap-2 text-sm text-gray-700"
              >
                <CheckCircle className="h-3.5 w-3.5 text-primary-500 shrink-0" />
                {county}
              </div>
            ))}
          </div>
        </div>

        {/* Order Tracking */}
        <div className="card-elevated p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-2.5 rounded-xl shadow">
              <Package className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Order Tracking & Support
            </h2>
          </div>
          <p className="text-gray-700 leading-relaxed mb-4">
            After your order is dispatched, you will receive updates via SMS or
            WhatsApp. For any delivery queries, contact our support team
            directly.
          </p>
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
            <Phone className="h-5 w-5 text-primary-500 shrink-0" />
            <div>
              <p className="font-semibold text-gray-900 text-sm">
                Customer Support
              </p>
              <p className="text-gray-600 text-sm">
                +231-888-464-940 (Phone / WhatsApp)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center mt-12">
        <p className="text-gray-600 mb-6">
          Have more questions about delivery?
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/contact"
            className="btn btn-primary px-8 py-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            Contact Us
          </Link>
          <Link
            href="/shop"
            className="btn btn-outline px-8 py-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
