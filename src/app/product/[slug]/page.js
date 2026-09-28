import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Check, ChevronLeft, ChevronRight, Palette, Package, Award } from 'lucide-react';
import ProductGallery from '@/components/products/ProductGallery';
import ProductContent from '@/components/products/ProductContent';
import ProductCard from '@/components/products/ProductCard';
import CategoryShowcase from '@/components/products/CategoryShowcase';
import DesignFinder from '@/components/products/DesignFinder';
import { Whatsapp } from '@/components/ui/SocialIcons';
import { API_BASE, WHATSAPP_NUMBER, SITE_URL, fetchJson, normalizeWhatsApp } from '@/lib/api';
import { getSectionCatalog, productThumb, designKey, parseModel, itemNoun, metaTitle, categoryLabel } from '@/lib/catalog';
import styles from './product.module.css';

const RELATED_COUNT = 8;
const COVER_STRIP = 6;

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
    title: metaTitle(product.meta_title, `${product.name} — ${categoryLabel(product.category_name, product.section_name)}`),
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

// `count` items centred on index `i`, wrapping at both ends (count 6 → 2 before, 3 after).
function around(list, i, count) {
  if (list.length <= count) return list;
  const start = i - Math.floor((count - 1) / 2);
  return Array.from({ length: count }, (_, k) => list[(((start + k) % list.length) + list.length) % list.length]);
}

