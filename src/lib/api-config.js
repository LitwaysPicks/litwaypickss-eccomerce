// src/lib/api-config.js
// API Configuration for different environments

const getAPIUrl = () => {
  // For Vite (if using Vite)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // Development fallback
  if (import.meta.env.DEV) {
    return "http://localhost:5000";
  }

  // Production fallback - UPDATE THIS WITH YOUR RENDER URL
  return "https://your-service-name.onrender.com";
};

export const API_URL = getAPIUrl();

// API Helper functions
export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`;

  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, { ...defaultOptions, ...options });

    // Handle non-JSON responses
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    }

    return response;
  } catch (error) {
    console.error("API Call Error:", error);
    throw error;
  }
};

// Specific API endpoints
export const momoAPI = {
  // Initiate payment
  initiatePayment: (paymentData) =>
    apiCall("/api/momo/pay", {
      method: "POST",
      body: JSON.stringify(paymentData),
    }),

  // Check payment status
  checkStatus: (referenceId) => apiCall(`/api/momo/status/${referenceId}`),

  // Get account balance
  getBalance: () => apiCall("/api/momo/balance"),

  // Get all transactions
  getTransactions: () => apiCall("/api/momo/transactions"),

  // Get order by reference ID
  getOrder: (referenceId) => apiCall(`/api/momo/order/${referenceId}`),

  // Health check
  healthCheck: () => apiCall("/"),

  // Configuration check
  checkConfig: () => apiCall("/api/momo/config"),

  // Test credentials
  testCredentials: () => apiCall("/api/momo/test-credentials"),
};

export default API_URL;
