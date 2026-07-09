import Link from 'next/link';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import ProductCatalog from '@/components/products/ProductCatalog';
import CatalogSkeleton from '@/components/products/CatalogSkeleton';
import CategoryContent from '@/components/products/CategoryContent';
import { API_BASE, fetchJson } from '@/lib/api';

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
  const { section, category: slug } = await params;
  const category = await getCategory(slug).catch(() => null);

  if (!category) return { title: 'Not Found' };

  return {
    title: category.meta_title || `${category.name} ${category.section_name || ''}`.trim(),
    description: category.meta_description || category.description || `Explore our premium ${category.name} collection from Goodwill Printers.`,
    keywords: category.meta_keywords || `${category.name}, ${category.section_name}, Goodwill Printers, premium stationery`,
    alternates: { canonical: `/${section}/${slug}` },
  };
}

export default async function CategoryPage({ params }) {
  const { category: slug } = await params;
  const category = await getCategory(slug);

  if (!category) {
    notFound();
  }

  return (
    <>
      <section className="hero" style={{ minHeight: '32vh', maxHeight: '360px', backgroundImage: category.image_url ? `linear-gradient(rgba(10, 22, 40, 0.7), rgba(10, 22, 40, 0.9)), url(${category.image_url})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="container">
          <h1>{category.name}</h1>
          <p>{category.description}</p>
        </div>
      </section>

      {/* Breadcrumbs */}
      <div className="container" style={{ padding: '1.5rem 1.5rem 0' }}>
        <nav className="breadcrumbs" aria-label="breadcrumb">
          <ol>
            <li><Link href="/">Home</Link></li>
            <li><span className="separator">/</span><Link href={`/${category.section_slug}`}>{category.section_name}</Link></li>
            <li><span className="separator">/</span><span className="current">{category.name}</span></li>
          </ol>
        </nav>
      </div>

      {/* Products first — what the visitor came for */}
      <section className="section-padding" style={{ paddingTop: '1.75rem' }}>
        <div className="container">
          <Suspense fallback={<CatalogSkeleton />}>
            <ProductCatalog lockedSection={category.section_slug} lockedCategory={category.slug} basePath={`/${category.section_slug}/${category.slug}`} />
          </Suspense>
        </div>
      </section>

      {/* About this category — details below the products */}
      <CategoryContent category={category} />
    </>
  );
}
