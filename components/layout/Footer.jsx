import React from "react";
import Link from "next/link";
import { ShoppingCart, Mail, Phone, MapPin, Smartphone } from "lucide-react";

function FacebookIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function XIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function InstagramIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-1.5">
              <ShoppingCart className="h-6 w-6 text-primary-500" />
              <span className="text-xl font-bold text-white">
                LitwayPicks
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              Liberia's premier e-commerce platform offering quality products
              with free nationwide delivery.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                aria-label="Facebook"
                className="text-gray-400 hover:text-primary-400 transition-colors"
              >
                <FacebookIcon className="h-5 w-5" />
              </a>
              <a
                href="#"
                aria-label="X (Twitter)"
                className="text-gray-400 hover:text-primary-400 transition-colors"
              >
                <XIcon className="h-5 w-5" />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="text-gray-400 hover:text-primary-400 transition-colors"
              >
                <InstagramIcon className="h-5 w-5" />
              </a>
            </div>

            {/* Payment badge */}
            <div className="flex items-center gap-2 mt-2 rounded-md border border-gray-700 bg-gray-800 px-3 py-2 w-fit">
              <Smartphone className="h-4 w-4 text-gray-400 shrink-0" />
              <p className="text-xs text-gray-400 leading-tight">
                We accept <span className="text-gray-200 font-medium">Mobile Money</span> payments
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-300">
              Quick Links
            </h4>
            <nav className="space-y-2 text-sm">
              {[
                { label: "About Us", href: "/about" },
                { label: "Contact Us", href: "/contact" },
                { label: "Shop", href: "/shop" },
                { label: "Track Order", href: "/track-order" },
              ].map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className="block text-gray-400 hover:text-white transition-colors"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-300">
              Customer Service
            </h4>
            <nav className="space-y-2 text-sm">
              {[
                { label: "Shipping & Delivery", href: "/shipping" },
                { label: "Return & Refund", href: "/returns" },
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Terms & Conditions", href: "/terms" },
              ].map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className="block text-gray-400 hover:text-white transition-colors"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-300">
              Contact Info
            </h4>
            <address className="not-italic space-y-3 text-sm text-gray-400">
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-gray-500 shrink-0" />
                <span>+231-888-464-940</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-gray-500 shrink-0" />
                <span>litwaypicks@gmail.com</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-gray-500 shrink-0 mt-0.5" />
                <span>
                  Monrovia, Liberia
                  <br />
                  Serving nationwide
                </span>
              </div>
            </address>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} LitwayPicks. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-gray-500">
            <span>Secure Payments</span>
            <span>Free Delivery</span>
            <span>24/7 Support</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
