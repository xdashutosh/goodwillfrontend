import { API_BASE } from './api';

/**
 * Managed marketing assets (banners, showcase videos, section headers,
 * collection-card art, gifting images, backgrounds, brand logos) served from
 * S3 and editable in the Admin Panel → Assets.
 *
 * Returns a map { <collection>: [assetRow, ...] } (each list already sorted by
 * sort_order). Never throws — an unreachable API yields {} and every consumer
 * falls back to its bundled image, so the site always renders.
 */
export async function getSiteAssets({ revalidate = 45 } = {}) {
  try {
    const res = await fetch(`${API_BASE}/api/assets`, { next: { revalidate } });
    if (!res.ok) return {};
    const data = await res.json();
    return data && typeof data === 'object' ? data : {};
  } catch {
    return {};
  }
}

// All active assets in a collection (array, sort order preserved).
export const assetList = (assets, collection) =>
  Array.isArray(assets?.[collection]) ? assets[collection] : [];

// One keyed asset within a collection, or null.
export const assetSlot = (assets, collection, slot) =>
  assetList(assets, collection).find((a) => a.slot === slot) || null;

// The best displayable URL for an asset (main file), or a fallback.
export const assetUrl = (asset, fallback = null) => (asset && asset.url) || fallback;
