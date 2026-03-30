// MoMo API helpers — all calls go to the Next.js API routes (same origin, no CORS)

const DEFAULT_TIMEOUT_MS = 30_000;

async function apiCall(endpoint, options = {}, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(endpoint, {
      headers: { "Content-Type": "application/json", ...options.headers },
      signal: controller.signal,
      ...options,
    });
    clearTimeout(timeoutId);

    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      return await response.json();
    }
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      throw new Error(`Request timed out after ${timeoutMs / 1000}s`);
    }
    throw error;
  }
}

export const momoAPI = {
  initiatePayment: (paymentData) =>
    apiCall("/api/momo/pay", { method: "POST", body: JSON.stringify(paymentData) }),
  checkStatus: (referenceId) =>
    apiCall(`/api/momo/status/${referenceId}`, {}, 10_000),
  checkConfig: () => apiCall("/api/momo/config"),
};

export default momoAPI;
