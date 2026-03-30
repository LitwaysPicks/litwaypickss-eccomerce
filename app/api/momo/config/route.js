import { NextResponse } from "next/server";

/**
 * GET /api/momo/config
 * Returns configuration status (no secrets exposed).
 */
export function GET() {
  const env = process.env.MOMO_ENVIRONMENT || "mtnliberia";
  const baseUrl =
    process.env.MOMO_BASE_URL ||
    (env === "sandbox"
      ? "https://sandbox.momodeveloper.mtn.com"
      : "https://proxy.momoapi.mtn.com");

  return NextResponse.json({
    configured: !!(
      process.env.MOMO_API_USER_ID &&
      process.env.MOMO_API_KEY &&
      process.env.MOMO_SUBSCRIPTION_KEY
    ),
    environment: env,
    baseUrl,
    callbackUrl:
      process.env.MOMO_CALLBACK_URL ||
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/momo/callback`,
    supportedCurrency: "USD",
    hasUserId: !!process.env.MOMO_API_USER_ID,
    hasApiKey: !!process.env.MOMO_API_KEY,
    hasSubscriptionKey: !!process.env.MOMO_SUBSCRIPTION_KEY,
  });
}
