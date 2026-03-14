import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import {
  Search,
  ShoppingCart,
  User,
  Heart,
  MapPin,
  Settings,
} from "lucide-react";
import { useCart } from "../../lib/cart-context";
import { useAuth } from "../../lib/auth-context";
import { motion } from "motion/react";
import { useLoyalty } from "../../lib/loyalty-context";
import {
  getSearchSuggestions,
  getPopularSearchTerms,
} from "../../data/products";
import LoginModal from "../auth/LoginModal";
import LoyaltyCard from "../Loyalty/LoyaltyCard";

const categories = [
  { name: "Men's", href: "/shop/mens" },
  { name: "Women's", href: "/shop/womens" },
  { name: "Electronics", href: "/shop/electronics" },
  { name: "Accessories", href: "/shop/accessories" },
  { name: "Groceries", href: "/shop/groceries" },
  { name: "Beauty & Personal Care", href: "/shop/beauty" },
  { name: "Sports & Outdoors", href: "/shop/sports" },
];

// Fix #7: single Logo component — one Framer Motion instance only
function Logo() {
  return (
    <Link to="/" className="flex items-center gap-1 group">
      <motion.div
        initial={{ rotate: 0 }}
        animate={{ rotate: [0, 15, -15, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        className="text-primary-600"
      >
        <ShoppingCart className="h-7 w-7 md:h-8 md:w-8" />
      </motion.div>
      <motion.span
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="text-2xl md:text-3xl font-extrabold text-primary-600 tracking-tight group-hover:tracking-wider transition-all"
      >
        LitwayPicks
      </motion.span>
    </Link>
  );
}

// Fix #14: single SearchBox component — no more duplicated ~50 lines
function SearchBox({
  searchQuery,
  setSearchQuery,
  searchSuggestions,
  showSearchSuggestions,
  onSearch,
  onFocus,
  onSuggestionClick,
}) {
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
            onBlur={() => setTimeout(() => onSuggestionClick(null), 200)}
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
        <div className="absolute top-full left-0 right-0 bg-white border rounded-lg shadow z-50 max-h-60 overflow-y-auto">
          <div className="p-2">
            {searchQuery.trim().length <= 1 && (
              <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase">
                Popular Searches
              </div>
            )}
            {searchSuggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => onSuggestionClick(s)}
                className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-2"
              >
                <Search className="h-4 w-4 text-gray-400" />
                <span>{s}</span>
              </button>
            ))}
          </div>
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
  const { itemsCount, setIsOpen } = useCart();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { loyaltyData } = useLoyalty();
  const navigate = useNavigate();

  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      setSearchSuggestions(getSearchSuggestions(searchQuery, 8));
      setShowSearchSuggestions(true);
    } else {
      setSearchSuggestions([]);
      setShowSearchSuggestions(false);
    }
  }, [searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      setShowSearchSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    if (!suggestion) return;
    setSearchQuery(suggestion);
    navigate(`/shop?search=${encodeURIComponent(suggestion)}`);
    setShowSearchSuggestions(false);
  };

  const handleSearchFocus = () => {
    if (searchQuery.trim().length > 1) {
      setShowSearchSuggestions(true);
    } else {
      setSearchSuggestions(getPopularSearchTerms());
      setShowSearchSuggestions(true);
    }
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate("/");
  };

  const searchBoxProps = {
    searchQuery,
    setSearchQuery,
    searchSuggestions,
    showSearchSuggestions,
    onSearch: handleSearch,
    onFocus: handleSearchFocus,
    onSuggestionClick: handleSuggestionClick,
  };

  return (
    <header className="bg-white sticky top-0 z-50 border-b shadow-sm">
      {/* Top Bar */}
      <div className="bg-primary-600 text-white text-sm">
        <div className="container mx-auto px-4 py-2 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>Free Nationwide Delivery</span>
          </div>
          <div className="hidden md:flex gap-4">
            <span>📞 +231-888-640-502</span>
            <span>💬 WhatsApp Support</span>
            {isAdmin && (
              <Link
                to="/admin"
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
          <div className="flex items-center gap-4">
            <Link
              to="/contact"
              className="text-gray-700 hover:text-primary-600"
            >
              <MapPin className="h-5 w-5" />
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
            <button
              onClick={() =>
                isAuthenticated
                  ? setShowUserMenu(!showUserMenu)
                  : setShowLoginModal(true)
              }
              className="text-gray-700 hover:text-primary-600"
            >
              <User className="h-5 w-5" />
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
                    {loyaltyData && (
                      <div className="border-b px-4 py-2">
                        <LoyaltyCard compact />
                      </div>
                    )}
                    <Link
                      to="/account"
                      onClick={() => setShowUserMenu(false)}
                      className="block px-4 py-2 hover:bg-gray-50"
                    >
                      My Account
                    </Link>
                    <Link
                      to="/wishlist"
                      onClick={() => setShowUserMenu(false)}
                      className="block px-4 py-2 hover:bg-gray-50"
                    >
                      Wishlist
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
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
              to="/wishlist"
              className="text-gray-700 hover:text-primary-600 hidden sm:inline"
            >
              <Heart className="h-5 w-5" />
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

      {/* Always-visible Nav Links */}
      <nav className="border-t overflow-x-auto scrollbar-hide bg-white">
        <div className="flex items-center space-x-6 px-4 py-3 text-sm font-medium whitespace-nowrap">
          <Link to="/" className="text-gray-700 hover:text-primary-600">
            Home
          </Link>
          <Link to="/shop" className="text-gray-700 hover:text-primary-600">
            Shop
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.href}
              to={cat.href}
              className="text-gray-700 hover:text-primary-600"
            >
              {cat.name}
            </Link>
          ))}
          <Link
            to="/about"
            className="text-gray-700 hidden md:block hover:text-primary-600"
          >
            About
          </Link>
          <Link
            to="/contact"
            className="text-gray-700 hidden md:block hover:text-primary-600"
          >
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
  );
}
