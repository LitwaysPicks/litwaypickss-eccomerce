# Next.js + Supabase Authentication System — Reference Guide

A complete, copy-paste-ready authentication architecture for Next.js (App Router) + Supabase SSR.
Follow every rule here. Deviation is how auth bugs happen.

---

## The Golden Rules (never break these)

1. **Always use `getUser()`, never `getSession()`** on the server.
   `getSession()` reads the cookie without validating it server-side — a tampered token passes.
   `getUser()` makes a network call to Supabase to verify the JWT.

2. **Never check auth only on the client.** Client-side guards (`ProtectedRoute`, hooks, context) are UX, not security.
   Every protected server layout and every Server Action must independently validate the session.

3. **Never store the session in `localStorage`.** Use HttpOnly cookies via `@supabase/ssr`.
   localStorage is readable by any script on the page (XSS).

4. **Always read the role from the database.** Never trust JWT claims for authorization decisions.
   A JWT claim for `role` is set at login and doesn't update if you change the role in the DB.

5. **Roll back auth records on signup failure.** If the `users` table insert fails after `auth.signUp()`,
   delete the auth user with the admin client so the email isn't permanently locked.

6. **Strip sensitive fields before profile updates.** Always remove `role` and `email` from profile
   update payloads. Email is owned by Supabase Auth; role changes need their own admin action.

---

## File Structure

```
lib/
  supabase/
    client.js       ← browser singleton (public anon key)
    server.js       ← per-request server client (reads/writes cookies)
    admin.js        ← service-role client (server-only, bypasses RLS)
  session.js        ← getServerUser(), requireAuth(), requireAdmin()
  auth-context.jsx  ← AuthProvider + useAuth() hook (client)
  auth.js           ← fetchAuthUser() — React Query queryFn (client)

app/
  actions/
    auth.js         ← loginAction, signupAction, logoutAction, updatePasswordAction, updateProfileAction
  admin/
    layout.jsx      ← MUST call requireAdmin() server-side
  (site)/
    account/
      page.jsx      ← wrap content in <ProtectedRoute requireAuth>

proxy.js            ← (Next.js middleware) token refresh + coarse redirect
```

---

## 1. Supabase Clients

### `lib/supabase/client.js` — browser
```js
import { createBrowserClient } from "@supabase/ssr";

let _client;

export function createClient() {
  if (!_client) {
    _client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    );
  }
  return _client;
}
```

### `lib/supabase/server.js` — server (per-request)
```js
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Component — mutation is a no-op; proxy handles refresh.
          }
        },
      },
    },
  );
}
```

### `lib/supabase/admin.js` — service role (server-only)
```js
import { createClient } from "@supabase/supabase-js";

// NEVER import in client components. NEVER expose SUPABASE_SERVICE_ROLE_KEY to the browser.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
```

---

## 2. Proxy / Middleware — `proxy.js`

Runs on every request. Two jobs only: **refresh tokens** and **coarse redirect** for unauthenticated users.
Do NOT do role checks here — it's a DB call on every request.

```js
import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

const AUTH_REQUIRED = ["/account", "/checkout", "/cart", "/wishlist"];
const ADMIN_PATHS   = ["/admin"];

export async function proxy(request) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value, options),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // getUser() — validates JWT. Never use getSession() here.
  const { data: { user } } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;

  const redirect = (to, from) => {
    const url = request.nextUrl.clone();
    url.pathname = to;
    if (from) url.searchParams.set("from", from);
    return NextResponse.redirect(url);
  };

  // Unauthenticated → /login
  if (ADMIN_PATHS.some(p => pathname.startsWith(p)) && !user)
    return redirect("/login", pathname);
  if (AUTH_REQUIRED.some(p => pathname.startsWith(p)) && !user)
    return redirect("/login", pathname);

  // Authenticated on /login → redirect away
  if (user && pathname === "/login") {
    const from = request.nextUrl.searchParams.get("from");
    return redirect(from?.startsWith("/") ? from : "/");
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
```

---

## 3. Server Session Utilities — `lib/session.js`

Import only from Server Components, Server Actions, and Route Handlers.

```js
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function getServerUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;

  const { data: profile } = await supabase
    .from("users")
    .select("id, first_name, last_name, email, phone, address, city, country, role")
    .eq("id", user.id)
    .single();

  if (!profile) return { id: user.id, email: user.email, role: null };
  return profile;
}

export async function requireAuth(currentPath = "") {
  const user = await getServerUser();
  if (!user) redirect(currentPath ? `/login?from=${encodeURIComponent(currentPath)}` : "/login");
  return user;
}

export async function requireAdmin() {
  const user = await getServerUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/unauthorized");
  return user;
}
```

