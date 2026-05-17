"use server";

import { requireAdmin } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/admin";

const db = () => createAdminClient();

export async function fetchAdminNotificationsAction() {
  try {
    await requireAdmin();
    const { data, error } = await db()
      .from("admin_notifications")
      .select("id, type, title, message, data, read, created_at")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) return { error: error.message };
    return { data: data ?? [] };
  } catch (err) {
    if (err?.digest?.startsWith("NEXT_REDIRECT")) throw err;
    return { error: err.message || "Failed to fetch notifications." };
  }
}

export async function markNotificationReadAction(id) {
  try {
    await requireAdmin();
    const { error } = await db()
      .from("admin_notifications")
      .update({ read: true })
      .eq("id", id);
    if (error) return { error: error.message };
    return { data: { success: true } };
  } catch (err) {
    if (err?.digest?.startsWith("NEXT_REDIRECT")) throw err;
    return { error: err.message || "Failed to mark notification read." };
  }
}

export async function markAllNotificationsReadAction() {
  try {
    await requireAdmin();
    const { error } = await db()
      .from("admin_notifications")
      .update({ read: true })
      .eq("read", false);
    if (error) return { error: error.message };
    return { data: { success: true } };
  } catch (err) {
    if (err?.digest?.startsWith("NEXT_REDIRECT")) throw err;
    return { error: err.message || "Failed to mark all notifications read." };
  }
}
