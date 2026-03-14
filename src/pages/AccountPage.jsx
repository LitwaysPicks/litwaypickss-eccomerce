import React, { useState } from "react";
import {
  User,
  Package,
  Heart,
  Settings,
  LogOut,
  Edit,
  Gift,
} from "lucide-react";
import { formatCurrency } from "../lib/currency";
import { useAuth } from "../lib/auth-context";
import LoyaltyCard from "../components/Loyalty/LoyaltyCard";
import LoyaltyHistory from "../components/Loyalty/LoyaltyHistory";

export default function AccountPage() {
  const { user, updateProfile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [userInfo, setUserInfo] = useState({
    firstName: user?.first_name || "",
    lastName: user?.last_name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
    city: user?.city || "",
    county: user?.county || "",
  });

  const orders = [
    {
      id: "ORD-001",
      date: "2024-01-15",
      status: "Delivered",
      total: 125.5,
      items: 3,
      statusColor: "text-green-600 bg-green-50",
    },
    {
      id: "ORD-002",
      date: "2024-01-10",
      status: "In Transit",
      total: 89.99,
      items: 2,
      statusColor: "text-blue-600 bg-blue-50",
    },
    {
      id: "ORD-003",
      date: "2024-01-05",
      status: "Processing",
      total: 234.75,
      items: 5,
      statusColor: "text-orange-600 bg-orange-50",
    },
  ];

  const wishlistItems = [
    {
      id: "1",
      name: "Wireless Bluetooth Headphones",
      price: 89.99,
      image:
        "https://images.pexels.com/photos/3945667/pexels-photo-3945667.jpeg?auto=compress&cs=tinysrgb&w=300",
    },
    {
      id: "2",
      name: "Smart Fitness Watch",
      price: 199.0,
      image:
        "https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=300",
    },
  ];

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "orders", label: "Orders", icon: Package },
    { id: "wishlist", label: "Wishlist", icon: Heart },
    { id: "loyalty", label: "Loyalty Points", icon: Gift },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const handleInputChange = (e) => {
    setUserInfo({
      ...userInfo,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    const result = await updateProfile(userInfo);
    if (result.success) {
      setIsEditing(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Account</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
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
                  <h2 className="text-xl font-semibold text-gray-900">
                    Profile Information
                  </h2>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={userInfo.firstName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="input disabled:bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={userInfo.lastName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="input disabled:bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={userInfo.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="input disabled:bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={userInfo.phone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="input disabled:bg-gray-50"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={userInfo.address}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="input disabled:bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={userInfo.city}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="input disabled:bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      County
                    </label>
                    <select
                      name="county"
                      value={userInfo.county}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="input disabled:bg-gray-50"
                    >
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
                    <button onClick={handleSave} className="btn btn-primary">
                      Save Changes
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="btn btn-outline"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === "orders" && (
              <div className="card p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Order History
                </h2>

                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-4">
                          <h3 className="font-semibold text-gray-900">
                            {order.id}
                          </h3>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${order.statusColor}`}
                          >
                            {order.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{order.date}</p>
                      </div>

                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                          {order.items} items • {formatCurrency(order.total)}
                        </p>
                        <div className="flex space-x-2">
                          <button className="btn btn-outline btn-sm">
                            View Details
                          </button>
                          {order.status === "Delivered" && (
                            <button className="btn btn-outline btn-sm">
                              Reorder
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "wishlist" && (
              <div className="card p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  My Wishlist
                </h2>

                {wishlistItems.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {wishlistItems.map((item) => (
                      <div
                        key={item.id}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex space-x-4">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 mb-1">
                              {item.name}
                            </h3>
                            <p className="text-lg font-semibold text-primary-600 mb-2">
                              {formatCurrency(item.price)}
                            </p>
                            <div className="flex space-x-2">
                              <button className="btn btn-primary btn-sm">
                                Add to Cart
                              </button>
                              <button className="btn btn-outline btn-sm">
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
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Your wishlist is empty
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Save items you love for later
                    </p>
                    <button className="btn btn-primary">Browse Products</button>
                  </div>
                )}
              </div>
            )}

            {activeTab === "loyalty" && (
              <div className="space-y-6">
                <LoyaltyCard />
                <LoyaltyHistory />
              </div>
            )}

            {activeTab === "settings" && (
              <div className="space-y-6">
                <div className="card p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Account Settings
                  </h2>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          Email Notifications
                        </h3>
                        <p className="text-sm text-gray-600">
                          Receive order updates and promotions
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          defaultChecked
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between py-3 border-b">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          SMS Notifications
                        </h3>
                        <p className="text-sm text-gray-600">
                          Get delivery updates via SMS
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          defaultChecked
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between py-3">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          Marketing Communications
                        </h3>
                        <p className="text-sm text-gray-600">
                          Receive special offers and deals
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="card p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Security
                  </h2>

                  <div className="space-y-4">
                    <button className="w-full text-left p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <h3 className="font-medium text-gray-900 mb-1">
                        Change Password
                      </h3>
                      <p className="text-sm text-gray-600">
                        Update your account password
                      </p>
                    </button>

                    <button className="w-full text-left p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <h3 className="font-medium text-gray-900 mb-1">
                        Two-Factor Authentication
                      </h3>
                      <p className="text-sm text-gray-600">
                        Add an extra layer of security
                      </p>
                    </button>

                    <button className="w-full text-left p-4 border border-red-200 rounded-lg hover:bg-red-50 transition-colors text-red-600">
                      <h3 className="font-medium mb-1">Delete Account</h3>
                      <p className="text-sm">
                        Permanently delete your account and data
                      </p>
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
