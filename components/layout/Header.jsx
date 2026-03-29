"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Search,
  ShoppingCart,
  User,
  Heart,
  MapPin,
  Settings,
  Menu,
  X,
  Clock,
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";
import { useAuth } from "@/lib/auth-context";
import { logoutAction } from "@/app/actions/auth";
import { queryClient } from "@/lib/queryClient";
import { getSearchSuggestions, getPopularSearchTerms } from "@/data/products";
import LoginModal from "@/components/auth/LoginModal";
const categories = [
  { name: "Men's", href: "/shop/mens" },
  { name: "Women's", href: "/shop/womens" },
  { name: "Electronics", href: "/shop/electronics" },
  { name: "Accessories", href: "/shop/accessories" },
  { name: "Groceries", href: "/shop/groceries" },
  { name: "Beauty & Personal Care", href: "/shop/beauty" },
  { name: "Sports & Outdoors", href: "/shop/sports" },
];

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-1.5">
      <ShoppingCart className="h-6 w-6 md:h-7 md:w-7 text-primary-600 animate-wiggle" />
      <span className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
        LitwayPicks
      </span>
    </Link>
  );
}

const TYPE_LABEL = {
  product: "Product",
  brand: "Brand",
  category: "Category",
  tag: "Tag",
};
const TYPE_COLOR = {
  product: "text-blue-500 bg-blue-50",
  brand: "text-purple-500 bg-purple-50",
  category: "text-green-500 bg-green-50",
  tag: "text-orange-500 bg-orange-50",
};

