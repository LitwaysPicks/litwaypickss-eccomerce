import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/session";

/**
 * Route Handler auth guard for admin-only endpoints.
 * Returns { user, response: null } on success, or { user: null, response: <403/401> }
 * on failure — caller should `if (response) return response;`.
 *
 * Uses getServerUser() which validates the JWT and reads role from the
 * users table (never trusts the JWT claim alone).
 */
export async function requireAdminApi() {
  const user = await getServerUser();
  if (!user) {
    return {
      user: null,
      response: NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 },
      ),
    };
  }
  if (user.role !== "admin") {
    return {
      user: null,
      response: NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 },
      ),
    };
  }
  return { user, response: null };
}

/**
 * Route Handler auth guard for any-authenticated-user endpoints.
 * Same shape as requireAdminApi.
 */
export async function requireUserApi() {
  const user = await getServerUser();
  if (!user) {
    return {
      user: null,
      response: NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 },
      ),
    };
  }
  return { user, response: null };
}
