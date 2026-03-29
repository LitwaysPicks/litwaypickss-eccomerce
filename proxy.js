import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

/**
 * Next.js 16 Proxy (formerly Middleware).
 *
 * Two responsibilities:
 *
 * 1. TOKEN REFRESH — The Supabase SSR client reads the auth cookies on every
 *    request. If the access token is expiring it automatically exchanges the
 *    refresh token for a new pair and writes the updated cookies to the
 *    response BEFORE the page renders. This is the only place where cookie
 *    mutation on an outgoing response is safe.
 *
 *    IMPORTANT: we must return `supabaseResponse` (not a new NextResponse)
 *    so the refreshed cookies are forwarded. Do not create a separate
 *    NextResponse.next() — it would drop the Set-Cookie headers.
 *
 * 2. ROUTE PROTECTION — Coarse-grained redirect for unauthenticated visitors
 *    hitting protected paths. A second layer of auth checks lives inside
 *    each Server Action and Server Component (defense in depth), so this
 *    proxy only needs to handle the redirect UX, not be the sole gatekeeper.
 *
 *    Admin role verification is intentionally NOT done here because a DB
 *    call from the proxy on every request would not scale. The role check
 *    lives in lib/session.js → requireAdmin(), called from the admin
 *    Server Component / Server Action.
 *
 * Matcher excludes static assets, image optimisation routes, and metadata
 * files so the proxy only runs for real page/API requests.
 */

// Protected paths that require authentication
const AUTH_REQUIRED = ["/account"];
// Paths that require authentication AND admin role (coarse check)
const ADMIN_PATHS = ["/admin"];

export async function proxy(request) {
  // Must create a mutable response container so the cookie setter can
  // overwrite it with fresh Set-Cookie headers when tokens are refreshed.
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Write to request so downstream server code sees fresh cookies
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value, options),
          );
          // Rebuild the response with the updated request object, then
          // write the same cookies to the response so the browser receives them
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // getUser() validates the JWT against Supabase's auth server.
  // Never use getSession() here — it only reads the local cookie and can
  // return a stale/tampered session without server-side verification.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // ── Protect admin routes ──────────────────────────────────────────────────
  // Auth presence is checked here; role (admin) is enforced inside the page's
  // requireAdmin() server call to avoid a DB round-trip on every request.
  const isAdminPath = ADMIN_PATHS.some((p) => pathname.startsWith(p));
  if (isAdminPath && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  // ── Protect authenticated-only routes ────────────────────────────────────
  const isAuthRequired = AUTH_REQUIRED.some((p) => pathname.startsWith(p));
  if (isAuthRequired && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  // ── Redirect authenticated users away from /login ─────────────────────────
  if (user && pathname === "/login") {
    const from = request.nextUrl.searchParams.get("from");
    const url = request.nextUrl.clone();
    url.pathname = from && from.startsWith("/") ? from : "/";
    url.searchParams.delete("from");
    return NextResponse.redirect(url);
  }

  // Return the (possibly cookie-updated) response.
  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Run on all paths EXCEPT:
     * - _next/static  (static JS/CSS bundles)
     * - _next/image   (image optimisation)
     * - favicon.ico, sitemap.xml, robots.txt
     * - common image extensions
     */
    "/((?!_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
