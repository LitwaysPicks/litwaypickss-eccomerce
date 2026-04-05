/**
 * MTN MoMo API service
 * Handles token caching, request-to-pay, and transaction lookups.
 */
import { v4 as uuidv4 } from "uuid";

// Module-level token cache (persists across requests in a warm serverless instance)
let cachedToken = null;
let tokenExpiry = null;

function getMomoConfig() {
  return {
    baseUrl:
      process.env.MOMO_BASE_URL ||
      (process.env.MOMO_ENVIRONMENT === "sandbox"
        ? "https://sandbox.momodeveloper.mtn.com"
        : "https://proxy.momoapi.mtn.com"),
    subscriptionKey: process.env.MOMO_SUBSCRIPTION_KEY,
    apiUserId: process.env.MOMO_API_USER_ID,
    apiKey: process.env.MOMO_API_KEY,
    environment: process.env.MOMO_ENVIRONMENT || "mtnliberia",
    callbackUrl:
      process.env.MOMO_CALLBACK_URL ||
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/momo/callback`,
  };
}

/**
 * Get access token with caching (reused until ~5 min before expiry)
 */
export async function getAccessToken() {
  if (cachedToken && tokenExpiry && new Date() < tokenExpiry) {
    console.log("[MoMo] Using cached token");
    return cachedToken;
  }

  const { baseUrl, subscriptionKey, apiUserId, apiKey } = getMomoConfig();
  console.log("[MoMo] Fetching new token — baseUrl:", baseUrl, "apiUserId:", apiUserId, "hasKey:", !!apiKey, "hasSubKey:", !!subscriptionKey);
  const credentials = Buffer.from(`${apiUserId}:${apiKey}`).toString("base64");

  const response = await fetch(`${baseUrl}/collection/token/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Ocp-Apim-Subscription-Key": subscriptionKey,
      Authorization: `Basic ${credentials}`,
    },
    body: "{}",
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(`Failed to get access token: ${JSON.stringify(err)}`);
  }

  const data = await response.json();
  if (!data.access_token) throw new Error("No access_token in response");

  const expiresInMs = (data.expires_in || 3600) * 1000;
  tokenExpiry = new Date(Date.now() + expiresInMs - 300_000); // 5 min buffer
  cachedToken = `Bearer ${data.access_token}`;
  return cachedToken;
}

export function clearTokenCache() {
  cachedToken = null;
  tokenExpiry = null;
}

/**
 * Verify credentials by checking account balance
 */
export async function testAccountBalance(accessToken) {
  const { baseUrl, subscriptionKey, environment } = getMomoConfig();
  try {
    const response = await fetch(`${baseUrl}/collection/v1_0/account/balance`, {
      headers: {
        Authorization: accessToken,
        "X-Target-Environment": environment,
        "Ocp-Apim-Subscription-Key": subscriptionKey,
      },
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Fetch transaction details by reference ID
 */
export async function fetchTransactionDetails(referenceId, accessToken) {
  const { baseUrl, subscriptionKey, environment } = getMomoConfig();
  try {
    const response = await fetch(
      `${baseUrl}/collection/v1_0/requesttopay/${referenceId}`,
      {
        headers: {
          "X-Reference-Id": referenceId,
          "Content-Type": "application/json",
          "X-Target-Environment": environment,
          "Ocp-Apim-Subscription-Key": subscriptionKey,
          Authorization: accessToken,
        },
      },
    );
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * Get user info by MSISDN
 */
export async function getUserInfo(msisdn, accessToken) {
  const { baseUrl, subscriptionKey, environment } = getMomoConfig();
  try {
    const response = await fetch(
      `${baseUrl}/collection/v1_0/accountholder/MSISDN/${msisdn}/basicuserinfo`,
      {
        headers: {
          "Content-Type": "application/json",
          "X-Target-Environment": environment,
          "Ocp-Apim-Subscription-Key": subscriptionKey,
          Authorization: accessToken,
        },
      },
    );
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * Initiate a Request to Pay
 */
export async function requestToPay(details, accessToken) {
  const { baseUrl, subscriptionKey, environment } = getMomoConfig();
  const referenceId = uuidv4();

  const requestBody = {
    amount: parseFloat(details.amount).toFixed(2),
    currency: details.currency,
    externalId: details.process_id,
    payer: {
      partyIdType: "MSISDN",
      partyId: details.phone_no,
    },
    payerMessage: details.message || "Payment for Litway Picks Order",
    payeeNote: details.message || "Payment for Litway Picks Order",
  };

  const response = await fetch(`${baseUrl}/collection/v1_0/requesttopay`, {
    method: "POST",
    headers: {
      "X-Reference-Id": referenceId,
      "X-Target-Environment": environment,
      "Ocp-Apim-Subscription-Key": subscriptionKey,
      "Content-Type": "application/json",
      Authorization: accessToken,
    },
    body: JSON.stringify(requestBody),
  });

  console.log("[MoMo] requestToPay response status:", response.status, "refId:", referenceId);
  console.log("[MoMo] requestBody sent:", JSON.stringify(requestBody));

  if (response.status !== 202 && response.status !== 201 && response.status !== 200) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || "Unable to complete transaction");
  }

  const transaction = await fetchTransactionDetails(referenceId, accessToken);
  return { success: true, referenceId, transaction, status: response.status };
}

/**
 * Get account balance
 */
export async function getAccountBalance(currency = "USD", accessToken) {
  const { baseUrl, subscriptionKey, environment } = getMomoConfig();
  const response = await fetch(
    `${baseUrl}/collection/v1_0/account/balance/${currency}`,
    {
      headers: {
        Authorization: accessToken,
        "X-Target-Environment": environment,
        "Ocp-Apim-Subscription-Key": subscriptionKey,
      },
    },
  );
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(`Balance fetch failed: ${JSON.stringify(err)}`);
  }
  return await response.json();
}
