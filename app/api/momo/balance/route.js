import { NextResponse } from "next/server";
import { getAccessToken, getAccountBalance } from "@/lib/momo/service";

/**
 * GET /api/momo/balance
 * Returns the MoMo collection account balance (admin use).
 */
export async function GET() {
  try {
    const accessToken = await getAccessToken();
    const balance = await getAccountBalance("USD", accessToken);
    return NextResponse.json({ success: true, balance });
  } catch (error) {
    console.error("Balance error:", error.message);
    return NextResponse.json(
      { success: false, message: "Failed to fetch balance", error: error.message },
      { status: 500 },
    );
  }
}
