import React from "react";
import { Routes, Route } from "react-router";
import { Toaster } from "sonner";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import CartSidebar from "./components/Cart/CartSidebar";
import HomePage from "./pages/HomePage";
import ShopPage from "./pages/ShopPage";
import ProductPage from "./pages/ProductPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import AccountPage from "./pages/AccountPage";
import WishlistPage from "./pages/WishlistPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import AdminPage from "./pages/AdminPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { CartProvider } from "./lib/cart-context";
import { AuthProvider } from "./lib/auth-context";
import { LoyaltyProvider } from "./lib/loyalty-context";
import PaymentConfirmationPage from "./pages/PaymentConfirmationPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ScrollToTop from "./components/ScrollToTop";

function App() {
  return (
    <AuthProvider>
      <LoyaltyProvider>
        <CartProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <ScrollToTop />
            <main className="flex-1">
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/shop" element={<ShopPage />} />
                <Route path="/shop/:category" element={<ShopPage />} />
                <Route path="/product/:slug" element={<ProductPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />

                {/* Auth-protected routes */}
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute requireAuth={true}>
                      <CheckoutPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/confirmation"
                  element={
                    <ProtectedRoute requireAuth={true}>
                      <PaymentConfirmationPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/account"
                  element={
                    <ProtectedRoute requireAuth={true}>
                      <AccountPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/wishlist"
                  element={
                    <ProtectedRoute requireAuth={true}>
                      <WishlistPage />
                    </ProtectedRoute>
                  }
                />

                {/* Admin-only route */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requireAdmin={true}>
                      <AdminPage />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </main>
            <Footer />
            <CartSidebar />
            <Toaster position="top-right" richColors />
          </div>
        </CartProvider>
      </LoyaltyProvider>
    </AuthProvider>
  );
}

export default App;
