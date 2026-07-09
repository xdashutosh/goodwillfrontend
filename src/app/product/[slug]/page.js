import Link from 'next/link';
import { notFound } from 'next/navigation';
import ProductGallery from '@/components/products/ProductGallery';
import ProductContent from '@/components/products/ProductContent';
import { API_BASE, WHATSAPP_NUMBER, SITE_URL, fetchJson, normalizeWhatsApp } from '@/lib/api';
import styles from './product.module.css';

// Fetch product data (retries transient backend failures; null on 404)
async function getProduct(slug) {
  return fetchJson(`/api/products/${slug}`);
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
    notFound(); // serve a real 404 (matches section/category pages) instead of a soft 200
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

  // Use the admin-configured WhatsApp number (Settings), falling back to the default.
  const settings = await fetchJson('/api/settings').catch(() => null);
  const waNumber = normalizeWhatsApp(settings?.whatsapp_number) || WHATSAPP_NUMBER;
  const productUrl = `${SITE_URL}/product/${product.slug}`;
  const whatsappHref = `https://wa.me/${waNumber}?text=${encodeURIComponent(
    `Hi, I'm interested in "${product.name}" (${product.category_name}).\n\n${productUrl}\n\nCould you please share more details?`
  )}`;

  // A few key facts for the buy box — pulled from the spec table with meta fallbacks.
  const specs = Array.isArray(product.content?.specifications) ? product.content.specifications : [];
  const specVal = (label) => specs.find((s) => s?.label?.toLowerCase() === label.toLowerCase())?.value;
  const keyFacts = [
    { label: 'Size', value: product.category_size_label || specVal('Size') },
    { label: 'Format', value: product.category_type_label || specVal('Format') },
    { label: 'Pages', value: specVal('Pages') },
    { label: 'Material', value: specVal('Cover Material') },
    { label: 'Closure', value: specVal('Closure') },
  ].filter((f) => f.value).slice(0, 4);

  return (
    <>
      {/* Inject JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
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

            {/* Product Info — concise buy box */}
            <div className={`glass-card ${styles.productInfoWrap}`}>
              <div className={styles.productCategory}>{product.category_name}</div>
              <h1 className={styles.productTitle}>{product.name}</h1>

              {product.short_description && (
                <p className={styles.lead}>{product.short_description}</p>
              )}

              {keyFacts.length > 0 && (
                <ul className={styles.keyFacts}>
                  {keyFacts.map((f) => (
                    <li key={f.label}>
                      <span className={styles.factLabel}>{f.label}</span>
                      <span className={styles.factValue}>{f.value}</span>
                    </li>
                  ))}
                </ul>
              )}

              {product.available_sizes && product.available_sizes.length > 0 && (
                <div className={styles.availableSizes}>
                  <h3>Available sizes for this design</h3>
                  <div className={styles.sizeBadges}>
                    {product.available_sizes.map((size, index) => (
                      <span key={index} className={styles.sizeBadge}>{size}</span>
                    ))}
                  </div>
                </div>
              )}

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

      {/* Full product details — overview, highlights, specifications */}
      <ProductContent product={product} />

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
