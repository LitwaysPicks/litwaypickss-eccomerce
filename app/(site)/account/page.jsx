"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  Package,
  Heart,
  Settings,
  LogOut,
  Edit,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/currency";
import { useAuth } from "@/lib/auth-context";
import { logoutAction, updateProfileAction } from "@/app/actions/auth";
import { fetchMyOrdersAction } from "@/app/actions/orders";
import { queryClient } from "@/lib/queryClient";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useWishlist } from "@/lib/wishlist-context";
import { useCart } from "@/lib/cart-context";
import Link from "next/link";

function AccountContent() {
  const { user } = useAuth();
  const router = useRouter();
  const { items: wishlistItems, removeItem: removeFromWishlist } = useWishlist();
  const { addItem: addToCart } = useCart();
  const [activeTab, setActiveTab] = useState("profile");

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["my-orders", user?.email],
    queryFn: fetchMyOrdersAction,
    enabled: !!user?.email && activeTab === "orders",
    staleTime: 60_000,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [userInfo, setUserInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    county: "",
  });

  useEffect(() => {
    if (!user) return;
    setUserInfo({
      firstName: user.first_name || "",
      lastName: user.last_name || "",
      email: user.email || "",
      phone: user.phone || "",
      address: user.address || "",
      city: user.city || "",
      county: user.country || "",
    });
  }, [user]);

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "orders", label: "Orders", icon: Package },
    { id: "wishlist", label: "Wishlist", icon: Heart },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const handleInputChange = (e) => {
    setUserInfo({ ...userInfo, [e.target.name]: e.target.value });
  };

  const updateProfileMutation = useMutation({
    mutationFn: (data) => updateProfileAction(user?.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth-user"] });
      router.refresh();
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    },
    onError: (err) => toast.error(err.message || "Profile update failed"),
  });

  const logoutMutation = useMutation({
    mutationFn: logoutAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth-user"] });
      router.push("/");
    },
    onError: () => toast.error("Logout failed"),
  });

  const handleSave = () => updateProfileMutation.mutate(userInfo);
  const handleLogout = () => logoutMutation.mutate();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Account</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 font-semibold text-lg">
                    {user?.first_name?.[0]?.toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {user?.first_name} {user?.last_name}
                  </h3>
                  <p className="text-sm text-gray-600">Customer</p>
                </div>
              </div>

              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? "bg-primary-50 text-primary-600 border border-primary-200"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Sign Out</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === "profile" && (
              <div className="card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="btn btn-outline flex items-center space-x-2"
                  >
                    <Edit className="h-4 w-4" />
                    <span>{isEditing ? "Cancel" : "Edit"}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input type="text" name="firstName" value={userInfo.firstName} onChange={handleInputChange} disabled={!isEditing} className="input disabled:bg-gray-50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input type="text" name="lastName" value={userInfo.lastName} onChange={handleInputChange} disabled={!isEditing} className="input disabled:bg-gray-50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" name="email" value={userInfo.email} onChange={handleInputChange} disabled={!isEditing} className="input disabled:bg-gray-50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input type="tel" name="phone" value={userInfo.phone} onChange={handleInputChange} disabled={!isEditing} className="input disabled:bg-gray-50" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input type="text" name="address" value={userInfo.address} onChange={handleInputChange} disabled={!isEditing} className="input disabled:bg-gray-50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input type="text" name="city" value={userInfo.city} onChange={handleInputChange} disabled={!isEditing} className="input disabled:bg-gray-50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">County</label>
                    <select name="county" value={userInfo.county} onChange={handleInputChange} disabled={!isEditing} className="input disabled:bg-gray-50">
                      <option value="Montserrado">Montserrado</option>
                      <option value="Nimba">Nimba</option>
                      <option value="Bong">Bong</option>
                      <option value="Lofa">Lofa</option>
                      <option value="Grand Bassa">Grand Bassa</option>
                      <option value="Margibi">Margibi</option>
                    </select>
                  </div>
                </div>

                {isEditing && (
                  <div className="mt-6 flex space-x-4">
                    <button onClick={handleSave} className="btn btn-primary">Save Changes</button>
                    <button onClick={() => setIsEditing(false)} className="btn btn-outline">Cancel</button>
                  </div>
                )}
              </div>
            )}

            {activeTab === "orders" && (
              <div className="card p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Order History</h2>
                {ordersLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((n) => (
                      <div key={n} className="border rounded-lg p-4 animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                        <div className="h-3 bg-gray-100 rounded w-1/2" />
                      </div>
                    ))}
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                    <p className="text-gray-600 mb-4">Your order history will appear here</p>
                    <Link href="/shop" className="btn btn-primary">Start Shopping</Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => {
                      const statusStyles = {
                        COMPLETED: "text-green-600 bg-green-50",
                        PENDING: "text-orange-600 bg-orange-50",
                        FAILED: "text-red-600 bg-red-50",
                        REFUNDED: "text-purple-600 bg-purple-50",
                      };
                      const itemCount = Array.isArray(order.items) ? order.items.length : 0;
                      return (
                        <div key={order.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-4">
                              <h3 className="font-semibold text-gray-900 font-mono text-sm">
                                {order.external_id}
                              </h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[order.payment_status] ?? "text-gray-600 bg-gray-50"}`}>
                                {order.payment_status.charAt(0) + order.payment_status.slice(1).toLowerCase()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">
                              {new Date(order.created_at).toLocaleDateString("en", { year: "numeric", month: "short", day: "numeric" })}
                            </p>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-600">
                              {itemCount} item{itemCount !== 1 ? "s" : ""} • {order.delivery_city}, {order.delivery_state}
                            </p>
                            <p className="font-semibold text-gray-900">{formatCurrency(order.final_total)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === "wishlist" && (
              <div className="card p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">My Wishlist</h2>
                {wishlistItems.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {wishlistItems.map((item) => (
                      <div key={item.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex space-x-4">
                          <img
                            src={item.images?.[0] || item.image_urls?.[0] || ""}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 mb-1">{item.name}</h3>
                            <p className="text-lg font-semibold text-primary-600 mb-2">
                              {formatCurrency(item.sale_price || item.price)}
                            </p>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => addToCart(item)}
                                className="btn btn-primary btn-sm"
                              >
                                Add to Cart
                              </button>
                              <button
                                onClick={() => removeFromWishlist(item.id)}
                                className="btn btn-outline btn-sm"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Your wishlist is empty</h3>
                    <p className="text-gray-600 mb-4">Save items you love for later</p>
                    <Link href="/shop" className="btn btn-primary">Browse Products</Link>
                  </div>
                )}
              </div>
            )}

            {activeTab === "settings" && (
              <div className="space-y-6">
                <div className="card p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Account Settings</h2>
                  <div className="space-y-4">
                    {[
                      { label: "Email Notifications", desc: "Receive order updates and promotions", defaultChecked: true },
                      { label: "SMS Notifications", desc: "Get delivery updates via SMS", defaultChecked: true },
                      { label: "Marketing Communications", desc: "Receive special offers and deals", defaultChecked: false },
                    ].map((setting) => (
                      <div key={setting.label} className="flex items-center justify-between py-3 border-b last:border-0">
                        <div>
                          <h3 className="font-medium text-gray-900">{setting.label}</h3>
                          <p className="text-sm text-gray-600">{setting.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked={setting.defaultChecked} />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Security</h2>
                  <div className="space-y-4">
                    <button className="w-full text-left p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <h3 className="font-medium text-gray-900 mb-1">Change Password</h3>
                      <p className="text-sm text-gray-600">Update your account password</p>
                    </button>
                    <button className="w-full text-left p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <h3 className="font-medium text-gray-900 mb-1">Two-Factor Authentication</h3>
                      <p className="text-sm text-gray-600">Add an extra layer of security</p>
                    </button>
                    <button className="w-full text-left p-4 border border-red-200 rounded-lg hover:bg-red-50 transition-colors text-red-600">
                      <h3 className="font-medium mb-1">Delete Account</h3>
                      <p className="text-sm">Permanently delete your account and data</p>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <ProtectedRoute requireAuth={true}>
      <AccountContent />
    </ProtectedRoute>
  );
}
