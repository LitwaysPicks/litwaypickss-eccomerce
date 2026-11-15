"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X, Eye, EyeOff, Mail, Lock, User, Phone, MapPin, ArrowLeft } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryClient } from "@/lib/queryClient";
import {
  loginAction,
  signupAction,
  verifySignupCodeAction,
  resendSignupCodeAction,
  sendPasswordResetAction,
} from "@/app/actions/auth";

export default function LoginModal({ isOpen, onClose, onSuccess, defaultTab = "login" }) {
  const router = useRouter();
  const handleSuccess = onSuccess ?? onClose;

  const [activeTab, setActiveTab] = useState(defaultTab);
  const [view, setView] = useState("auth"); // "auth" | "forgot" | "verify"
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");

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

  // ── Mutations ────────────────────────────────────────────────────────────────
  // mutationFn is a Server Action — runs on the server, sets HttpOnly auth
  // cookies, then returns. router.refresh() forces Next.js to re-run server
  // components so the new session is immediately visible.

  const loginMutation = useMutation({
    mutationFn: async (data) => {
      const result = await loginAction(data);
      if (result?.error) throw new Error(result.error);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["auth-user"] });
      router.refresh();
      toast.success("Signed in successfully!");
      setLoginData({ email: "", password: "" });
      handleSuccess();
    },
    onError: async (err, variables) => {
      // Signed up but never entered the code — send a fresh one and show the code screen.
      if (/email not confirmed/i.test(err.message || "")) {
        const email = variables.email.trim().toLowerCase();
        setVerifyEmail(email);
        setVerifyCode("");
        setView("verify");
        await resendSignupCodeAction(email);
        toast.info("Please verify your email first — we sent you a new code.");
        return;
      }
      toast.error(err.message || "Login failed");
    },
  });

  const resetRegisterForm = () => {
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
    setAcceptedTerms(false);
  };

  const registerMutation = useMutation({
    mutationFn: async (data) => {
      const result = await signupAction({ ...data, acceptedTerms });
      if (result?.error) throw new Error(result.error);
      return result;
    },
    onSuccess: async (result) => {
      if (result?.needsVerification) {
        setVerifyEmail(result.email);
        setVerifyCode("");
        resetRegisterForm();
        setView("verify");
        toast.success("We sent a 6-digit code to your email.");
        return;
      }
      await queryClient.invalidateQueries({ queryKey: ["auth-user"] });
      router.refresh();
      toast.success("Account created successfully! Welcome aboard.");
      resetRegisterForm();
      handleSuccess();
    },
    onError: (err) => toast.error(err.message || "Registration failed"),
  });

  const verifyMutation = useMutation({
    mutationFn: async () => {
      const result = await verifySignupCodeAction({ email: verifyEmail, code: verifyCode });
      if (result?.error) throw new Error(result.error);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["auth-user"] });
      router.refresh();
      toast.success("Email verified! Welcome to Litway Picks.");
      setView("auth");
      setVerifyCode("");
      handleSuccess();
    },
    onError: (err) => toast.error(err.message || "Verification failed"),
  });

  const resendMutation = useMutation({
    mutationFn: async () => {
      const result = await resendSignupCodeAction(verifyEmail);
      if (result?.error) throw new Error(result.error);
    },
    onSuccess: () => toast.success("A new code is on its way."),
    onError: (err) => toast.error(err.message || "Couldn't resend the code"),
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: async (email) => {
      const result = await sendPasswordResetAction(email);
      if (result?.error) throw new Error(result.error);
    },
    onSuccess: () => {
      toast.success("Password reset link sent! Check your inbox.");
      setView("auth");
      setForgotEmail("");
    },
    onError: (err) => toast.error(err.message || "Failed to send reset email"),
  });

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleLogin = (e) => {
    e.preventDefault();
    loginMutation.mutate(loginData);
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (registerData.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (!acceptedTerms) {
      toast.error("Please accept the Terms of Service and Privacy Policy");
      return;
    }
    registerMutation.mutate(registerData);
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    forgotPasswordMutation.mutate(forgotEmail);
  };

  if (!isOpen) return null;

  const isLoginPending = loginMutation.isPending;
  const isRegisterPending = registerMutation.isPending;
  const isForgotPending = forgotPasswordMutation.isPending;

  return (
    <div className="fixed inset-0 bg-white/10 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-white/40">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            {(view === "forgot" || view === "verify") && (
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
                : view === "verify"
                ? "Verify Your Email"
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
          {view === "verify" ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                verifyMutation.mutate();
              }}
              className="space-y-4"
            >
              <p className="text-sm text-gray-600">
                We sent a 6-digit code to <strong>{verifyEmail}</strong>. Enter it
                below to confirm this email belongs to you.
              </p>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                required
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="input text-center text-2xl tracking-[0.5em] font-semibold"
                placeholder="••••••"
                aria-label="6-digit verification code"
              />
              <button
                type="submit"
                disabled={verifyMutation.isPending || verifyCode.length !== 6}
                className="w-full btn btn-primary py-3 disabled:opacity-50"
              >
                {verifyMutation.isPending ? "Verifying..." : "Verify Email"}
              </button>
              <p className="text-center text-sm text-gray-600">
                Didn&apos;t get it? Check spam, or{" "}
                <button
                  type="button"
                  onClick={() => resendMutation.mutate()}
                  disabled={resendMutation.isPending}
                  className="font-medium text-primary-600 hover:underline disabled:opacity-50"
                >
                  {resendMutation.isPending ? "sending..." : "send a new code"}
                </button>
              </p>
            </form>
          ) : view === "forgot" ? (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <p className="text-sm text-gray-600">
                Enter your email and we&apos;ll send you a link to reset your password.
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
                disabled={isForgotPending}
                className="w-full btn btn-primary py-3 disabled:opacity-50"
              >
                {isForgotPending ? "Sending..." : "Send Reset Link"}
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
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
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
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    className="input pl-10 pr-10"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
                disabled={isLoginPending}
                className="w-full btn btn-primary py-3 disabled:opacity-50"
              >
                {isLoginPending ? "Signing In..." : "Sign In"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <InputGroup
                  icon={<User />}
                  name="firstName"
                  value={registerData.firstName}
                  onChange={(e) => setRegisterData({ ...registerData, firstName: e.target.value })}
                  placeholder="First name"
                  label="First Name"
                  required
                />
                <InputGroup
                  name="lastName"
                  value={registerData.lastName}
                  onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })}
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
                onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                placeholder="Enter your email"
                label="Email Address"
                required
              />

              <InputGroup
                icon={<Phone />}
                name="phone"
                type="tel"
                value={registerData.phone}
                onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                placeholder="+231-XXX-XXX-XXX"
                label="Phone Number"
                required
              />

              <InputGroup
                icon={<MapPin />}
                name="address"
                value={registerData.address}
                onChange={(e) => setRegisterData({ ...registerData, address: e.target.value })}
                placeholder="Street address"
                label="Address"
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <InputGroup
                  name="city"
                  value={registerData.city}
                  onChange={(e) => setRegisterData({ ...registerData, city: e.target.value })}
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
                    onChange={(e) => setRegisterData({ ...registerData, country: e.target.value })}
                    className="input"
                    required
                  >
                    <option value="">Select County</option>
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
                onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                show={showPassword}
                toggle={() => setShowPassword(!showPassword)}
              />

              <label className="flex items-start gap-3 text-sm text-gray-700">
                <input
                  type="checkbox"
                  required
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span>
                  I have read and agree to the{" "}
                  <Link href="/terms" target="_blank" className="font-medium text-primary-600 hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" target="_blank" className="font-medium text-primary-600 hover:underline">
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>

              <button
                type="submit"
                disabled={isRegisterPending || !acceptedTerms}
                className="w-full btn btn-primary py-3 disabled:opacity-50"
              >
                {isRegisterPending ? "Creating Account..." : "Create Account"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function InputGroup({ icon, label, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400">
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
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
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
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
    </div>
  );
}
