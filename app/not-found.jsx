import Link from "next/link";
import { ShoppingCart, Home, Search, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Page Not Found | LitwayPicks",
  description: "The page you're looking for doesn't exist.",
};

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center container mx-auto px-4 py-16">
      <div className="text-center max-w-lg">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-gradient-to-br from-primary-100 to-orange-100 p-6 rounded-3xl">
            <ShoppingCart className="h-16 w-16 text-primary-500" />
          </div>
        </div>

        {/* 404 */}
        <h1 className="text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-orange-500 mb-2">
          404
        </h1>

        <h2 className="text-2xl font-bold text-gray-900 mb-3">Page Not Found</h2>
        <p className="text-gray-600 leading-relaxed mb-8">
          Oops! The page you're looking for doesn't exist or may have been moved. Let's get you back on track.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
          <Link
            href="/"
            className="btn btn-primary px-6 py-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <Home className="h-4 w-4" />
            Go Home
          </Link>
          <Link
            href="/shop"
            className="btn btn-outline px-6 py-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <Search className="h-4 w-4" />
            Browse Shop
          </Link>
        </div>

        {/* Quick Links */}
        <div className="card-elevated p-6">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Quick Links
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "About Us", href: "/about" },
              { label: "Contact", href: "/contact" },
              { label: "Shipping Info", href: "/shipping" },
              { label: "Returns", href: "/returns" },
            ].map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600 transition-colors p-2 rounded-lg hover:bg-primary-50"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