---

## 4. Server Actions — `app/actions/auth.js`

```js
"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function loginAction({ email, password }) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

export async function signupAction({ email, password, firstName, lastName, phone, address, city, country }) {
  if (!email || !password || !firstName || !lastName)
    throw new Error("All required fields must be filled.");
  if (password.length < 8)
    throw new Error("Password must be at least 8 characters.");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: { data: { first_name: firstName, last_name: lastName } },
  });
  if (error) throw new Error(error.message);

  if (data?.user?.id && data.session) {
    const { error: profileError } = await supabase.from("users").insert({
      id: data.user.id,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() ?? null,
      address: address?.trim() ?? null,
      city: city?.trim() ?? null,
      country: country?.trim() ?? null,
      role: "customer",
    });

    if (profileError) {
      // Roll back: delete the orphaned auth record so the email isn't locked.
      const admin = createAdminClient();
      await admin.auth.admin.deleteUser(data.user.id);
      throw new Error("Signup failed — please try again.");
    }
  }

  revalidatePath("/", "layout");
}

export async function logoutAction() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

export async function updateProfileAction(userId, data) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) throw new Error("Not authenticated.");
  if (user.id !== userId) throw new Error("Unauthorized.");

  // Strip role and email — neither can be changed via profile update.
  const { role: _role, email: _email, ...rawData } = data;

  const KEY_MAP = { firstName: "first_name", lastName: "last_name", county: "country" };
  const safeData = Object.fromEntries(
    Object.entries(rawData).map(([k, v]) => [KEY_MAP[k] ?? k, v]),
  );

  const { error } = await supabase.from("users").update(safeData).eq("id", userId);
  if (error) throw new Error(error.message);

  revalidatePath("/account");
}
```

---

## 5. Protected Layouts — the most commonly missed step

### Admin layout — `app/admin/layout.jsx`
```jsx
import { requireAdmin } from "@/lib/session";
import AdminShell from "@/components/Admin/Layout/AdminShell";

// MUST be async. MUST call requireAdmin() before rendering.
// This is your server-side enforcement — do not skip it.
export default async function AdminLayout({ children }) {
  await requireAdmin();
  return <AdminShell>{children}</AdminShell>;
}
```

### Any other role-protected layout
```jsx
import { requireAuth } from "@/lib/session";

export default async function DashboardLayout({ children }) {
  await requireAuth("/dashboard");
  return <>{children}</>;
}
```

> **Rule:** Every route group that should be protected needs `requireAuth()` or `requireAdmin()`
> called at the **layout** level, not just inside a client component wrapper.

---

## 6. Client Auth Context — `lib/auth-context.jsx`

For UI state only. Not a security layer.

```jsx
"use client";

import React, { createContext, useContext, useEffect, useRef, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { queryClient } from "@/lib/queryClient";
import { fetchAuthUser } from "@/lib/auth";

const AuthContext = createContext();

const IDLE_TIMEOUT_MS = 15 * 60 * 1000;
const IDLE_WARNING_MS = 13 * 60 * 1000;
const IDLE_EVENTS     = ["mousemove", "keydown", "click", "scroll", "touchstart"];

export function AuthProvider({ children }) {
  const query = useQuery({
    queryKey: ["auth-user"],
    queryFn: fetchAuthUser,
    staleTime: Infinity,
    retry: false,
  });

  const user            = query.data?.user ?? null;
  const role            = query.data?.role ?? null;
  const isLoading       = query.isPending;
  const isAuthenticated = !!user;
  const isAdmin         = role === "admin";
  const isCustomer      = role === "customer";

  // Admin idle timeout
  const idleTimerRef    = useRef(null);
  const warningTimerRef = useRef(null);
  const warningToastRef = useRef(null);

  const clearTimers = useCallback(() => {
    clearTimeout(idleTimerRef.current);
    clearTimeout(warningTimerRef.current);
    toast.dismiss(warningToastRef.current);
  }, []);

  const forceLogout = useCallback(async (reason = "idle") => {
    clearTimers();
    const supabase = createClient();
    await supabase.auth.signOut();
    queryClient.invalidateQueries({ queryKey: ["auth-user"] });
    if (reason === "idle")  toast.warning("Logged out due to inactivity.");
    if (reason === "token") toast.error("Session expired. Please sign in again.");
  }, [clearTimers]);

  const resetIdleTimer = useCallback(() => {
    clearTimers();
    warningTimerRef.current = setTimeout(() => {
      warningToastRef.current = toast.warning(
        "You will be logged out in 2 minutes due to inactivity.",
        { duration: 120_000, id: "idle-warning" },
      );
    }, IDLE_WARNING_MS);
    idleTimerRef.current = setTimeout(() => forceLogout("idle"), IDLE_TIMEOUT_MS);
  }, [clearTimers, forceLogout]);

  useEffect(() => {
    if (!isAdmin) { clearTimers(); return; }
    IDLE_EVENTS.forEach(e => window.addEventListener(e, resetIdleTimer, { passive: true }));
    resetIdleTimer();
    return () => {
      IDLE_EVENTS.forEach(e => window.removeEventListener(e, resetIdleTimer));
      clearTimers();
    };
  }, [isAdmin, resetIdleTimer, clearTimers]);

  useEffect(() => {
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "INITIAL_SESSION") return;
      if (event === "TOKEN_REFRESHED" && !session) { forceLogout("token"); return; }
      queryClient.invalidateQueries({ queryKey: ["auth-user"] });
    });
    return () => subscription.unsubscribe();
  }, [forceLogout]);

  const value = useMemo(
    () => ({ user, role, isLoading, isAuthenticated, isAdmin, isCustomer }),
    [user, role, isLoading, isAuthenticated, isAdmin, isCustomer],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
```

