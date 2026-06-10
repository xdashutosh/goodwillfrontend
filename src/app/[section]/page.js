import Link from 'next/link';
import { notFound } from 'next/navigation';
import { API_BASE } from '@/lib/api';
import styles from './section.module.css';

// Fetch section data
async function getSection(slug) {
  const res = await fetch(`${API_BASE}/api/sections/${slug}`, { next: { revalidate: 60 } });
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error('Failed to fetch section');
  }
  return res.json();
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

  return (
    <>
      <section className="hero" style={{ minHeight: '40vh', backgroundImage: section.image_url ? `linear-gradient(rgba(10, 22, 40, 0.7), rgba(10, 22, 40, 0.9)), url(${section.image_url})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="container">
          <h1>{section.name}</h1>
          <p>{section.description}</p>
        </div>
      </section>

      {/* Breadcrumbs */}
      <div className="container" style={{ padding: '2rem 1.5rem 0' }}>
        <nav className="breadcrumbs" aria-label="breadcrumb">
          <ol>
            <li><Link href="/">Home</Link></li>
            <li><span className="separator">/</span><span className="current">{section.name}</span></li>
          </ol>
        </nav>
      </div>

      <section className="section-padding">
        <div className="container">
          <div className="text-center" style={{ marginBottom: '3rem' }}>
            <h2>Categories in {section.name}</h2>
          </div>

          <div className="grid-3">
            {section.categories && section.categories.length > 0 ? (
              section.categories.map((cat) => (
                <Link href={`/products?section=${section.slug}&category=${cat.slug}`} key={cat.id} className={`glass-card ${styles.categoryCard}`}>
                  <div className="card-content">
                    <h3>{cat.name}</h3>
                    {cat.size_label && <span className="badge">{cat.size_label}</span>}
                    {cat.type_label && <span className="badge" style={{ marginLeft: '0.5rem' }}>{cat.type_label}</span>}
                    <p style={{ marginTop: '1rem', color: 'var(--text-gray)' }}>{cat.description || `Explore all ${cat.name}`}</p>
                  </div>
                </Link>
              ))
            ) : (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-gray)' }}>
                <p>No categories found in this section.</p>
              </div>
            )}
          </div>

          <div className="text-center" style={{ marginTop: '4rem' }}>
            <Link href={`/products?section=${section.slug}`} className="btn-primary">
              View All {section.name} Products
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
