"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  Package,
  Heart,
  Settings,
  LogOut,
  Edit,
  X,
  Eye,
  EyeOff,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/currency";
import { useAuth } from "@/lib/auth-context";
import { logoutAction, updateProfileAction, changePasswordInAppAction, deleteAccountAction } from "@/app/actions/auth";
import { createClient } from "@/lib/supabase/client";
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

  const { data: orders = [], isLoading: ordersLoading, isError: ordersError } = useQuery({
    queryKey: ["my-orders", user?.email],
    queryFn: fetchMyOrdersAction,
    enabled: !!user?.email && activeTab === "orders",
    staleTime: 60_000,
  });
  const [isEditing, setIsEditing] = useState(false);

  // Security modals
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [showTwoFactor, setShowTwoFactor] = useState(false);

  // Change password form
  const [pwForm, setPwForm] = useState({ newPassword: "", confirm: "" });
  const [showPw, setShowPw] = useState(false);

  // Delete account confirmation
  const [deleteConfirm, setDeleteConfirm] = useState("");

  // 2FA enrollment state
  const [mfaState, setMfaState] = useState({ qrCode: "", secret: "", factorId: "", code: "", enrolled: false });
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

  const changePasswordMutation = useMutation({
    mutationFn: () => changePasswordInAppAction(pwForm.newPassword),
    onSuccess: () => {
      toast.success("Password updated successfully!");
      setShowChangePassword(false);
      setPwForm({ newPassword: "", confirm: "" });
    },
    onError: (err) => toast.error(err.message || "Failed to update password"),
  });

  const deleteAccountMutation = useMutation({
    mutationFn: deleteAccountAction,
    onSuccess: () => {
      queryClient.clear();
      router.push("/");
    },
    onError: (err) => toast.error(err.message || "Failed to delete account"),
  });

  const handleChangePassword = () => {
    if (pwForm.newPassword.length < 8) return toast.error("Password must be at least 8 characters.");
    if (pwForm.newPassword !== pwForm.confirm) return toast.error("Passwords do not match.");
    changePasswordMutation.mutate();
  };

  const handleDeleteAccount = () => {
    if (deleteConfirm !== "DELETE") return toast.error('Type "DELETE" to confirm.');
    deleteAccountMutation.mutate();
  };

  const handleStart2FA = async () => {
    const supabase = createClient();
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp" });
    if (error) return toast.error(error.message);
    setMfaState((prev) => ({
      ...prev,
      qrCode: data.totp.qr_code,
      secret: data.totp.secret,
      factorId: data.id,
    }));
    setShowTwoFactor(true);
  };

  const handleVerify2FA = async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.mfa.challengeAndVerify({
      factorId: mfaState.factorId,
      code: mfaState.code,
    });
    if (error) return toast.error("Invalid code — please try again.");
    setMfaState((prev) => ({ ...prev, enrolled: true }));
    toast.success("Two-factor authentication enabled!");
    setShowTwoFactor(false);
  };

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
                ) : ordersError ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-red-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Could not load orders</h3>
                    <p className="text-gray-600">Please try refreshing the page.</p>
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
                    <button
                      onClick={() => setShowChangePassword(true)}
                      className="w-full text-left p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <h3 className="font-medium text-gray-900 mb-1">Change Password</h3>
                      <p className="text-sm text-gray-600">Update your account password</p>
                    </button>
                    <button
                      onClick={handleStart2FA}
                      className="w-full text-left p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <h3 className="font-medium text-gray-900 mb-1">Two-Factor Authentication</h3>
                      <p className="text-sm text-gray-600">Add an extra layer of security via authenticator app</p>
                    </button>
                    <button
                      onClick={() => setShowDeleteAccount(true)}
                      className="w-full text-left p-4 border border-red-200 rounded-lg hover:bg-red-50 transition-colors text-red-600"
                    >
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

      {/* ── Change Password Modal ─────────────────────────────────────────── */}
      {showChangePassword && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
              <button onClick={() => { setShowChangePassword(false); setPwForm({ newPassword: "", confirm: "" }); }} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input
                  type={showPw ? "text" : "password"}
                  value={pwForm.newPassword}
                  onChange={(e) => setPwForm((p) => ({ ...p, newPassword: e.target.value }))}
                  className="input pr-10"
                  placeholder="Min. 8 characters"
                />
                <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3 top-8 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <input
                  type={showPw ? "text" : "password"}
                  value={pwForm.confirm}
                  onChange={(e) => setPwForm((p) => ({ ...p, confirm: e.target.value }))}
                  className="input"
                  placeholder="Repeat new password"
                />
              </div>
              {pwForm.confirm && pwForm.newPassword !== pwForm.confirm && (
                <p className="text-sm text-red-500">Passwords do not match</p>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleChangePassword}
                disabled={changePasswordMutation.isPending}
                className="btn btn-primary flex-1 disabled:opacity-50"
              >
                {changePasswordMutation.isPending ? "Updating…" : "Update Password"}
              </button>
              <button onClick={() => { setShowChangePassword(false); setPwForm({ newPassword: "", confirm: "" }); }} className="btn btn-outline px-5">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 2FA Enrollment Modal ─────────────────────────────────────────────── */}
      {showTwoFactor && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary-600" />
                <h3 className="text-lg font-semibold text-gray-900">Two-Factor Authentication</h3>
              </div>
              <button onClick={() => setShowTwoFactor(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)</p>
              {mfaState.qrCode && (
                <div className="flex justify-center">
                  <img src={mfaState.qrCode} alt="2FA QR Code" className="w-48 h-48 border rounded-lg p-2" />
                </div>
              )}
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Manual entry key:</p>
                <p className="font-mono text-sm text-gray-800 break-all">{mfaState.secret}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Enter the 6-digit code from your app</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={mfaState.code}
                  onChange={(e) => setMfaState((p) => ({ ...p, code: e.target.value.replace(/\D/g, "") }))}
                  className="input text-center text-lg tracking-[0.5em] font-mono"
                  placeholder="000000"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleVerify2FA}
                disabled={mfaState.code.length !== 6}
                className="btn btn-primary flex-1 disabled:opacity-50"
              >
                Verify & Enable
              </button>
              <button onClick={() => setShowTwoFactor(false)} className="btn btn-outline px-5">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Account Confirmation Modal ────────────────────────────────── */}
      {showDeleteAccount && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-red-600">
                <Trash2 className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Delete Account</h3>
              </div>
              <button onClick={() => { setShowDeleteAccount(false); setDeleteConfirm(""); }} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-red-700 font-medium">This action is permanent and cannot be undone.</p>
              <p className="text-sm text-red-600 mt-1">Your profile, order history, and all data will be deleted.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type <span className="font-mono font-bold">DELETE</span> to confirm
              </label>
              <input
                type="text"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                className="input"
                placeholder="DELETE"
              />
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirm !== "DELETE" || deleteAccountMutation.isPending}
                className="btn flex-1 bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteAccountMutation.isPending ? "Deleting…" : "Delete My Account"}
              </button>
              <button onClick={() => { setShowDeleteAccount(false); setDeleteConfirm(""); }} className="btn btn-outline px-5">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
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
