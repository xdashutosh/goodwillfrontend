import { Suspense } from 'react';
import ProductCatalog from '@/components/products/ProductCatalog';
import CatalogSkeleton from '@/components/products/CatalogSkeleton';
import { fetchJson } from '@/lib/api';
import { getSectionCatalog, initialListing } from '@/lib/catalog';

export const metadata = {
  title: 'Our Collection',
  description: 'Browse the full Goodwill Printers collection of premium diaries, notebooks, organizers, and corporate gifts.',
  alternates: { canonical: '/products' },
};

export default async function ProductsPage() {
  // Live section list for the Section filter (the catalog has a built-in fallback).
  const sections = await fetchJson('/api/sections').catch(() => null);
  const sectionList = Array.isArray(sections) ? sections : [];
  const sectionOptions = sectionList.length ? sectionList.map((s) => ({ slug: s.slug, name: s.name })) : null;

  // Every section's categories (with size/format labels) so the filters only offer
  // combinations that have products, plus the first page for the server HTML.
  const catalogs = (await Promise.all(sectionList.map((s) => getSectionCatalog(s.slug)))).filter(Boolean);
  const categories = catalogs.flatMap((c) =>
    c.categories.map((cat) => ({ ...cat, section_name: c.section.name, section_slug: c.section.slug }))
  );
  const facets = categories.length
    ? {
        categories: categories.map((c) => ({
          slug: c.slug,
          name: c.name,
          size_label: c.size_label,
          type_label: c.type_label,
          count: c.product_count,
          section_slug: c.section_slug,
        })),
      }
    : null;
  const initial = catalogs.length === sectionList.length ? initialListing({ categories }) : null;

  return (
    <>
      <section className="hero" style={{ minHeight: '30vh' }}>
        <div className="container">
          <h1>Our Collection</h1>
          <p>Discover our range of premium corporate stationery and gifts</p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container">
          <Suspense fallback={<CatalogSkeleton initial={initial} unit="products" eyebrow="full" />}>
            <ProductCatalog sections={sectionOptions} facets={facets} initial={initial} />
          </Suspense>
        </div>
      </section>
    </>
  );
}
