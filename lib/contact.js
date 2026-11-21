// Single source of truth for the public contact details shown across the site.
export const CONTACT_PHONE_DISPLAY = "+231-888-464-940";
export const CONTACT_PHONE_E164 = "+231888464940";
export const CONTACT_EMAIL = "support@litwaypicks.com";

export const CONTACT_PHONE_HREF = `tel:${CONTACT_PHONE_E164}`;
export const CONTACT_WHATSAPP_HREF = `https://wa.me/${CONTACT_PHONE_E164.replace("+", "")}`;
export const CONTACT_EMAIL_HREF = `mailto:${CONTACT_EMAIL}`;