---

## 7. Client Auth Query — `lib/auth.js`

```js
import { createClient } from "@/lib/supabase/client";

export async function fetchAuthUser() {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("id, first_name, last_name, email, phone, address, city, country, role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) return { user: { id: user.id, email: user.email }, role: null };
  return { user: profile, role: profile.role ?? null };
}
```

---

## 8. ProtectedRoute Client Component

For **UX only** — shows a spinner, redirects client-side. Never rely on this as your only auth check.

```jsx
"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function ProtectedRoute({ children, requireAdmin = false, requireAuth = true }) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const router   = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;
    if ((requireAuth || requireAdmin) && !isAuthenticated) {
      router.replace(`/login?from=${encodeURIComponent(pathname)}`);
      return;
    }
    if (requireAdmin && !isAdmin) router.replace("/unauthorized");
  }, [isLoading, isAuthenticated, isAdmin, requireAuth, requireAdmin, router, pathname]);

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
    </div>
  );

  if ((requireAuth || requireAdmin) && !isAuthenticated) return null;
  if (requireAdmin && !isAdmin) return null;

  return children;
}
```

---

## 9. Environment Variables

```bash
# .env.local

NEXT_PUBLIC_SUPABASE_URL=https://<project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>          # safe to expose to browser
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>       # NEVER expose to browser
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

---

## 10. Security Checklist

Before shipping, verify every item:

- [ ] `proxy.js` (middleware) uses `getUser()` not `getSession()`
- [ ] Every protected **server layout** calls `requireAuth()` or `requireAdmin()` — not just a client wrapper
- [ ] Every protected **Server Action** calls `supabase.auth.getUser()` before doing any work
- [ ] Role is read from the `users` table on every server request — not from JWT claims
- [ ] `signupAction` rolls back with `admin.auth.admin.deleteUser()` if profile insert fails
- [ ] `updateProfileAction` strips `role` and `email` from the update payload
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is not prefixed with `NEXT_PUBLIC_`
- [ ] Auth tokens are in HttpOnly cookies, not `localStorage`
- [ ] Supabase RLS policies are set on the `users` table (users can only read/write their own row)
- [ ] Admin idle timeout is enabled for the admin role

---

## Common Mistakes & Why They're Dangerous

| Mistake | Risk |
|---|---|
| `getSession()` in middleware/server code | Tampered cookies pass validation — auth bypass |
| Role check only in `ProtectedRoute` (client) | Server renders admin content before client redirects |
| Storing JWT in `localStorage` | XSS attack reads the token and impersonates the user |
| Trusting `role` from JWT claim | Changing role in DB has no effect until token refresh |
| No signup rollback | Email is permanently locked if profile insert fails |
| `email` editable via profile action | `users` table email diverges from Supabase Auth email |
| `NEXT_PUBLIC_SERVICE_ROLE_KEY` | Service key exposed to the browser — full DB access |
| Module-level server client | Shares cookies across requests — session leakage |
