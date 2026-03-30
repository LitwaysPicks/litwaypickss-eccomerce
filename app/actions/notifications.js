"use server";

import { requireAdmin } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/admin";

const db = () => createAdminClient();

export async function fetchAdminNotificationsAction() {
  await requireAdmin();
  const { data, error } = await db()
    .from("admin_notifications")
    .select("id, type, title, message, data, read, created_at")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function markNotificationReadAction(id) {
  await requireAdmin();
  const { error } = await db()
    .from("admin_notifications")
    .update({ read: true })
    .eq("id", id);
  if (error) throw new Error(error.message);
  return { success: true };
}

export async function markAllNotificationsReadAction() {
  await requireAdmin();
  const { error } = await db()
    .from("admin_notifications")
    .update({ read: true })
    .eq("read", false);
  if (error) throw new Error(error.message);
  return { success: true };
}
