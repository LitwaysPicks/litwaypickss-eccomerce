"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { User, Lock, Save, Loader2 } from "lucide-react";

function Section({ icon: Icon, title, children }) {
  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50">
          <Icon className="h-4 w-4 text-primary-600" />
        </div>
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
      </div>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [profile, setProfile] = useState({
    first_name: "", last_name: "", phone: "", city: "", country: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);

  const [passwords, setPasswords] = useState({ current: "", new_: "", confirm: "" });
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setProfile({
        first_name: user.first_name ?? "",
        last_name: user.last_name ?? "",
        phone: user.phone ?? "",
        city: user.city ?? "",
        country: user.country ?? "",
      });
    }
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const { error } = await supabase
        .from("users")
        .update({
          first_name: profile.first_name,
          last_name: profile.last_name,
          phone: profile.phone,
          city: profile.city,
          country: profile.country,
        })
        .eq("id", user.id);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["auth-user"] });
      toast.success("Profile updated");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.new_ !== passwords.confirm) {
      toast.error("New passwords do not match");
      return;
    }
    if (passwords.new_.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setSavingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: passwords.new_ });
      if (error) throw error;
      toast.success("Password updated");
      setPasswords({ current: "", new_: "", confirm: "" });
    } catch (err) {
      toast.error(err.message || "Failed to update password");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Profile */}
      <Section icon={User} title="Profile Information">
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">First Name</label>
              <input className="input" value={profile.first_name} onChange={(e) => setProfile(p => ({ ...p, first_name: e.target.value }))} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Last Name</label>
              <input className="input" value={profile.last_name} onChange={(e) => setProfile(p => ({ ...p, last_name: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Email</label>
            <input className="input opacity-60 cursor-not-allowed" value={user?.email ?? ""} readOnly />
            <p className="mt-1 text-xs text-gray-400">Email cannot be changed here.</p>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Phone</label>
            <input className="input" value={profile.phone} onChange={(e) => setProfile(p => ({ ...p, phone: e.target.value }))} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">City</label>
              <input className="input" value={profile.city} onChange={(e) => setProfile(p => ({ ...p, city: e.target.value }))} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Country</label>
              <input className="input" value={profile.country} onChange={(e) => setProfile(p => ({ ...p, country: e.target.value }))} />
            </div>
          </div>
          <button type="submit" disabled={savingProfile} className="btn btn-primary gap-2 px-5 py-2">
            {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {savingProfile ? "Saving…" : "Save Profile"}
          </button>
        </form>
      </Section>

      {/* Password */}
      <Section icon={Lock} title="Change Password">
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">New Password</label>
            <input
              type="password" className="input"
              placeholder="Min. 8 characters"
              value={passwords.new_}
              onChange={(e) => setPasswords(p => ({ ...p, new_: e.target.value }))}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Confirm New Password</label>
            <input
              type="password" className="input"
              placeholder="Repeat new password"
              value={passwords.confirm}
              onChange={(e) => setPasswords(p => ({ ...p, confirm: e.target.value }))}
            />
          </div>
          <button type="submit" disabled={savingPassword || !passwords.new_} className="btn btn-primary gap-2 px-5 py-2">
            {savingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
            {savingPassword ? "Updating…" : "Update Password"}
          </button>
        </form>
      </Section>
    </div>
  );
}
