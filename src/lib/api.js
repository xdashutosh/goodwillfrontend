// Central API base URL. Override via NEXT_PUBLIC_API_URL (see .env.example).
// Defaults to the hosted backend so production builds work without extra config;
// local dev points it at localhost:5001 via .env.local.
export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || 'https://goodwillprinters.onrender.com';

// Public WhatsApp number (digits only, with country code) for enquiry buttons.
export const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919810000000';

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
