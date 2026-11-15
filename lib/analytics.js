"use client";

import { supabase } from "@/lib/supabase";

/**
 * Lightweight activity tracking for the admin Analytics page.
 *
 * Writes one row to public.app_events per action. No personal data is sent:
 * each browser gets a random id, plus the user id when signed in. Purchases
 * are not tracked here; the dashboard reads them from paid orders.
 *
 * Fire-and-forget: tracking must never break or slow the site.
 */

const ANON_ID_KEY = "litways-analytics-id";
const LAST_OPEN_KEY = "litways-analytics-last-open";
// Ignore an identical event fired again within this window.
const DEDUPE_MS = 5_000;
// A new "visit" counts only after the visitor has been away this long.
const VISIT_GAP_MS = 30 * 60_000;

const lastSent = new Map();

function safeGet(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // private mode / storage blocked — fine
  }
}

let memoryAnonId = null;
function getAnonId() {
  const existing = safeGet(ANON_ID_KEY) || memoryAnonId;
  if (existing) return existing;
  const id =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID().replace(/-/g, "").slice(0, 24)
      : Math.random().toString(36).slice(2, 14) + Math.random().toString(36).slice(2, 14);
  memoryAnonId = id;
  safeSet(ANON_ID_KEY, id);
  return id;
}

export function track(event, productId = null) {
  if (typeof window === "undefined") return;
  const key = `${event}:${productId ?? ""}`;
  const now = Date.now();
  if (now - (lastSent.get(key) ?? 0) < DEDUPE_MS) return;
  lastSent.set(key, now);

  (async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      await supabase.from("app_events").insert({
        event,
        platform: "web",
        anon_id: getAnonId(),
        user_id: session?.user?.id ?? null,
        product_id: productId ? String(productId) : null,
      });
    } catch {
      // never surface tracking failures
    }
  })();
}

/** Counts a site visit at most once per 30 minutes of activity. */
export function trackVisit() {
  if (typeof window === "undefined") return;
  // Admin-panel sessions aren't customer activity.
  if (window.location.pathname.startsWith("/admin")) return;
  const now = Date.now();
  const last = Number(safeGet(LAST_OPEN_KEY) || 0);
  safeSet(LAST_OPEN_KEY, String(now));
  if (now - last < VISIT_GAP_MS) return;
  track("app_open");
}