function SearchBox({
  searchQuery,
  setSearchQuery,
  searchSuggestions,
  recentSearches,
  showSearchSuggestions,
  onSearch,
  onFocus,
  onClose,
  onSuggestionClick,
  onRemoveRecent,
}) {
  const isTyping = searchQuery.trim().length > 1;

  return (
    <div className="relative w-full">
      <form onSubmit={onSearch}>
        <div className="relative">
          <input
            type="search"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={onFocus}
            onBlur={() => setTimeout(onClose, 200)}
            className="input pr-10 w-full"
          />
          <button
            type="submit"
            className="absolute right-1 top-1 h-8 w-8 flex items-center justify-center bg-primary-600 text-white rounded"
          >
            <Search className="h-4 w-4" />
          </button>
        </div>
      </form>

      {showSearchSuggestions && (
        <div className="absolute top-full left-0 right-0 bg-white border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          {/* Recent searches */}
          {!isTyping && recentSearches.length > 0 && (
            <div>
              <div className="px-3 pt-3 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Recent
              </div>
              {recentSearches.map((s) => (
                <div key={s} className="flex items-center group">
                  <button
                    onMouseDown={(e) => {
                      e.preventDefault();
                      onSuggestionClick(s);
                    }}
                    className="flex-1 flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-left"
                  >
                    <Clock className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                    <span className="text-sm text-gray-700">{s}</span>
                  </button>
                  <button
                    onMouseDown={(e) => {
                      e.preventDefault();
                      onRemoveRecent(s);
                    }}
                    className="pr-3 text-gray-300 hover:text-gray-500"
                    aria-label="Remove"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Popular / typed suggestions */}
          {searchSuggestions.length > 0 && (
            <div>
              <div className="px-3 pt-3 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {isTyping ? "Suggestions" : "Popular"}
              </div>
              {searchSuggestions.map((s, i) => {
                const text = typeof s === "string" ? s : s.text;
                const type = typeof s === "string" ? null : s.type;
                return (
                  <button
                    key={i}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      onSuggestionClick(text);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <Search className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                      <span className="text-sm text-gray-800">{text}</span>
                    </div>
                    {type && (
                      <span
                        className={`text-xs font-medium px-1.5 py-0.5 rounded ${TYPE_COLOR[type]}`}
                      >
                        {TYPE_LABEL[type]}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {isTyping && searchSuggestions.length === 0 && (
            <div className="px-4 py-3 text-sm text-gray-400">
              No suggestions found
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { itemsCount, setIsOpen } = useCart();
  const { items: wishlistItems } = useWishlist();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = JSON.parse(
        localStorage.getItem("lw_recent_searches") || "[]",
      );
      setRecentSearches(Array.isArray(stored) ? stored.slice(0, 3) : []);
    } catch {
      setRecentSearches([]);
    }
  }, []);

  const saveRecentSearch = (query) => {
    const q = query.trim();
    if (!q) return;
    setRecentSearches((prev) => {
      const updated = [q, ...prev.filter((s) => s !== q)].slice(0, 3);
      localStorage.setItem("lw_recent_searches", JSON.stringify(updated));
      return updated;
    });
  };

  const removeRecentSearch = (query) => {
    setRecentSearches((prev) => {
      const updated = prev.filter((s) => s !== query);
      localStorage.setItem("lw_recent_searches", JSON.stringify(updated));
      return updated;
    });
  };

  // Close mobile menu on route change
  useEffect(() => {
    setShowMobileMenu(false);
  }, [pathname]);

  const logoutMutation = useMutation({
    mutationFn: logoutAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth-user"] });
      router.refresh();
      toast.success("Logged out successfully");
      setShowUserMenu(false);
      setShowMobileMenu(false);
      router.push("/");
    },
    onError: () => toast.error("Logout failed"),
  });

  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      setSearchSuggestions(getSearchSuggestions(searchQuery, 8));
    } else {
      setSearchSuggestions(getPopularSearchTerms());
    }
  }, [searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      saveRecentSearch(q);
      router.push(`/shop?search=${encodeURIComponent(q)}`);
      setSearchQuery("");
      setShowSearchSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    if (!suggestion) return;
    saveRecentSearch(suggestion);
    router.push(`/shop?search=${encodeURIComponent(suggestion)}`);
    setSearchQuery("");
    setShowSearchSuggestions(false);
  };

  const handleSearchFocus = () => setShowSearchSuggestions(true);
  const handleSearchClose = () => setShowSearchSuggestions(false);

  const handleLogout = () => logoutMutation.mutate();

  const isActive = (href) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const navLinkClass = (href) =>
    `text-sm font-medium transition-colors hover:text-primary-600 ${
      isActive(href)
        ? "text-primary-600 border-b-2 border-primary-600 pb-0.5"
        : "text-gray-700"
    }`;

  const searchBoxProps = {
    searchQuery,
    setSearchQuery,
    searchSuggestions,
    recentSearches,
    showSearchSuggestions,
    onSearch: handleSearch,
    onFocus: handleSearchFocus,
    onClose: handleSearchClose,
    onSuggestionClick: handleSuggestionClick,
    onRemoveRecent: removeRecentSearch,
  };

  return (
    <>
      <header className="bg-white sticky top-0 z-50 border-b shadow-sm">
        {/* Top Bar */}
        <div className="bg-primary-600 text-white text-sm">
          <div className="container mx-auto px-4 py-2 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>Free Nationwide Delivery</span>
            </div>
            <div className="hidden md:flex gap-4">
              <span>+231-888-464-940</span>
              <span>WhatsApp Support</span>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="flex items-center gap-1 hover:text-primary-200"
                >
                  <Settings className="h-4 w-4" />
                  Admin
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div className="container mx-auto px-4 py-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Mobile Top Row: Logo + Icons */}
          <div className="flex items-center justify-between md:hidden">
            <Logo />
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsOpen(true)}
                className="relative text-gray-700 hover:text-primary-600"
              >
                <ShoppingCart className="h-5 w-5" />
                {itemsCount > 0 && (
                  <span className="absolute -top-2 -right-2 h-5 w-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center">
                    {itemsCount}
                  </span>
                )}
              </button>
              <button
                onClick={() =>
                  isAuthenticated
                    ? setShowMobileMenu(true)
                    : setShowLoginModal(true)
                }
                className="text-gray-700 hover:text-primary-600"
              >
                {isAuthenticated ? (
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 text-sm font-medium">
                      {user?.first_name?.[0]?.toUpperCase()}
                    </span>
                  </div>
                ) : (
                  <User className="h-5 w-5" />
                )}
              </button>
              <button
                onClick={() => setShowMobileMenu((v) => !v)}
                aria-label={showMobileMenu ? "Close menu" : "Open menu"}
                className="text-gray-700 hover:text-primary-600"
              >
                {showMobileMenu ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Desktop Row */}
          <div className="hidden md:flex md:items-center md:justify-between w-full">
            <Logo />

            <div className="relative w-full max-w-lg mx-4">
              <SearchBox {...searchBoxProps} />
            </div>

            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 text-gray-700 hover:text-primary-600"
                  >
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 text-sm font-medium">
                        {user?.first_name?.[0]?.toUpperCase()}
                      </span>
                    </div>
                    <span>Hi, {user?.first_name}</span>
                  </button>
                  {showUserMenu && (
                    <div className="absolute right-0 top-full mt-2 w-72 bg-white border rounded shadow-lg z-50">
                      <Link
                        href="/account"
                        onClick={() => setShowUserMenu(false)}
                        className="block px-4 py-2 hover:bg-gray-50"
                      >
                        My Account
                      </Link>
                      <Link
                        href="/wishlist"
                        onClick={() => setShowUserMenu(false)}
                        className="block px-4 py-2 hover:bg-gray-50"
                      >
                        Wishlist
                      </Link>
                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setShowUserMenu(false)}
                          className="block px-4 py-2 hover:bg-gray-50"
                        >
                          Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="text-gray-700 hover:text-primary-600"
                >
                  <User className="h-5 w-5" />
                </button>
              )}
              <Link
                href="/wishlist"
                className="relative text-gray-700 hover:text-primary-600 hidden sm:inline-block"
              >
                <Heart className="h-5 w-5" />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-2 -right-2 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {wishlistItems.length}
                  </span>
                )}
              </Link>
              <button
                onClick={() => setIsOpen(true)}
                className="relative text-gray-700 hover:text-primary-600"
              >
                <ShoppingCart className="h-5 w-5" />
                {itemsCount > 0 && (
                  <span className="absolute -top-2 -right-2 h-5 w-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center">
                    {itemsCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden">
            <SearchBox {...searchBoxProps} />
          </div>
        </div>

        {/* Nav — always visible, scrolls horizontally on mobile */}
        <nav className="border-t bg-white">
          <div className="flex items-center space-x-6 px-4 py-3 text-sm font-medium whitespace-nowrap overflow-x-auto scrollbar-hide">
            <Link href="/" className={navLinkClass("/")}>
              Home
            </Link>
            <Link href="/shop" className={navLinkClass("/shop")}>
              Shop
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.href}
                href={cat.href}
                className={navLinkClass(cat.href)}
              >
                {cat.name}
              </Link>
            ))}
            <Link href="/about" className={navLinkClass("/about")}>
              About
            </Link>
            <Link href="/contact" className={navLinkClass("/contact")}>
              Contact
            </Link>
          </div>
        </nav>

        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
        />

        {showUserMenu && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowUserMenu(false)}
          />
        )}
      </header>

      {/* Mobile drawer */}
      {showMobileMenu && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowMobileMenu(false)}
          />
          {/* Drawer */}
          <div className="absolute top-0 left-0 h-full w-72 bg-white shadow-xl flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-4 border-b">
              <span className="font-bold text-lg text-primary-600">Menu</span>
              <button
                onClick={() => setShowMobileMenu(false)}
                aria-label="Close menu"
                className="text-gray-700 hover:text-primary-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-1">
              {[
                { name: "Home", href: "/" },
                { name: "All Products", href: "/shop" },
                ...categories,
                { name: "About", href: "/about" },
                { name: "Contact", href: "/contact" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? "bg-primary-50 text-primary-600"
                      : "text-gray-700 hover:bg-gray-50 hover:text-primary-600"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Auth section at the bottom */}
            <div className="border-t px-4 py-4 space-y-2">
              {isAuthenticated ? (
                <>
                  <div className="px-3 py-2 text-sm text-gray-500">
                    Signed in as{" "}
                    <span className="font-medium text-gray-900">
                      {user?.first_name}
                    </span>
                  </div>
                  <Link
                    href="/account"
                    className="block px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                  >
                    My Account
                  </Link>
                  <Link
                    href="/wishlist"
                    className="block px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Wishlist
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="block px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setShowMobileMenu(false);
                    setShowLoginModal(true);
                  }}
                  className="w-full btn btn-primary py-2 text-sm"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
