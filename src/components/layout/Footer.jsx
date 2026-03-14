import React from "react";
import { Link } from "react-router";
import {
  Facebook,
  Twitter,
  Instagram,
  Mail,
  Phone,
  MapPin,
  Code,
  ExternalLink,
  ShoppingCart,
} from "lucide-react";
import { motion } from "motion/react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        {/* Top Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <Link
              to="/"
              className="flex flex-col font-bold items-start md:flex-row md:items-center gap-1 group"
            >
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  ease: "easeInOut",
                }}
                className="text-primary-600"
              >
                <ShoppingCart className="h-7 w-7 md:h-8 md:w-8" />
              </motion.div>
              <div className="flex flex-col md:flex-row md:items-center md:space-x-2">
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  className="text-2xl md:text-3xl font-extrabold text-primary-600 tracking-tight group-hover:tracking-wider transition-all"
                >
                  LitwayPicks
                </motion.span>
              </div>
            </Link>
            <p className="text-gray-300">
              Liberia's premier e-commerce platform offering quality products
              with free nationwide delivery.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-400 hover:text-primary-400 transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-primary-400 transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-primary-400 transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Quick Links</h4>
            <div className="space-y-2">
              <Link
                to="/about"
                className="block text-gray-300 hover:text-white transition-colors"
              >
                About Us
              </Link>
              <Link
                to="/contact"
                className="block text-gray-300 hover:text-white transition-colors"
              >
                Contact Us
              </Link>
              <Link
                to="/shop"
                className="block text-gray-300 hover:text-white transition-colors"
              >
                Shop
              </Link>
              <Link
                to="/track-order"
                className="block text-gray-300 hover:text-white transition-colors"
              >
                Track Order
              </Link>
            </div>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Customer Service</h4>
            <div className="space-y-2">
              <Link
                to="/shipping"
                className="block text-gray-300 hover:text-white transition-colors"
              >
                Shipping & Delivery
              </Link>
              <Link
                to="/returns"
                className="block text-gray-300 hover:text-white transition-colors"
              >
                Return & Refund
              </Link>
              <Link
                to="/privacy"
                className="block text-gray-300 hover:text-white transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms"
                className="block text-gray-300 hover:text-white transition-colors"
              >
                Terms & Conditions
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Contact Info</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-primary-400" />
                <span className="text-gray-300">+231-888-640-502</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-primary-400" />
                <span className="text-gray-300">support@litwaypicks.com</span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 text-primary-400 mt-1" />
                <span className="text-gray-300">
                  Monrovia, Liberia
                  <br />
                  Serving nationwide
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer Strip */}
        <div className="mt-8 pt-6 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-2 md:mb-0">
            © {new Date().getFullYear()} LitwayPicks. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-4 text-sm text-gray-400">
            <span>Secure Payments</span>
            <span>Free Delivery</span>
            <span>24/7 Support</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
