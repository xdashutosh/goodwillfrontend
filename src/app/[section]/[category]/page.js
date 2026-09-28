import Link from 'next/link';
import { Suspense } from 'react';
import { notFound, permanentRedirect } from 'next/navigation';
import ProductCatalog from '@/components/products/ProductCatalog';
import CatalogSkeleton from '@/components/products/CatalogSkeleton';
import CategoryContent from '@/components/products/CategoryContent';
import CategoryShowcase from '@/components/products/CategoryShowcase';
import { API_BASE, fetchJson } from '@/lib/api';
import { getSectionCatalog, itemNoun, metaTitle, initialListing } from '@/lib/catalog';
import styles from './category.module.css';

// Fetch category data (retries transient backend failures; null on 404)
async function getCategory(slug) {
  return fetchJson(`/api/categories/${slug}`);
}

// Pre-render every category at build time (falls back to on-demand if the API is down)
export async function generateStaticParams() {
  try {
    const res = await fetch(`${API_BASE}/api/categories`);
    if (!res.ok) return [];
    const cats = await res.json();
    return (Array.isArray(cats) ? cats : [])
      .filter((c) => c.section_slug && c.slug)
      .map((c) => ({ section: c.section_slug, category: c.slug }));
  } catch {
    return [];
  }
}

// Generate metadata
export async function generateMetadata({ params }) {
  const { category: slug } = await params;
  const category = await getCategory(slug).catch(() => null);

  if (!category) return { title: 'Not Found' };

  return {
    title: metaTitle(category.meta_title, `${category.name} ${category.section_name || ''}`.trim()),
    description: category.meta_description || category.description || `Explore our premium ${category.name} collection from Goodwill Printers.`,
    keywords: category.meta_keywords || `${category.name}, ${category.section_name}, Goodwill Printers, premium stationery`,
    // Always the category's real section, even if reached through a mismatched URL
    alternates: { canonical: `/${category.section_slug}/${slug}` },
  };
}

export default async function CategoryPage({ params }) {
  const { section, category: slug } = await params;
  const category = await getCategory(slug);

  if (!category) {
    notFound();
  }

  // Category slugs are unique site-wide, so /organizers/a5-daily would otherwise
  // render A5 Daily diaries — send it to the one real URL.
  if (category.section_slug && category.section_slug !== section) {
    permanentRedirect(`/${category.section_slug}/${slug}`);
  }

  const catalog = await getSectionCatalog(category.section_slug);
  const unit = itemNoun(category.section_slug);
  const siblings = catalog?.categories || [];
  const count = siblings.find((c) => c.slug === slug)?.product_count;
  const others = siblings.filter((c) => c.slug !== slug);
  // First page of designs, rendered in the server HTML (ProductCatalog takes over on load)
  const initial = initialListing(catalog, { categorySlug: slug });

  return (
    <>
      <section className={styles.intro}>
        <div className="container">
          <nav className="breadcrumbs" aria-label="breadcrumb">
            <ol>
              <li><Link href="/">Home</Link></li>
              <li><span className="separator">/</span><Link href={`/${category.section_slug}`}>{category.section_name}</Link></li>
              <li><span className="separator">/</span><span className="current">{category.name}</span></li>
            </ol>
          </nav>

          <div className={styles.introBody}>
            <h1 className={styles.title}>
              {category.name}
              {typeof count === 'number' && (
                <span className={styles.count}>{count} {count === 1 ? unit.replace(/s$/, '') : unit}</span>
              )}
            </h1>
            {category.description && <p className={styles.lead}>{category.description}</p>}
          </div>

          {/* Switch between the categories of this section */}
          {siblings.length > 1 && (
            <nav className={styles.switcher} aria-label={`${category.section_name} categories`}>
              <Link href={`/${category.section_slug}`} className={styles.switch}>
                All {category.section_name}
                <span className={styles.switchCount}>{catalog.total}</span>
              </Link>
              {siblings.map((c) => (
                <Link
                  key={c.slug}
                  href={`/${category.section_slug}/${c.slug}`}
                  className={`${styles.switch} ${c.slug === slug ? styles.switchOn : ''}`}
                  aria-current={c.slug === slug ? 'page' : undefined}
                >
                  {c.name}
                  <span className={styles.switchCount}>{c.product_count}</span>
                </Link>
              ))}
            </nav>
          )}
        </div>
      </section>

      {/* Products first — what the visitor came for */}
      <section className="section-padding" style={{ paddingTop: '2rem' }}>
        <div className="container">
          <Suspense fallback={<CatalogSkeleton initial={initial} unit={unit} eyebrow="none" sidebar={false} />}>
            <ProductCatalog
              lockedSection={category.section_slug}
              lockedCategory={category.slug}
              basePath={`/${category.section_slug}/${category.slug}`}
              initial={initial}
              unit={unit}
            />
          </Suspense>
        </div>
      </section>

      {/* About this category — details below the products */}
      <CategoryContent category={category} />

      {others.length > 0 && (
        <section className="section-padding">
          <div className="container">
            <div className={styles.head}>
              <h2>Other {category.section_name.toLowerCase()} categories</h2>
              <p>Every category shares the same care and customisation options — pick the one that suits you.</p>
            </div>
            <CategoryShowcase sectionSlug={category.section_slug} categories={others} unit={unit} />
          </div>
        </section>
      )}
    </>
  );
}
