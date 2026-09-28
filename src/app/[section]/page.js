import { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { API_BASE, fetchJson } from '@/lib/api';
import { getSiteAssets, assetSlot } from '@/lib/assets';
import { getSectionCatalog, itemNoun, metaTitle, initialListing } from '@/lib/catalog';
import ProductCatalog from '@/components/products/ProductCatalog';
import CatalogSkeleton from '@/components/products/CatalogSkeleton';
import CategoryShowcase from '@/components/products/CategoryShowcase';
import styles from './section.module.css';

// Fetch section data (retries transient backend failures; null on 404)
async function getSection(slug) {
  return fetchJson(`/api/sections/${slug}`);
}

// Pre-render every section at build time (falls back to on-demand if the API is down)
export async function generateStaticParams() {
  try {
    const res = await fetch(`${API_BASE}/api/sections`);
    if (!res.ok) return [];
    const sections = await res.json();
    return (Array.isArray(sections) ? sections : []).map((s) => ({ section: s.slug }));
  } catch {
    return [];
  }
}

// Generate metadata
export async function generateMetadata({ params }) {
  const { section: slug } = await params;
  const section = await getSection(slug).catch(() => null);

  if (!section) return { title: 'Not Found' };

  return {
    title: metaTitle(section.meta_title, section.name),
    description: section.meta_description || section.description || `Explore our premium collection of ${section.name} from Goodwill Printers.`,
    keywords: section.meta_keywords || `${section.name}, Goodwill Printers, premium stationery`,
    alternates: { canonical: `/${slug}` },
  };
}

export default async function SectionPage({ params }) {
  const { section: slug } = await params;
  const [section, assets, catalog] = await Promise.all([getSection(slug), getSiteAssets(), getSectionCatalog(slug)]);

  if (!section) {
    notFound();
  }

  const headerImage = assetSlot(assets, 'section_headers', slug)?.url || null;
  const unit = itemNoun(slug);
  const categories = catalog?.categories || [];
  const sizes = [...new Set(categories.map((c) => c.size_label).filter(Boolean))].sort();
  const types = [...new Set(categories.map((c) => c.type_label).filter(Boolean))];
  // First page of designs, rendered in the server HTML (ProductCatalog takes over on load)
  const initial = initialListing(catalog);
  const hasSidebar = categories.length > 1 || sizes.length > 1 || types.length > 1;

  // Category / size / format facets for the catalog sidebar, so it only offers
  // combinations that actually have products.
  const facets = categories.length
    ? {
        categories: categories.map((c) => ({
          slug: c.slug,
          name: c.name,
          size_label: c.size_label,
          type_label: c.type_label,
          count: c.product_count,
        })),
      }
    : null;

  return (
    <>
      {headerImage && (
        <div className={styles.headerBanner}>
          <div className={styles.headerBannerBg} style={{ backgroundImage: `url(${headerImage})` }} aria-hidden="true" />
          <img src={headerImage} alt="" className={styles.headerBannerImg} />
        </div>
      )}

      {/* Intro */}
      <section className={`${styles.intro} ${headerImage ? '' : styles.introHero}`}>
        <div className="container">
          <nav className="breadcrumbs" aria-label="breadcrumb">
            <ol>
              <li><Link href="/">Home</Link></li>
              <li><span className="separator">/</span><span className="current">{section.name}</span></li>
            </ol>
          </nav>

          <div className={styles.introGrid}>
            <div>
              <h1 className={styles.title}>{section.name}</h1>
              {section.description && <p className={styles.lead}>{section.description}</p>}
            </div>

            {catalog?.total > 0 && (
              <dl className={styles.stats}>
                <div>
                  <dt>{catalog.total}</dt>
                  <dd>{unit}</dd>
                </div>
                <div>
                  <dt>{categories.length}</dt>
                  <dd>{categories.length === 1 ? 'category' : 'categories'}</dd>
                </div>
                {sizes.length > 0 && (
                  <div>
                    <dt>{sizes.join(' · ')}</dt>
                    <dd>{sizes.length === 1 ? 'size' : 'sizes'}</dd>
                  </div>
                )}
              </dl>
            )}
          </div>
        </div>
      </section>

      {/* Every category, with what's inside it */}
      {categories.length > 1 && (
        <section className={styles.categories}>
          <div className="container">
            <div className={styles.head}>
              <h2>Shop by category</h2>
              <p>Open a category to see every design in it — or browse all {catalog.total} {unit} below.</p>
            </div>
            <CategoryShowcase sectionSlug={slug} categories={categories} unit={unit} />
          </div>
        </section>
      )}

      {/* Full, filterable collection for this section */}
      <section className={`section-padding ${styles.collection}`} id="catalog">
        <div className="container">
          <div className={styles.head}>
            <h2>All {section.name}</h2>
          </div>
          <Suspense fallback={<CatalogSkeleton initial={initial} unit={unit} eyebrow="category" sidebar={hasSidebar} />}>
            <ProductCatalog lockedSection={slug} basePath={`/${slug}`} facets={facets} initial={initial} unit={unit} />
          </Suspense>
        </div>
      </section>
    </>
  );
}
