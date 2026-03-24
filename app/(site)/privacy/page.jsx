import Link from "next/link";
import { Shield, Eye, Cookie, Lock, UserCheck, Phone } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | LitwayPicks",
  description:
    "LitwayPicks privacy policy — how we collect, use, and protect your personal information.",
};

const lastUpdated = "March 2025";

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-100 to-orange-100 rounded-full px-6 py-2 mb-6">
          <Shield className="h-4 w-4 text-primary-600" />
          <span className="text-primary-600 font-semibold text-sm">YOUR DATA IS SAFE</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          We respect your privacy and are committed to protecting your personal information. This policy explains how we collect, use, and safeguard your data.
        </p>
        <p className="text-sm text-gray-400 mt-4">Last updated: {lastUpdated}</p>
      </div>

      {/* Key Points */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[
          {
            icon: Eye,
            title: "Transparent Collection",
            description: "We only collect what we need to process your orders.",
            gradient: "from-blue-500 to-blue-600",
            bg: "from-blue-50 to-blue-100",
          },
          {
            icon: UserCheck,
            title: "Never Sold",
            description: "Your personal data is never sold to third parties.",
            gradient: "from-green-500 to-green-600",
            bg: "from-green-50 to-green-100",
          },
          {
            icon: Cookie,
            title: "Cookies",
            description: "We use cookies to improve your browsing experience.",
            gradient: "from-orange-500 to-orange-600",
            bg: "from-orange-50 to-orange-100",
          },
          {
            icon: Lock,
            title: "Secured",
            description: "Industry-standard security measures protect your data.",
            gradient: "from-primary-500 to-primary-600",
            bg: "from-primary-50 to-orange-100",
          },
        ].map((item, i) => (
          <div
            key={i}
            className={`card-elevated p-6 text-center bg-gradient-to-br ${item.bg} border-0`}
          >
            <div
              className={`bg-gradient-to-br ${item.gradient} p-3.5 rounded-2xl w-14 h-14 mx-auto mb-4 flex items-center justify-center shadow-lg`}
            >
              <item.icon className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">{item.title}</h3>
            <p className="text-gray-700 text-sm leading-relaxed">{item.description}</p>
          </div>
        ))}
      </div>

      {/* Full Policy */}
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Information We Collect */}
        <div className="card-elevated p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2.5 rounded-xl shadow">
              <Eye className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Information We Collect</h2>
          </div>
          <p className="text-gray-700 leading-relaxed mb-4">
            We collect information you provide directly to us when you make a purchase, create an account, or sign up for our newsletter. This includes:
          </p>
          <ul className="space-y-2 text-gray-700">
            {[
              "Full name",
              "Email address",
              "Phone number",
              "Shipping address (county, city, street)",
              "Order and transaction history",
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-sm">
                <div className="w-1.5 h-1.5 bg-primary-500 rounded-full shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <p className="text-gray-700 text-sm mt-4 leading-relaxed">
            We may also automatically collect certain technical information when you visit our website, such as your IP address, browser type, and pages visited, for analytics and security purposes.
          </p>
        </div>

        {/* How We Use Your Data */}
        <div className="card-elevated p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-2.5 rounded-xl shadow">
              <UserCheck className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">How We Use Your Data</h2>
          </div>
          <p className="text-gray-700 leading-relaxed mb-4">
            Your data is used solely for the following purposes:
          </p>
          <ul className="space-y-3 text-gray-700">
            {[
              { title: "Order Processing", desc: "To fulfill, manage, and deliver your orders." },
              { title: "Customer Support", desc: "To respond to your inquiries and resolve issues." },
              { title: "Account Management", desc: "To maintain your account and preferences." },
              { title: "Website Improvement", desc: "To analyze usage patterns and improve our platform." },
              { title: "Marketing (opt-in only)", desc: "To send promotional updates if you have subscribed to our newsletter." },
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-1.5 shrink-0" />
                <span><strong>{item.title}:</strong> {item.desc}</span>
              </li>
            ))}
          </ul>
          <div className="mt-5 p-4 bg-green-50 border border-green-200 rounded-xl">
            <p className="text-green-800 text-sm font-semibold">
              We will never sell, rent, or trade your personal information to any third party.
            </p>
          </div>
        </div>

        {/* Cookies */}
        <div className="card-elevated p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-2.5 rounded-xl shadow">
              <Cookie className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Cookies</h2>
          </div>
          <p className="text-gray-700 leading-relaxed mb-4">
            Our website uses cookies to enhance your browsing experience. Cookies are small text files stored on your device that help us:
          </p>
          <ul className="space-y-2 text-gray-700 text-sm mb-4">
            {[
              "Remember items in your shopping cart between sessions",
              "Keep you logged into your account",
              "Understand how visitors use our site so we can improve it",
              "Provide a faster and more personalized experience",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <p className="text-gray-600 text-sm">
            You may disable cookies in your browser settings, but this may affect certain features of the website.
          </p>
        </div>

        {/* Security */}
        <div className="card-elevated p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-br from-green-500 to-green-600 p-2.5 rounded-xl shadow">
              <Lock className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Data Security</h2>
          </div>
          <p className="text-gray-700 leading-relaxed mb-4">
            We implement a variety of security measures to maintain the safety of your personal information:
          </p>
          <ul className="space-y-2 text-gray-700 text-sm">
            {[
              "Encrypted data transmission using HTTPS/SSL",
              "Secure third-party payment processing — we do not store card or Mobile Money details",
              "Access controls ensuring only authorized staff can access your data",
              "Regular security reviews and updates",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <Shield className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Your Rights */}
        <div className="card-elevated p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-2.5 rounded-xl shadow">
              <UserCheck className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Your Rights</h2>
          </div>
          <p className="text-gray-700 leading-relaxed mb-4">
            You have the right to:
          </p>
          <ul className="space-y-2 text-gray-700 text-sm">
            {[
              "Access the personal information we hold about you",
              "Request correction of inaccurate data",
              "Request deletion of your account and data",
              "Opt out of marketing communications at any time",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-1.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <p className="text-gray-600 text-sm mt-4">
            To exercise any of these rights, contact us at the details below.
          </p>
        </div>

        {/* Contact */}
        <div className="card-elevated p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-br from-gray-600 to-gray-700 p-2.5 rounded-xl shadow">
              <Phone className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Contact Us</h2>
          </div>
          <p className="text-gray-700 leading-relaxed mb-4">
            If you have any questions or concerns about this Privacy Policy or how your data is handled, please reach out to us:
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
              <Shield className="h-5 w-5 text-primary-500 shrink-0" />
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
        <p className="text-gray-600 mb-6">Questions about your privacy?</p>
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
