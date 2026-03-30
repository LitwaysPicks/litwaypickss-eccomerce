/**
 * Format phone number to Liberian MSISDN format (231 + 9 digits = 12 digits)
 * @param {string} phone
 * @returns {{ success: boolean, phone?: string, error?: string }}
 */
export function formatLiberianPhone(phone) {
  if (!phone) {
    return { success: false, error: "Phone number is required" };
  }

  let formatted = phone.replace(/\D/g, "").replace(/^\+/, "").replace(/^0+/, "");

  if (!formatted.startsWith("231")) {
    formatted = "231" + formatted;
  }

  if (formatted.length !== 12) {
    return {
      success: false,
      error: `Invalid Liberia MSISDN: ${formatted}. Must be 12 digits (231 + 9-digit number)`,
    };
  }

  return { success: true, phone: formatted };
}
