import Link from 'next/link';
import ProductGallery from '@/components/products/ProductGallery';
import { API_BASE, WHATSAPP_NUMBER } from '@/lib/api';
import styles from './product.module.css';

// Fetch product data
async function getProduct(slug) {
  const res = await fetch(`${API_BASE}/api/products/${slug}`, { next: { revalidate: 60 } });
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error('Failed to fetch product');
  }
  return res.json();
}

// Pre-render every product at build time (falls back to on-demand if the API is down)
export async function generateStaticParams() {
  try {
    const params = [];
    for (let page = 1; page <= 50; page++) {
      const res = await fetch(`${API_BASE}/api/products?limit=60&page=${page}`);
      if (!res.ok) break;
      const data = await res.json();
      (data.products || []).forEach((p) => params.push({ slug: p.slug }));
      const totalPages = data.pagination?.totalPages || 1;
      if (page >= totalPages) break;
    }
    return params;
  } catch {
    return [];
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProduct(slug).catch(() => null);

  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  return {
    title: product.meta_title || product.name,
    description: product.meta_description || product.short_description || `${product.name} — premium ${product.category_name} from Goodwill Printers. Request a quote.`,
    alternates: { canonical: `/product/${slug}` },
    keywords: product.meta_keywords || `${product.name}, ${product.category_name}, ${product.section_name}`,
    openGraph: {
      title: product.name,
      description: product.short_description,
      images: product.images?.length > 0 ? [{ url: product.images.find(i => i.is_primary)?.image_url || product.images[0].image_url }] : [],
    },
  };
}

export default async function ProductDetailPage({ params }) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return (
      <div className="container section-padding text-center">
        <h1>Product Not Found</h1>
        <p style={{ marginTop: '1rem', marginBottom: '2rem', color: 'var(--text-gray)' }}>The product you are looking for does not exist or has been removed.</p>
        <Link href="/products" className="btn-primary">Back to Catalog</Link>
      </div>
    );
  }

  // Generate JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images?.map(img => img.image_url) || [],
    description: product.description || product.short_description,
    brand: {
      '@type': 'Brand',
      name: 'Plan.A.Day by Goodwill Printers'
    },
  };

  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `Hi, I'm interested in "${product.name}" (${product.category_name}). Could you please share more details?`
  )}`;

  return (
    <>
      {/* Inject JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container" style={{ padding: '2rem 1.5rem 0' }}>
        {/* Breadcrumbs */}
        <nav className="breadcrumbs" aria-label="breadcrumb">
          <ol>
            <li><Link href="/">Home</Link></li>
            <li><span className="separator">/</span><Link href={`/${product.section_slug}`}>{product.section_name}</Link></li>
            <li><span className="separator">/</span><Link href={`/products?category=${product.category_slug}`}>{product.category_name}</Link></li>
            <li><span className="separator">/</span><span className="current">{product.name}</span></li>
          </ol>
        </nav>
      </div>

      <section className={styles.productDetailSection} style={{ paddingTop: '2rem' }}>
        <div className="container">
          <div className={styles.productGrid}>
            {/* Image Gallery */}
            <div>
              <ProductGallery images={product.images || []} productName={product.name} />
            </div>

            {/* Product Info */}
            <div className={`glass-card ${styles.productInfoWrap}`}>
              <div className={styles.productCategory}>{product.category_name}</div>
              <h1 className={styles.productTitle}>{product.name}</h1>

              <div className={styles.metaInfo}>
                {product.cover_style && (
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Cover Style:</span>
                    <span className={styles.metaValue}>{product.cover_style}</span>
                  </div>
                )}
                {product.category_size_label && (
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Size:</span>
                    <span className={styles.metaValue}>{product.category_size_label}</span>
                  </div>
                )}
                {product.category_type_label && (
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Type:</span>
                    <span className={styles.metaValue}>{product.category_type_label}</span>
                  </div>
                )}
              </div>

              {product.available_sizes && product.available_sizes.length > 0 && (
                <div className={styles.availableSizes}>
                  <h3>Available Sizes for this Design:</h3>
                  <div className={styles.sizeBadges}>
                    {product.available_sizes.map((size, index) => (
                      <span key={index} className={styles.sizeBadge}>{size}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className={styles.productDescription}>
                <h3>Description</h3>
                <p>{product.description || product.short_description || 'No description available for this product.'}</p>
              </div>

              <div className={styles.actionArea}>
                <Link href={`/contact?product=${product.id}`} className="btn-primary" style={{ width: '100%', textAlign: 'center' }}>
                  Enquire About This Product
                </Link>
                <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ width: '100%', textAlign: 'center' }}>
                  Enquire on WhatsApp
                </a>
                <p className={styles.enquiryNote}>Minimum order quantities apply. Contact us for bulk pricing and customization options.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {product.related && product.related.length > 0 && (
        <section className="section-padding" style={{ backgroundColor: 'var(--primary-navy)' }}>
          <div className="container">
            <h2 style={{ textAlign: 'center', marginBottom: '3rem' }}>Similar Products</h2>
            <div className="grid-4">
              {product.related.map(related => (
                <Link href={`/product/${related.slug}`} key={related.id} className={`glass-card ${styles.relatedCard}`}>
                  <div className={styles.relatedImgWrap}>
                    {related.images && related.images.length > 0 ? (
                      <img
                        src={related.images.find(img => img.is_primary)?.thumbnail_url || related.images[0].thumbnail_url}
                        alt={related.name}
                        loading="lazy"
                      />
                    ) : (
                      <div className={styles.noImg}>No Image</div>
                    )}
                  </div>
                  <div className={styles.relatedInfo}>
                    <span className={styles.relatedCat}>{related.category_name}</span>
                    <h4>{related.name}</h4>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
