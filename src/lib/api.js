// Central API base URL. Override via NEXT_PUBLIC_API_URL (see .env.example).
// Defaults to the hosted backend so production builds work without extra config;
// local dev points it at localhost:5001 via .env.local.
export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || 'https://goodwillprinters.onrender.com';

// Public WhatsApp number (digits only, with country code) for enquiry buttons.
export const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919810350320';

// Make a number wa.me-ready: digits only, with country code. A bare 10-digit
// number is assumed to be Indian (+91). Returns '' for empty input.
export function normalizeWhatsApp(num) {
  const digits = String(num || '').replace(/[^0-9]/g, '');
  if (!digits) return '';
  return digits.length === 10 ? `91${digits}` : digits;
}

// Phone number with its country code, for display and for tel: links:
// "9810350320" → { display: '+91 98103 50320', href: 'tel:+919810350320' }.
// A bare 10-digit number (or one with a leading 0) is assumed Indian (+91);
// numbers entered with a country code are kept as they are.
export function formatPhone(num) {
  const raw = String(num || '').trim();
  let digits = raw.replace(/[^0-9]/g, '');
  if (!digits) return { display: '', href: '' };
  if (!raw.startsWith('+')) {
    if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
    if (digits.length === 10) digits = `91${digits}`;
  }
  const display = digits.length === 12 && digits.startsWith('91')
    ? `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`
    : raw.startsWith('+') ? raw.replace(/\s+/g, ' ') : `+${digits}`;
  return { display, href: `tel:+${digits}` };
}

// Email address shown on the site. Clicking it still opens the Contact Email from
// Settings (the inbox that actually receives mail); override the shown address
// with the "Displayed Email" setting in the Admin Panel.
export const DEFAULT_DISPLAY_EMAIL = 'contact@planaday.com';

// Public URL of the storefront (used for canonical links and share/WhatsApp links).
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://www.plan-a-day.com'
).replace(/\/$/, '');

export const apiUrl = (path) => `${API_BASE}${path}`;

/**
 * Resilient JSON GET for server components.
 *
 * The backend (free-tier host) can cold-start or briefly return 5xx, and local
 * dev may momentarily be unreachable. A single failed fetch used to throw and
 * crash the whole page render. This retries transient failures (network errors
 * and 5xx) with exponential backoff so a brief hiccup recovers on its own.
 *
 * Returns parsed JSON on success, `null` on a genuine 404, and only throws once
 * all retries are exhausted (a real, sustained outage).
 */
export async function fetchJson(path, { revalidate = 60, retries = 4 } = {}) {
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(`${API_BASE}${path}`, { next: { revalidate } });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error(`Upstream ${res.status} for ${path}`);
      return await res.json();
    } catch (err) {
      lastErr = err;
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, Math.min(800 * 2 ** attempt, 6000)));
      }
    }
  }
  throw lastErr;
}
