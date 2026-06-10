// Central API base URL. Override via NEXT_PUBLIC_API_URL (see .env.example).
// Defaults to the hosted backend so production builds work without extra config;
// local dev points it at localhost:5001 via .env.local.
export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || 'https://goodwillprinters.onrender.com';

// Public WhatsApp number (digits only, with country code) for enquiry buttons.
export const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919810000000';

export const apiUrl = (path) => `${API_BASE}${path}`;
