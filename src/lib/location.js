// Office & factory location. The coordinates can be changed in the Admin Panel
// (Settings → "Map Location"); this is the fallback.
export const DEFAULT_MAP_COORDS = '28.723707,77.163445';
export const DEFAULT_ADDRESS = 'Goodwill Printers\n20, Rajasthani Udyog Nagar, G.T. Karnal Road, North West Delhi, Delhi - 110033';

const PLACE_NAME = 'Goodwill Printers';

// "28.723707, 77.163445" → { lat, lng } (null if it isn't a valid pair)
function parseCoords(value) {
  const m = String(value || '').match(/^\s*(-?\d{1,2}(?:\.\d+)?)\s*,\s*(-?\d{1,3}(?:\.\d+)?)\s*$/);
  if (!m) return null;
  const lat = Number(m[1]);
  const lng = Number(m[2]);
  return Math.abs(lat) <= 90 && Math.abs(lng) <= 180 ? { lat, lng } : null;
}

/**
 * Everything the map/directions UI needs, from the site settings:
 *   { lat, lng, name, address, embedUrl, viewUrl, links: { google, apple, waze }, geoUri }
 * Pure — usable from server and client components.
 */
export function officeLocation({ coords, address } = {}) {
  const { lat, lng } = parseCoords(coords) || parseCoords(DEFAULT_MAP_COORDS);
  const ll = `${lat},${lng}`;
  const name = PLACE_NAME;
  return {
    lat,
    lng,
    name,
    address: String(address || DEFAULT_ADDRESS).trim(),
    // Keyless Google Maps embed, pinned on the coordinates
    embedUrl: `https://www.google.com/maps?q=${ll}&z=16&hl=en&output=embed`,
    viewUrl: `https://www.google.com/maps?q=${ll}`,
    links: {
      google: `https://www.google.com/maps/dir/?api=1&destination=${ll}`,
      apple: `https://maps.apple.com/?daddr=${ll}&q=${encodeURIComponent(name)}`,
      waze: `https://waze.com/ul?ll=${ll}&navigate=yes`,
    },
    // Android: opens the "Open with" chooser (Google Maps, Waze, …)
    geoUri: `geo:${ll}?q=${ll}(${encodeURIComponent(name)})`,
  };
}
