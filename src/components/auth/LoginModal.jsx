import React, { useState } from "react";
import { X, Eye, EyeOff, Mail, Lock, User, Phone, MapPin, ArrowLeft } from "lucide-react";
import { useAuth } from "../../lib/auth-context";
import { toast } from "sonner";

export default function LoginModal({ isOpen, onClose, defaultTab = "login" }) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [view, setView] = useState("auth"); // "auth" | "forgot"
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const { login, register, forgotPassword } = useAuth();

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    city: "",
    country: "",
  });

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleRegisterChange = (e) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(loginData.email, loginData.password);
    if (result.success) {
      onClose();
      setLoginData({ email: "", password: "" });
    }
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (registerData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    const { ...userData } = registerData;
    const result = await register(userData);
    if (result.success) {
      onClose();
      setRegisterData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        phone: "",
        address: "",
        city: "",
        country: "",
      });
    }
    setLoading(false);
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    await forgotPassword(forgotEmail);
    setLoading(false);
    setForgotEmail("");
    setView("auth");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white/10 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-white/40">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            {view === "forgot" && (
              <button
                onClick={() => setView("auth")}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="h-4 w-4 text-gray-600" />
              </button>
            )}
            <h2 className="text-xl font-semibold text-gray-900">
              {view === "forgot"
                ? "Reset Password"
                : activeTab === "login"
                ? "Sign In"
                : "Create Account"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation — hidden on forgot view */}
        {view === "auth" && (
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab("login")}
              className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                activeTab === "login"
                  ? "text-primary-600 border-b-2 border-primary-600 bg-primary-50"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setActiveTab("register")}
              className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                activeTab === "register"
                  ? "text-primary-600 border-b-2 border-primary-600 bg-primary-50"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Sign Up
            </button>
          </div>
        )}

        <div className="p-6">
          {view === "forgot" ? (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <p className="text-sm text-gray-600">
                Enter your email and we'll send you a link to reset your password.
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="input pl-10"
                    placeholder="Enter your email"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full btn btn-primary py-3 disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          ) : activeTab === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    required
                    value={loginData.email}
                    onChange={handleLoginChange}
                    className="input pl-10"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    value={loginData.password}
                    onChange={handleLoginChange}
                    className="input pl-10 pr-10"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setView("forgot")}
                  className="text-sm text-primary-600 hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn btn-primary py-3 disabled:opacity-50"
              >
                {loading ? "Signing In..." : "Sign In"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <InputGroup
                  icon={<User />}
                  name="firstName"
                  value={registerData.firstName}
                  onChange={handleRegisterChange}
                  placeholder="First name"
                  label="First Name"
                  required
                />
                <InputGroup
                  name="lastName"
                  value={registerData.lastName}
                  onChange={handleRegisterChange}
                  placeholder="Last name"
                  label="Last Name"
                  required
                />
              </div>

              <InputGroup
                icon={<Mail />}
                name="email"
                type="email"
                value={registerData.email}
                onChange={handleRegisterChange}
                placeholder="Enter your email"
                label="Email Address"
                required
              />

              <InputGroup
                icon={<Phone />}
                name="phone"
                type="tel"
                value={registerData.phone}
                onChange={handleRegisterChange}
                placeholder="+231-XXX-XXX-XXX"
                label="Phone Number"
                required
              />

              <InputGroup
                icon={<MapPin />}
                name="address"
                value={registerData.address}
                onChange={handleRegisterChange}
                placeholder="Street address"
                label="Address"
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <InputGroup
                  name="city"
                  value={registerData.city}
                  onChange={handleRegisterChange}
                  placeholder="City"
                  label="City"
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    County
                  </label>
                  <select
                    name="country"
                    value={registerData.country}
                    onChange={handleRegisterChange}
                    className="input"
                    required
                  >
                    <option value="">Select Country</option>
                    <option value="Montserrado">Montserrado</option>
                    <option value="Nimba">Nimba</option>
                    <option value="Bong">Bong</option>
                    <option value="Lofa">Lofa</option>
                    <option value="Grand Bassa">Grand Bassa</option>
                    <option value="Margibi">Margibi</option>
                  </select>
                </div>
              </div>

              <PasswordGroup
                name="password"
                label="Password"
                value={registerData.password}
                onChange={handleRegisterChange}
                show={showPassword}
                toggle={() => setShowPassword(!showPassword)}
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full btn btn-primary py-3 disabled:opacity-50"
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper input group with optional icon
function InputGroup({ icon, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {props.label}
      </label>
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </span>
        )}
        <input {...props} className={`input ${icon ? "pl-10" : ""}`} />
      </div>
    </div>
  );
}

function PasswordGroup({ name, label, value, onChange, show, toggle }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type={show ? "text" : "password"}
          name={name}
          required
          value={value}
          onChange={onChange}
          className="input pl-10 pr-10"
          placeholder={label}
        />
        {toggle && (
          <button
            type="button"
            onClick={toggle}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {show ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
