import Link from "next/link";
import {
  FileText,
  ShoppingBag,
  CreditCard,
  AlertTriangle,
  Scale,
  Phone,
} from "lucide-react";

export const metadata = {
  title: "Terms & Conditions | LitwayPicks",
  description:
    "Read LitwayPicks' terms and conditions governing use of our platform and purchase of products.",
};

const lastUpdated = "March 2025";

export default function TermsPage() {
  const sections = [
    {
      icon: FileText,
      gradient: "from-blue-500 to-blue-600",
      title: "1. Acceptance of Terms",
      content: (
        <p className="text-gray-700 leading-relaxed">
          By accessing and using the LitwayPicks website and placing orders, you
          accept and agree to be bound by these Terms and Conditions. If you do
          not agree with any part of these terms, please do not use our
          platform.
        </p>
      ),
    },
    {
      icon: ShoppingBag,
      gradient: "from-primary-500 to-primary-600",
      title: "2. Products & Orders",
      content: (
        <div className="space-y-3 text-gray-700 text-sm leading-relaxed">
          <p>
            We reserve the right to modify or discontinue any product at any
            time without notice.
          </p>
          <ul className="space-y-2">
            {[
              "Product images are for illustration purposes — slight variations may occur.",
              "All orders are subject to availability. If an item is out of stock after your order, we will notify you promptly and offer a refund or alternative.",
              "We reserve the right to refuse or cancel any order at our discretion.",
              "Prices are listed in Liberian Dollars (LRD) or US Dollars (USD) and are subject to change without notice.",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-1.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      ),
    },
    {
      icon: CreditCard,
      gradient: "from-green-500 to-green-600",
      title: "3. Payments",
      content: (
        <div className="space-y-3 text-gray-700 text-sm leading-relaxed">
          <p>
            All payments must be made in full before your order is processed and
            dispatched.
          </p>
          <ul className="space-y-2">
            {[
              "We currently accept MTN Mobile Money as our primary payment method.",
              "Payment must be confirmed before your order enters processing.",
              "LitwayPicks does not store your Mobile Money PIN or full account details.",
              "In the event of a failed payment, your order will not be processed. Please contact us if you believe payment was deducted in error.",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      ),
    },
    {
      icon: FileText,
      gradient: "from-indigo-500 to-indigo-600",
      title: "4. Shipping & Delivery",
      content: (
        <div className="space-y-3 text-gray-700 text-sm leading-relaxed">
          <p>
            All delivery is free nationwide. Orders are processed within 1–2
            business days. For full details, please refer to our{" "}
            <Link
              href="/shipping"
              className="text-primary-600 hover:underline font-medium"
            >
              Shipping & Delivery Policy
            </Link>
            .
          </p>
          <p>
            LitwayPicks is not responsible for delivery delays caused by
            circumstances beyond our control, including natural disasters, civil
            unrest, or carrier disruptions.
          </p>
        </div>
      ),
    },
    {
      icon: FileText,
      gradient: "from-orange-500 to-orange-600",
      title: "5. Returns & Refunds",
      content: (
        <div className="text-gray-700 text-sm leading-relaxed">
          <p>
            We offer a 7-day return policy on eligible items. For full details,
            please refer to our{" "}
            <Link
              href="/returns"
              className="text-primary-600 hover:underline font-medium"
            >
              Return & Refund Policy
            </Link>
            .
          </p>
        </div>
      ),
    },
    {
      icon: Scale,
      gradient: "from-purple-500 to-purple-600",
      title: "6. Intellectual Property",
      content: (
        <div className="space-y-3 text-gray-700 text-sm leading-relaxed">
          <p>
            All content on this website — including text, graphics, logos,
            images, and software — is the property of LitwayPicks and is
            protected by applicable copyright and trademark laws.
          </p>
          <p>
            You may not reproduce, distribute, or use any content from this site
            without express written permission from LitwayPicks.
          </p>
        </div>
      ),
    },
    {
      icon: AlertTriangle,
      gradient: "from-red-500 to-red-600",
      title: "7. Limitation of Liability",
      content: (
        <div className="space-y-3 text-gray-700 text-sm leading-relaxed">
          <p>
            LitwayPicks shall not be held liable for any indirect, incidental,
            or consequential damages arising from the use of our platform or
            products, including but not limited to loss of data or profit.
          </p>
          <p>
            Our total liability for any claim arising from these terms shall not
            exceed the amount paid for the specific product or order in
            question.
          </p>
        </div>
      ),
    },
    {
      icon: FileText,
      gradient: "from-gray-600 to-gray-700",
      title: "8. User Conduct",
      content: (
        <div className="text-gray-700 text-sm leading-relaxed">
          <p className="mb-3">By using our platform, you agree not to:</p>
          <ul className="space-y-2">
            {[
              "Use the platform for any unlawful purpose",
              "Provide false or misleading information when registering or placing orders",
              "Attempt to gain unauthorized access to any part of our system",
              "Engage in any conduct that disrupts or damages the platform",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 bg-gray-500 rounded-full mt-1.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      ),
    },
    {
      icon: FileText,
      gradient: "from-teal-500 to-teal-600",
      title: "9. Privacy",
      content: (
        <p className="text-gray-700 text-sm leading-relaxed">
          Your use of our platform is also governed by our{" "}
          <Link
            href="/privacy"
            className="text-primary-600 hover:underline font-medium"
          >
            Privacy Policy
          </Link>
          , which is incorporated into these Terms and Conditions by reference.
        </p>
      ),
    },
    {
      icon: FileText,
      gradient: "from-cyan-500 to-cyan-600",
      title: "10. Changes to Terms",
      content: (
        <p className="text-gray-700 text-sm leading-relaxed">
          LitwayPicks reserves the right to update these Terms and Conditions at
          any time. Changes will be posted on this page with an updated date.
          Continued use of our platform after changes are made constitutes
          acceptance of the revised terms.
        </p>
      ),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-100 to-orange-100 rounded-full px-6 py-2 mb-6">
          <FileText className="h-4 w-4 text-primary-600" />
          <span className="text-primary-600 font-semibold text-sm">LEGAL</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Terms & Conditions
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Please read these terms carefully before using LitwayPicks. By
          shopping with us, you agree to the conditions outlined below.
        </p>
        <p className="text-sm text-gray-400 mt-4">
          Last updated: {lastUpdated}
        </p>
      </div>

      {/* Sections */}
      <div className="max-w-3xl mx-auto space-y-6">
        {sections.map((section, i) => (
          <div key={i} className="card-elevated p-8">
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`bg-gradient-to-br ${section.gradient} p-2.5 rounded-xl shadow`}
              >
                <section.icon className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                {section.title}
              </h2>
            </div>
            {section.content}
          </div>
        ))}

        {/* Governing Law */}
        <div className="card-elevated p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-2.5 rounded-xl shadow">
              <Scale className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              11. Governing Law
            </h2>
          </div>
          <p className="text-gray-700 text-sm leading-relaxed">
            These Terms and Conditions are governed by the laws of the Republic
            of Liberia. Any disputes arising from the use of our platform shall
            be subject to the jurisdiction of the courts of Liberia.
          </p>
        </div>

        {/* Contact */}
        <div className="card-elevated p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-br from-gray-600 to-gray-700 p-2.5 rounded-xl shadow">
              <Phone className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">12. Contact</h2>
          </div>
          <p className="text-gray-700 text-sm leading-relaxed mb-4">
            If you have any questions about these Terms and Conditions, please
            contact us:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <Phone className="h-5 w-5 text-primary-500 shrink-0" />
              <div>
                <p className="font-semibold text-gray-900 text-sm">
                  Phone / WhatsApp
                </p>
                <p className="text-gray-600 text-sm">+231-888-464-940</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <FileText className="h-5 w-5 text-primary-500 shrink-0" />
              <div>
                <p className="font-semibold text-gray-900 text-sm">Email</p>
                <p className="text-gray-600 text-sm">litwaypicks@gmail.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center mt-12">
        <p className="text-gray-600 mb-6">Questions about our terms?</p>
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
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
