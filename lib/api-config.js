// API Configuration for different environments

const getAPIUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:5000";
  }
  return "https://your-service-name.onrender.com";
};

export const API_URL = getAPIUrl();

const DEFAULT_TIMEOUT_MS = 30_000;

export const apiCall = async (endpoint, options = {}, timeoutMs = DEFAULT_TIMEOUT_MS) => {
  const url = `${API_URL}${endpoint}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    signal: controller.signal,
  };

  try {
    const response = await fetch(url, { ...defaultOptions, ...options, signal: controller.signal });
    clearTimeout(timeoutId);

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
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
};

export const momoAPI = {
  initiatePayment: (paymentData) =>
    apiCall("/api/momo/pay", { method: "POST", body: JSON.stringify(paymentData) }),
  checkStatus: (referenceId) =>
    apiCall(`/api/momo/status/${referenceId}`, {}, 10_000),
  getBalance: () => apiCall("/api/momo/balance"),
  getTransactions: () => apiCall("/api/momo/transactions"),
  getOrder: (referenceId) => apiCall(`/api/momo/order/${referenceId}`),
  healthCheck: () => apiCall("/"),
  checkConfig: () => apiCall("/api/momo/config"),
  testCredentials: () => apiCall("/api/momo/test-credentials"),
};

export default API_URL;
