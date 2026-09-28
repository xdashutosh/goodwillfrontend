import { fetchJson } from './api';

/**
 * Catalog helpers shared by the section, category and product pages.
 *
 * A "section catalog" is the full browse tree for one section:
 *   { section, total, categories: [{ id, name, slug, description, size_label,
 *     type_label, image_url, product_count, products: [{ id, name, slug,
 *     cover_style, is_featured, thumbnail_url, image_url }] }] }
 * Categories with no active products are left out.
 */

// Primary thumbnail for a product row from any endpoint: slim catalog rows carry
// thumbnail_url directly, full product rows carry an images[] array.
export function productThumb(p) {
  if (!p) return null;
  if (p.thumbnail_url || p.image_url) return p.thumbnail_url || p.image_url;
  const imgs = Array.isArray(p.images) ? p.images : [];
  const img = imgs.find((i) => i.is_primary) || imgs[0];
  return img ? img.thumbnail_url || img.image_url : null;
}

// Loose key for "the same cover design" across formats: "Dove" (A5 Daily) and
// "Dove" (A4 Weekly) match; model suffixes like "(GP-46)" or "-02" are ignored.
export function designKey(name) {
  return String(name || '')
    .toLowerCase()
    .replace(/\(.*?\)/g, ' ')
    .replace(/-\d+\b/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

// Same order as the API's "Recommended" sort: sort_order, then name (case-insensitive), then id.
export const bySortThenName = (a, b) =>
  (a.sort_order || 0) - (b.sort_order || 0) ||
  String(a.name).localeCompare(String(b.name), undefined, { sensitivity: 'base' }) ||
  a.id - b.id;

// Older backends don't have /api/sections/:slug/catalog yet — rebuild the same
// shape from the section (for its categories) plus the paginated product list.
async function buildCatalogFallback(slug) {
  const section = await fetchJson(`/api/sections/${encodeURIComponent(slug)}`);
  if (!section) return null;

  // "newest" pages cleanly on older backends (their name sorts have no tiebreaker);
  // the rows are re-sorted below anyway.
  const listPath = (page) => `/api/products?section=${encodeURIComponent(slug)}&limit=60&sort=newest&page=${page}`;
  const first = await fetchJson(listPath(1));
  const totalPages = Math.min(first?.pagination?.totalPages || 1, 20);
  const rest = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, i) => fetchJson(listPath(i + 2)).catch(() => null))
  );

  const seen = new Set();
  const products = [first, ...rest]
    .flatMap((r) => r?.products || [])
    .filter((p) => !seen.has(p.id) && seen.add(p.id));

  const categories = (section.categories || [])
    .map((c) => {
      const items = products
        .filter((p) => p.category_id === c.id)
        .sort(bySortThenName)
        .map((p) => {
          const img = (p.images || []).find((i) => i.is_primary) || (p.images || [])[0];
          return {
            id: p.id,
            name: p.name,
            slug: p.slug,
            cover_style: p.cover_style,
            is_featured: p.is_featured,
            sort_order: p.sort_order || 0,
            thumbnail_url: img?.thumbnail_url || null,
            image_url: img?.image_url || null,
          };
        });
      return {
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        size_label: c.size_label,
        type_label: c.type_label,
        image_url: c.image_url,
        product_count: items.length,
        products: items,
        sort_order: c.sort_order || 0,
      };
    })
    .filter((c) => c.product_count > 0)
    .sort((a, b) => a.sort_order - b.sort_order || b.product_count - a.product_count || a.name.localeCompare(b.name))
    .map(({ sort_order, ...c }) => c);

  return {
    section: { id: section.id, name: section.name, slug: section.slug, description: section.description },
    total: categories.reduce((sum, c) => sum + c.product_count, 0),
    categories,
  };
}

/**
 * Browse tree for a section. Never throws — returns null if the section doesn't
 * exist or the API is unreachable, so callers can render without it.
 */
export async function getSectionCatalog(slug) {
  if (!slug) return null;
  try {
    const tree = await fetchJson(`/api/sections/${encodeURIComponent(slug)}/catalog`);
    if (tree && Array.isArray(tree.categories)) {
      // Normalise the order to the storefront's (case-insensitive) sort on every backend version.
      tree.categories.forEach((c) => c.products?.sort(bySortThenName));
      return tree;
    }
  } catch {
    // fall through to the fallback below
  }
  try {
    return await buildCatalogFallback(slug);
  } catch {
    return null;
  }
}

// "Diaries" → "Diary", "Organizers" → "Organizer", "Corporate Gifts" → "Corporate Gift".
export function singular(name) {
  const s = String(name || '');
  if (/ies$/i.test(s)) return s.replace(/ies$/i, 'y');
  if (/s$/i.test(s)) return s.replace(/s$/i, '');
  return s;
}

// Pull "GP-34" and "21.3 × 15.2 cm" out of a spec value like
// "GP-34 (SIZE : 21.3 CM X 15.2 CM)". Either part may be missing.
export function parseModel(value) {
  const v = String(value || '').trim();
  if (!v) return { model: '', dimensions: '' };
  const m = v.match(/^([^()]+?)\s*\(\s*size\s*:?\s*([^)]+)\)/i);
  if (!m) return { model: v, dimensions: '' };
  const dimensions = m[2]
    .replace(/\s*x\s*/gi, ' × ')
    .replace(/\bcms?\b/gi, 'cm')
    .replace(/\s+/g, ' ')
    .trim();
  return { model: m[1].trim(), dimensions };
}

// What to call the items in a section: cover designs for stationery, products for gifts.
export function itemNoun(sectionSlug) {
  return sectionSlug === 'corporate-gifts' ? 'products' : 'designs';
}

// Stored meta titles already end in "| Goodwill Printers"; use them as-is instead
// of letting the root layout's title template append the brand a second time.
export function metaTitle(title, fallback) {
  const t = String(title || '').trim();
  if (t && /goodwill printers/i.test(t)) return { absolute: t };
  return t || fallback;
}

// "A5 Daily" + "Diaries" → "A5 Daily Diary"; "Executive Organizer" + "Organizers" →
// "Executive Organizer" (not "… Organizer Organizer"); gift categories stay as they are.
export function categoryLabel(categoryName, sectionName) {
  const noun = singular(sectionName).toLowerCase();
  const name = String(categoryName || '');
  const words = name.toLowerCase().split(/[^a-z0-9]+/);
  // Only single-word nouns read naturally as a suffix ("Pen Holder & Vogue", not "… Corporate Gift").
  if (!noun || /\s/.test(noun) || words.includes(noun) || words.includes(`${noun}s`)) return name;
  return `${name} ${singular(sectionName)}`;
}

/**
 * First page of a section/category as the API would return it with the default
 * "Recommended" sort, built from the catalog tree — lets listing pages render real
 * products in their server HTML instead of a skeleton. Rows gain the category/section
 * names the product cards show.
 */
export function initialListing(catalog, { categorySlug = '', limit = 24 } = {}) {
  if (!catalog?.categories?.length) return null;
  const cats = categorySlug ? catalog.categories.filter((c) => c.slug === categorySlug) : catalog.categories;
  const all = cats
    .flatMap((c) =>
      (c.products || []).map((p) => ({
        ...p,
        category_name: c.name,
        category_slug: c.slug,
        section_name: c.section_name || catalog.section?.name,
        section_slug: c.section_slug || catalog.section?.slug,
      }))
    )
    .sort(bySortThenName);
  if (!all.length) return null;
  return {
    products: all.slice(0, limit),
    pagination: { total: all.length, page: 1, limit, totalPages: Math.ceil(all.length / limit) },
  };
}