export default async function ProductDetailPage({ params }) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  const [catalog, category, settings] = await Promise.all([
    getSectionCatalog(product.section_slug),
    fetchJson(`/api/categories/${product.category_slug}`).catch(() => null),
    // Use the admin-configured WhatsApp number (Settings), falling back to the default.
    fetchJson('/api/settings').catch(() => null),
  ]);

  const unit = itemNoun(product.section_slug);
  const sectionHref = `/${product.section_slug}`;
  const categoryHref = `/${product.section_slug}/${product.category_slug}`;
  const categories = catalog?.categories || [];
  const siblings = categories.find((c) => c.slug === product.category_slug)?.products || [];
  const index = siblings.findIndex((p) => p.slug === product.slug);

  // Previous / next design in this category (wrapping), for flicking through covers.
  // With only two designs both would be the same one, so show a single link.
  const prevDesign = siblings.length > 2 && index >= 0 ? siblings[(index - 1 + siblings.length) % siblings.length] : null;
  const nextDesign = siblings.length > 1 && index >= 0 ? siblings[(index + 1) % siblings.length] : null;
  const coverStrip = index >= 0 ? around(siblings, index, COVER_STRIP) : [];
  const moreCovers = siblings.length - coverStrip.length;

  // More designs from the same category — the ones that follow this one in list order.
  const moreInCategory = index >= 0
    ? [...siblings.slice(index + 1), ...siblings.slice(0, index)].slice(0, RELATED_COUNT)
    : siblings.filter((p) => p.slug !== product.slug).slice(0, RELATED_COUNT);

  // The same cover design made in other formats (e.g. Dove: A5 Daily ↔ A4 Weekly).
  const key = designKey(product.name);
  const otherFormats = key
    ? categories
        .filter((c) => c.slug !== product.category_slug)
        .map((c) => ({ category: c, match: (c.products || []).find((p) => designKey(p.name) === key) }))
        .filter((f) => f.match)
    : [];

  // Key facts for the buy box — pulled from the spec table with category fallbacks.
  const specs = Array.isArray(product.content?.specifications) ? product.content.specifications : [];
  const specVal = (label) => specs.find((s) => s?.label?.toLowerCase() === label.toLowerCase())?.value;
  const { model, dimensions } = parseModel(specVal('Model'));
  const sizeLabel = product.category_size_label || specVal('Size');
  // Placeholder spec values ("Product", "-", "N/A") tell the visitor nothing — skip them.
  const meaningful = (v) => typeof v === 'string' && v.trim() && !/^(product|n\/?a|-+|na|none)$/i.test(v.trim());
  const keyFacts = [
    { label: 'Size', value: [sizeLabel, dimensions].filter(Boolean).join(' · ') },
    { label: 'Format', value: specVal('Format') || product.category_type_label },
    { label: 'Pages', value: specVal('Pages') },
    { label: 'Paper', value: specVal('Paper Options') || specVal('Paper') },
    { label: 'Cover', value: specVal('Cover Material') },
    { label: 'Closure', value: specVal('Closure') },
  ].filter((f) => meaningful(f.value));
  const badge = categoryLabel(product.category_name, product.section_name);
  // Diary/notebook categories share inside pages; gift categories are just groups of products.
  const sharesInside = Boolean(product.category_type_label || product.category_size_label);

  const tagline = typeof product.short_description === 'string' ? product.short_description.trim() : '';
  const unique = typeof product.content?.unique === 'string' ? product.content.unique.trim() : '';

  const waNumber = normalizeWhatsApp(settings?.whatsapp_number) || WHATSAPP_NUMBER;
  const productUrl = `${SITE_URL}/product/${product.slug}`;
  const productLabel = `${product.name} — ${product.category_name}${model ? ` (${model})` : ''}`;
  const whatsappHref = `https://wa.me/${waNumber}?text=${encodeURIComponent(
    `Hi, I'm interested in "${productLabel}".\n\n${productUrl}\n\nCould you please share pricing and customisation options?`
  )}`;
  const enquireHref = `/contact?product=${product.id}&name=${encodeURIComponent(productLabel)}`;

  // Category FAQs (shared by every design in the category)
  const faqs = Array.isArray(category?.content?.faqs)
    ? category.content.faqs
        .filter((f) => f && typeof f === 'object' && typeof f.q === 'string' && typeof f.a === 'string')
    : [];

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      image: product.images?.map((img) => img.image_url) || [],
      description: product.description || product.short_description,
      category: `${product.section_name} > ${product.category_name}`,
      ...(model ? { model } : {}),
      brand: {
        '@type': 'Brand',
        name: 'Plan.A.Day by Goodwill Printers',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: product.section_name, item: `${SITE_URL}${sectionHref}` },
        { '@type': 'ListItem', position: 3, name: product.category_name, item: `${SITE_URL}${categoryHref}` },
        { '@type': 'ListItem', position: 4, name: product.name, item: productUrl },
      ],
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />

      <div className={`container ${styles.wide} ${styles.crumbs}`}>
        <nav className="breadcrumbs" aria-label="breadcrumb">
          <ol>
            <li><Link href="/">Home</Link></li>
            <li><span className="separator">/</span><Link href={sectionHref}>{product.section_name}</Link></li>
            <li><span className="separator">/</span><Link href={categoryHref}>{product.category_name}</Link></li>
            <li><span className="separator">/</span><span className="current">{product.name}</span></li>
          </ol>
        </nav>
      </div>

      <section className={styles.main}>
        <div className={`container ${styles.wide}`}>
          <div className={`${styles.layout} ${categories.length ? '' : styles.noFinder}`}>
            {categories.length > 0 && (
              <DesignFinder
                section={{ name: product.section_name, slug: product.section_slug }}
                categories={categories}
                total={catalog.total}
                currentSlug={product.slug}
                currentCategory={product.category_slug}
                unit={unit}
              />
            )}

            <div className={styles.product}>
              <div className={styles.galleryCol}>
                <ProductGallery images={product.images || []} productName={product.name} />
              </div>

              {/* Buy box */}
              <div className={styles.info}>
                <div className={styles.eyebrow}>
                  <Link href={categoryHref} className={styles.catBadge}>{badge}</Link>
                  {model && <span className={styles.model}>Model {model}</span>}
                </div>

                <h1 className={styles.title}>{product.name}</h1>
                {tagline && <p className={styles.tagline}>{tagline}</p>}
                {unique && <p className={styles.about}>{unique}</p>}

                <div className={styles.ctas}>
                  <Link href={enquireHref} className={`btn-primary ${styles.ctaMain}`}>
                    Request a Quote
                  </Link>
                  <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className={styles.waBtn}>
                    <Whatsapp size={18} aria-hidden="true" /> Enquire on WhatsApp
                  </a>
                </div>
                <p className={styles.note}>Minimum order quantities apply. Contact us for bulk pricing and customisation.</p>

                {keyFacts.length > 0 && (
                  <dl className={styles.facts}>
                    {keyFacts.map((f) => (
                      <div key={f.label} className={styles.fact}>
                        <dt>{f.label}</dt>
                        <dd>{f.value}</dd>
                      </div>
                    ))}
                  </dl>
                )}

                {/* The same design in other formats */}
                {otherFormats.length > 0 && (
                  <div className={styles.option}>
                    <div className={styles.optionHead}>
                      <span className={styles.optionLabel}>Also available in</span>
                    </div>
                    <div className={styles.formatChips}>
                      <span className={`${styles.formatChip} ${styles.formatOn}`} aria-current="true">
                        <Check size={15} aria-hidden="true" /> {product.category_name}
                      </span>
                      {otherFormats.map((f) => (
                        <Link key={f.category.slug} href={`/product/${f.match.slug}`} className={styles.formatChip}>
                          {f.category.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Neighbouring designs in this category */}
                {coverStrip.length > 1 && (
                  <div className={styles.option}>
                    <div className={styles.optionHead}>
                      <span className={styles.optionLabel}>
                        More {product.category_name} {unit}
                      </span>
                      <span className={styles.optionPos}>{index + 1} of {siblings.length}</span>
                    </div>
                    <div className={styles.covers}>
                      {coverStrip.map((p) => (
                        <Link
                          key={p.id}
                          href={`/product/${p.slug}`}
                          className={`${styles.cover} ${p.slug === product.slug ? styles.coverOn : ''}`}
                          title={p.name}
                          aria-label={p.name}
                          aria-current={p.slug === product.slug ? 'page' : undefined}
                        >
                          {productThumb(p) ? <img src={productThumb(p)} alt="" loading="lazy" /> : <span>{p.name}</span>}
                        </Link>
                      ))}
                      {moreCovers > 0 && (
                        <Link href={categoryHref} className={styles.coverMore} aria-label={`See all ${siblings.length} ${product.category_name} ${unit}`}>
                          +{moreCovers}
                        </Link>
                      )}
                    </div>
                    {nextDesign && (
                      <div className={styles.stepper}>
                        {prevDesign && (
                          <Link href={`/product/${prevDesign.slug}`} className={styles.step}>
                            <ChevronLeft size={16} aria-hidden="true" /> {prevDesign.name}
                          </Link>
                        )}
                        <Link href={`/product/${nextDesign.slug}`} className={`${styles.step} ${styles.stepNext}`}>
                          {nextDesign.name} <ChevronRight size={16} aria-hidden="true" />
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                <ul className={styles.assurances}>
                  <li><Palette size={17} aria-hidden="true" /> Custom logo branding</li>
                  <li><Package size={17} aria-hidden="true" /> Bulk &amp; corporate orders</li>
                  <li><Award size={17} aria-hidden="true" /> Crafted since 1978</li>
                </ul>

                {/* Phones: keep the two enquiry actions within thumb reach */}
                <div className={styles.mobileBar} data-mobile-cta="">
                  <Link href={enquireHref} className={`btn-primary ${styles.ctaMain}`}>Request a Quote</Link>
                  <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className={styles.waBtn} aria-label="Enquire on WhatsApp">
                    <Whatsapp size={18} aria-hidden="true" /> WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Full product details — overview, highlights, specifications */}
      <ProductContent product={product} hideUnique={Boolean(unique)} containerClassName={styles.wide} />

      {/* More designs from the same category */}
      {moreInCategory.length > 0 && (
        <section className={`section-padding ${styles.band}`}>
          <div className={`container ${styles.wide}`}>
            <div className={styles.bandHead}>
              <div>
                <h2>More {product.category_name} {unit}</h2>
                <p>
                  {sharesInside
                    ? 'Same format and inside pages — a different cover.'
                    : `${siblings.length} ${unit} in ${product.category_name}.`}
                </p>
              </div>
              <Link href={categoryHref} className={styles.bandLink}>
                View all {siblings.length} <span aria-hidden="true">→</span>
              </Link>
            </div>
            <div className={styles.relatedGrid}>
              {moreInCategory.map((p) => (
                <ProductCard key={p.id} product={p} eyebrow={product.category_name} compact />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Fallback when the section catalog couldn't load: the API's own similar products */}
      {categories.length === 0 && product.related?.length > 0 && (
        <section className={`section-padding ${styles.band}`}>
          <div className={`container ${styles.wide}`}>
            <div className={styles.bandHead}>
              <h2>Similar products</h2>
            </div>
            <div className={styles.relatedGrid}>
              {product.related.map((p) => (
                <ProductCard key={p.id} product={p} eyebrow={p.category_name} compact />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Every category in the section */}
      {categories.length > 1 && (
        <section className="section-padding" id="explore">
          <div className={`container ${styles.wide}`}>
            <div className={styles.bandHead}>
              <div>
                <h2>Explore all {product.section_name}</h2>
                <p>
                  {catalog.total} {unit} across {categories.length} categories — pick a category to see every design in it.
                </p>
              </div>
              <Link href={sectionHref} className={styles.bandLink}>
                Browse with filters <span aria-hidden="true">→</span>
              </Link>
            </div>
            <CategoryShowcase
              sectionSlug={product.section_slug}
              categories={categories}
              currentCategory={product.category_slug}
              unit={unit}
            />
          </div>
        </section>
      )}

      {/* Category FAQs */}
      {faqs.length > 0 && (
        <section className={`section-padding ${styles.band}`}>
          <div className={`container ${styles.faqWrap}`}>
            <h2 className={styles.faqTitle}>Frequently asked questions</h2>
            <p className={styles.faqSub}>About {badge}</p>
            <div className={styles.faqList}>
              {faqs.map((f, i) => (
                <details key={i} className={styles.faq}>
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
            <div className={styles.faqCta}>
              <p>Have a different question or a custom requirement?</p>
              <Link href={enquireHref} className="btn-secondary">Talk to our team</Link>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
