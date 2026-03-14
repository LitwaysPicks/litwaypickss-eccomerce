import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { toast } from "sonner";
import { supabase } from "../lib/supabase";

const AuthContext = createContext();

// Idle logout config — admin only
const IDLE_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes
const IDLE_WARNING_MS = 13 * 60 * 1000; // warn at 13 minutes (2-min heads-up)
const IDLE_EVENTS = ["mousemove", "keydown", "click", "scroll", "touchstart"];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const idleTimerRef = useRef(null);
  const warningTimerRef = useRef(null);
  const warningToastIdRef = useRef(null);

  // ─── Idle Logout Logic ──────────────────────────────────────────────────────

  const clearIdleTimers = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (warningToastIdRef.current) toast.dismiss(warningToastIdRef.current);
  }, []);

  const forceLogout = useCallback(
    async (reason = "idle") => {
      clearIdleTimers();
      await supabase.auth.signOut();
      setUser(null);
      if (reason === "idle") {
        toast.warning("You were logged out due to inactivity.");
      } else if (reason === "token") {
        toast.error("Your session expired. Please sign in again.");
      }
    },
    [clearIdleTimers],
  );

  const resetIdleTimer = useCallback(
    (currentUser) => {
      if (!currentUser || currentUser.role !== "admin") return;

      clearIdleTimers();

      // Warning at 13 minutes
      warningTimerRef.current = setTimeout(() => {
        warningToastIdRef.current = toast.warning(
          "You will be logged out in 2 minutes due to inactivity.",
          { duration: 120_000, id: "idle-warning" },
        );
      }, IDLE_WARNING_MS);

      // Logout at 15 minutes
      idleTimerRef.current = setTimeout(() => {
        forceLogout("idle");
      }, IDLE_TIMEOUT_MS);
    },
    [clearIdleTimers, forceLogout],
  );

  // Attach/detach activity listeners for admin
  useEffect(() => {
    if (!user || user.role !== "admin") {
      clearIdleTimers();
      return;
    }

    const handleActivity = () => resetIdleTimer(user);

    IDLE_EVENTS.forEach((e) =>
      window.addEventListener(e, handleActivity, { passive: true }),
    );
    resetIdleTimer(user); // start timer immediately on admin login

    return () => {
      IDLE_EVENTS.forEach((e) => window.removeEventListener(e, handleActivity));
      clearIdleTimers();
    };
  }, [user, resetIdleTimer, clearIdleTimers]);

  // ─── Session Init ───────────────────────────────────────────────────────────

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from("users")
          .select("*")
          .eq("id", session.user.id)
          .single();
        setUser({ ...session.user, ...profile });
      }
      setLoading(false);
    };

    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Handle token refresh failure or explicit sign-out
        if (event === "TOKEN_REFRESHED" && !session) {
          await forceLogout("token");
          return;
        }

        if (event === "SIGNED_OUT" || !session) {
          setUser(null);
          clearIdleTimers();
          return;
        }

        // Password recovery — set session so ResetPasswordPage can call updateUser
        if (event === "PASSWORD_RECOVERY") {
          setUser(session.user);
          return;
        }

        if (session?.user) {
          const { data: profile } = await supabase
            .from("users")
            .select("*")
            .eq("id", session.user.id)
            .single();
          setUser({ ...session.user, ...profile });
        }
      },
    );

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, [forceLogout, clearIdleTimers]);

  // ─── Auth Methods ───────────────────────────────────────────────────────────

  const login = async (email, password) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message || "Login failed");
      setLoading(false);
      return { success: false, error };
    }

    const {
      data: { user: supaUser },
    } = await supabase.auth.getUser();
    const { data: profile } = await supabase
      .from("users")
      .select("*")
      .eq("id", supaUser.id)
      .single();

    const fullUser = { ...supaUser, ...profile };
    setUser(fullUser);
    toast.success("Signed in successfully!");
    setLoading(false);
    return { success: true, user: fullUser };
  };

  const register = async (userData) => {
    setLoading(true);
    const { email, password, ...metadata } = userData;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata },
    });

    if (error) {
      toast.error(error.message || "Registration failed");
      setLoading(false);
      return { success: false, error };
    }

    const userId = data?.user?.id;
    try {
      await supabase.from("users").insert({
        id: userId,
        first_name: metadata.firstName,
        last_name: metadata.lastName,
        email,
        phone: metadata.phone,
        address: metadata.address,
        city: metadata.city,
        country: metadata.country,
        role: "customer", // always customer — never trust client for role
      });
    } catch (err) {
      console.error("Error inserting into users table:", err.message);
    }

    toast.success("Account created successfully! Welcome Onboard");
    setLoading(false);
    return { success: true, user: data?.user };
  };

  const forgotPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      toast.error(error.message || "Failed to send reset email");
      return { success: false, error };
    }
    toast.success("Password reset link sent! Check your inbox.");
    return { success: true };
  };

  const resetPassword = async (newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      toast.error(error.message || "Failed to reset password");
      return { success: false, error };
    }
    await supabase.auth.signOut(); // ← add this
    toast.success("Password updated successfully!");
    return { success: true };
  };

  const logout = async () => {
    clearIdleTimers();
    await supabase.auth.signOut();
    setUser(null);
    toast.success("Logged out successfully");
  };

  const updateProfile = async (updatedData) => {
    if (!user) return { success: false, error: "Not authenticated" };

    // Prevent role escalation from client
    const { role: _stripped, ...safeData } = updatedData;

    setLoading(true);
    const { error } = await supabase
      .from("users")
      .update(safeData)
      .eq("id", user.id);

    if (error) {
      toast.error("Profile update failed");
      setLoading(false);
      return { success: false, error };
    }

    const { data: updatedProfile } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    setUser({ ...user, ...updatedProfile });
    toast.success("Profile updated successfully!");
    setLoading(false);
    return { success: true, user: { ...user, ...updatedProfile } };
  };

  const isAdmin = user?.role === "admin";
  const isCustomer = user?.role === "customer";
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        forgotPassword,
        resetPassword,
        updateProfile,
        isAdmin,
        isCustomer,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
