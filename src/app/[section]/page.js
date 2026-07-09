import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { API_BASE, fetchJson } from '@/lib/api';
import ProductCatalog from '@/components/products/ProductCatalog';
import CatalogSkeleton from '@/components/products/CatalogSkeleton';
import SectionCategoryTags from '@/components/products/SectionCategoryTags';
import styles from './section.module.css';
import diaryHeader from '@/assets/header/diary.png';
import organizerHeader from '@/assets/header/organizer.png';
import corporateHeader from '@/assets/header/corporate.png';
import notebookHeader from '@/assets/header/notebook.png';

// Designed header banners shown full-width at the top of a section page,
// keyed by section slug. Sections without an entry fall back to the text hero.
const HEADER_IMAGES = {
  diaries: diaryHeader,
  organizers: organizerHeader,
  'corporate-gifts': corporateHeader,
  notebooks: notebookHeader,
};

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
    title: section.meta_title || section.name,
    description: section.meta_description || section.description || `Explore our premium collection of ${section.name} from Goodwill Printers.`,
    keywords: section.meta_keywords || `${section.name}, Goodwill Printers, premium stationery`,
    alternates: { canonical: `/${slug}` },
  };
}

export default async function SectionPage({ params }) {
  const { section: slug } = await params;
  const section = await getSection(slug);

  if (!section) {
    notFound();
  }

  const headerImage = HEADER_IMAGES[slug];

  return (
    <>
      {headerImage ? (
        <div className={styles.headerBanner}>
          <div className={styles.headerBannerBg} style={{ backgroundImage: `url(${headerImage.src})` }} aria-hidden="true" />
          <Image src={headerImage} alt={section.name} priority sizes="100vw" className={styles.headerBannerImg} />
        </div>
      ) : (
        <section className="hero" style={{ minHeight: '50vh', maxHeight: '560px', backgroundImage: section.image_url ? `linear-gradient(rgba(10, 22, 40, 0.7), rgba(10, 22, 40, 0.9)), url(${section.image_url})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }}>
          <div className="container">
            <h1>{section.name}</h1>
            <p>{section.description}</p>
          </div>
        </section>
      )}

      {/* Breadcrumbs */}
      <div className="container" style={{ padding: '1rem 1.5rem 0' }}>
        <nav className="breadcrumbs" aria-label="breadcrumb">
          <ol>
            <li><Link href="/">Home</Link></li>
            <li><span className="separator">/</span><span className="current">{section.name}</span></li>
          </ol>
        </nav>
      </div>

      <section className="section-padding" style={{ paddingTop: '1.25rem' }}>
        <div className="container">
          <div className="text-center" style={{ marginBottom: '0.85rem' }}>
            <h2>Categories in {section.name}</h2>
          </div>

          {/* Category tags in a single line at the top */}
          <Suspense fallback={null}>
            <SectionCategoryTags basePath={`/${section.slug}`} categories={section.categories || []} />
          </Suspense>

          {/* Full product collection (same as the Our Collection page), scoped to this section */}
          <Suspense fallback={<CatalogSkeleton />}>
            <ProductCatalog lockedSection={section.slug} basePath={`/${section.slug}`} />
          </Suspense>
        </div>
      </section>
    </>
  );
}
