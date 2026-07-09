import Link from 'next/link';
import Image from 'next/image';
import { Award, Factory, Palette, Gem, ArrowRight } from 'lucide-react';
import poster2027 from '@/assets/2027collection.png';
import docKit from '@/assets/Doc.kit.png';
import astra from '@/assets/astra.png';
import fashion from '@/assets/fashion.png';
import guest from '@/assets/guest.png';
import docKitHover from '@/assets/on hover/Doc kit.png';
import astraHover from '@/assets/on hover/astra.png';
import fashionHover from '@/assets/on hover/fashion.png';
import guestHover from '@/assets/on hover/guest.png';
import elevateBg from '@/assets/elevate.png';
import { API_BASE } from '@/lib/api';
import Reveal from '@/components/ui/Reveal';
import BannerCarousel from '@/components/ui/BannerCarousel';
import HeroCarousel from '@/components/ui/HeroCarousel';
import VideoShowcase from '@/components/ui/VideoShowcase';
import styles from './page.module.css';

const USPS = [
  { icon: Award, title: '45+ Years Experience', text: 'Decades of industry expertise in manufacturing' },
  { icon: Factory, title: 'In-House Production', text: 'End-to-end printing, folding, and binding' },
  { icon: Palette, title: 'Full Customization', text: 'Tailored solutions around your brand identity' },
  { icon: Gem, title: 'Premium Quality', text: 'Highest standard materials and finishes' },
];

const FALLBACK_SECTIONS = [
  { name: 'Diaries', slug: 'diaries', description: 'Premium New Year diaries in diverse formats.' },
  { name: 'Notebooks', slug: 'notebooks', description: 'High-quality notebooks and folders.' },
  { name: 'Organizers', slug: 'organizers', description: 'Professional organizers for daily planning.' },
  { name: 'Corporate Gifts', slug: 'corporate-gifts', description: 'Premium corporate gifting solutions.' },
];

export const metadata = {
  title: { absolute: 'Goodwill Printers | Premium Diaries, Notebooks & Corporate Gifts' },
  description:
    'Goodwill Printers — premium New Year diaries, notebooks, organizers and corporate gifts since 1978. Explore our Plan.A.Day collection and request a custom quote.',
  alternates: { canonical: '/' },
};

// Sections to feature on the home page (in display order)
const SHOWCASE_SLUGS = ['diaries', 'notebooks', 'organizers', 'corporate-gifts'];

// Collection artwork shown on the "Our Collections" cards
const SECTION_IMAGES = {
  diaries: '/collections/diaries.png',
  notebooks: '/collections/notebooks.png',
  organizers: '/collections/organizers.png',
  'corporate-gifts': '/collections/corporate-gifts.png',
};

// Corporate gifting range featured below the 2027 poster. The Doc Kit is the
// hero piece (large image, far left); the remaining three sit as a trio.
const GIFT_ITEMS = [
  {
    image: astra,
    hoverImage: astraHover,
    name: 'Astra',
    slug: 'astra-corporate-gifts',
    description:
      'A slimline leatherette card and document holder with smart slots for cards, cash and travel papers.',
  },
  {
    image: fashion,
    hoverImage: fashionHover,
    name: 'Fashion Book',
    slug: 'fashion-corporate-gifts',
    description:
      'A zip-around organiser pairing a phone pocket, card slots and a notepad — a sleek, premium gift.',
  },
  {
    image: guest,
    hoverImage: guestHover,
    name: 'Guest Book',
    slug: 'guest-book-corporate-gifts',
    description:
      'A debossed faux-leather guest book that adds a premium touch to weddings, launches and corporate events.',
  },
];

const FAQS = [
  {
    q: 'Do you offer customization and branding?',
    a: 'Yes — every product can be fully personalized. We handle logo foil-stamping and screen printing, custom cover materials and colours, bespoke page layouts, edge colouring and tailored packaging to match your brand identity.',
  },
  {
    q: 'What is the minimum order quantity (MOQ)?',
    a: 'MOQs vary by product and the level of customization. Share your requirement through the enquiry form and our team will confirm the minimum quantity and pricing for your chosen item.',
  },
  {
    q: 'Which sizes and formats are available?',
    a: 'Our diaries and notebooks come in A4, A5, A6 and B5 sizes, in daily and weekly layouts, alongside Wiro, Swiss, USB and Trump folder styles. Organizers and corporate gift ranges are available too.',
  },
  {
    q: 'Do you ship across India and internationally?',
    a: 'Yes. We supply corporates across India and fulfil export orders on request. Let us know your delivery location and timeline when you enquire.',
  },
  {
    q: 'How long does production take?',
    a: 'Typical lead times run 2–4 weeks depending on the quantity and the degree of customization. We confirm an exact timeline together with your quotation.',
  },
  {
    q: 'How do I place an order or request a quote?',
    a: 'Use the “Enquire” buttons on any product, fill in the contact form, or message us on WhatsApp. Our team responds with pricing, customization options and bulk rates.',
  },
];

async function getSections() {
  try {
    const res = await fetch(`${API_BASE}/api/sections`, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error('bad status');
    const data = await res.json();
    return Array.isArray(data) && data.length > 0 ? data : FALLBACK_SECTIONS;
  } catch {
    return FALLBACK_SECTIONS;
  }
}

async function getSectionShowcases() {
  const results = await Promise.all(
    SHOWCASE_SLUGS.map(async (slug) => {
      try {
        const res = await fetch(`${API_BASE}/api/products?section=${slug}&limit=4&sort=newest`, {
          next: { revalidate: 60 },
        });
        if (!res.ok) throw new Error('bad status');
        const data = await res.json();
        return { slug, products: data.products || [] };
      } catch {
        return { slug, products: [] };
      }
    })
  );
  return results.filter((r) => r.products.length > 0);
}

async function getSettings() {
  try {
    // Short revalidate so banner / content edits from the admin panel appear on
    // the live home page within seconds, without a rebuild.
    const res = await fetch(`${API_BASE}/api/settings`, { next: { revalidate: 10 } });
    if (!res.ok) throw new Error('bad status');
    return await res.json();
  } catch {
    return {};
  }
}

const primaryImage = (product) => {
  if (!product.images || product.images.length === 0) return null;
  const primary = product.images.find((i) => i.is_primary);
  return (primary || product.images[0]).thumbnail_url;
};

function ProductCard({ product }) {
  return (
    <Link href={`/product/${product.slug}`} className={`glass-card ${styles.featuredCard}`}>
      <div className={styles.featuredImgWrap}>
        {primaryImage(product) ? (
          <img src={primaryImage(product)} alt={product.name} loading="lazy" />
        ) : (
          <div className={styles.featuredNoImg}>No Image</div>
        )}
      </div>
      <div className={styles.featuredInfo}>
        <span className={styles.featuredCat}>{product.category_name}</span>
        <h4>{product.name}</h4>
      </div>
    </Link>
  );
}

function SectionHeading({ eyebrow, title, subtitle, align = 'center' }) {
  return (
    <div className={align === 'left' ? `${styles.sectionHeading} ${styles.sectionHeadingLeft}` : styles.sectionHeading}>
      {eyebrow && <span className={styles.eyebrow}>{eyebrow}</span>}
      <h2 className={styles.sectionTitle}>{title}</h2>
      {subtitle && <p className={styles.sectionSubtitle}>{subtitle}</p>}
    </div>
  );
}

export default async function Home() {
  const [sections, showcases, settings] = await Promise.all([
    getSections(),
    getSectionShowcases(),
    getSettings(),
  ]);

  const sectionMeta = Object.fromEntries(sections.map((s) => [s.slug, s]));

  const heroTitle = settings.hero_title || 'Crafting Corporate Excellence Since 1978';
  const heroSubtitle =
    settings.hero_subtitle ||
    'Premium corporate stationery and gifting solutions that reflect professionalism, quality, and brand identity.';
  const banners = Array.isArray(settings.banners) ? settings.banners.filter((b) => b && b.image_url) : [];

  return (
    <div className={styles.home}>
      {/* Hero */}
      <HeroCarousel />

      {/* Collections overview */}
      <section className="section-padding" style={{ backgroundColor: 'var(--bg-alt)' }}>
        <div className="container">
          <Reveal>
            <SectionHeading
              eyebrow="What We Offer"
              title="Our Collections"
              subtitle="A wide range of premium diaries, notebooks, organizers and gifts — crafted for every need and every idea."
            />
          </Reveal>

          <div className={styles.collectionGrid}>
            {sections.map((section, i) => (
              <Reveal key={section.slug} delay={i * 0.08}>
                <Link href={`/${section.slug}`} className={`glass-card ${styles.collectionCard}`}>
                  <div className={styles.collectionImgWrap}>
                    <img
                      src={SECTION_IMAGES[section.slug] || '/collections/our-collections.jpg'}
                      alt={`${section.name} collection`}
                      loading="lazy"
                    />
                  </div>
                  <div className={styles.collectionBody}>
                    <div className={styles.collectionHead}>
                      <h3>{section.name}</h3>
                      {section.category_count != null && (
                        <span className={styles.collectionCount}>{section.category_count} categories</span>
                      )}
                    </div>
                    <span className={styles.collectionLink}>
                      Explore {section.name} <ArrowRight size={15} style={{ verticalAlign: 'middle' }} />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 2027 Collection poster */}
      <section className="section-padding">
        <div className="container">
          <Reveal>
            <SectionHeading
              eyebrow="New Arrivals"
              title="The 2027 Collection"
              subtitle="A fresh line-up of premium diaries crafted to plan your year in style — thoughtfully designed, beautifully finished, and made for every occasion."
            />
          </Reveal>
        </div>
        <div className={styles.posterWrap}>
          <Reveal>
            <Image
              src={poster2027}
              alt="Goodwill Printers — 2027 Collection"
              className={styles.posterImg}
              sizes="96vw"
              priority={false}
            />
          </Reveal>
        </div>
      </section>

      {/* Corporate gifting range */}
      <section className="section-padding" style={{ backgroundColor: 'var(--bg-alt)', paddingTop: '2.5rem' }}>
        <div className="container">
          <Reveal>
            <SectionHeading
              eyebrow="Gifting"
              title="Corporate Gifts"
              subtitle="Gifts that carry your brand with grace — premium organisers, holders and keepsakes that leave a lasting impression long after they're handed over."
            />
          </Reveal>

          <div className={styles.giftLayout}>
            <Reveal className={styles.giftMain}>
              <Link href="/product/doc-kit-corporate-gifts" className={styles.giftMainImgWrap} aria-label="Doc Kit — view product">
                <Image src={docKit} alt="Doc Kit — secure travel document organiser" className={styles.giftMainImg} sizes="(max-width: 900px) 90vw, 38vw" />
                <Image src={docKitHover} alt="" aria-hidden className={`${styles.giftMainImg} ${styles.giftHoverImg}`} sizes="(max-width: 900px) 90vw, 38vw" />
              </Link>
            </Reveal>

            <div className={styles.giftCards}>
              {GIFT_ITEMS.map((item, i) => (
                <Reveal key={item.name} delay={i * 0.08}>
                  <Link href={`/product/${item.slug}`} className={styles.giftCardLink} aria-label={`${item.name} — view product`}>
                    <figure className={styles.giftCard}>
                      <div className={styles.giftCardImgWrap}>
                        <Image src={item.image} alt={`${item.name} — corporate gift`} className={styles.giftCardImg} sizes="(max-width: 900px) 45vw, 20vw" />
                        <Image src={item.hoverImage} alt="" aria-hidden className={`${styles.giftCardImg} ${styles.giftHoverImg}`} sizes="(max-width: 900px) 45vw, 20vw" />
                      </div>
                      <figcaption className={styles.giftCardBody}>
                        <h4>{item.name}</h4>
                        <p className={styles.giftCardDesc}>{item.description}</p>
                      </figcaption>
                    </figure>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>

          <div className="text-center" style={{ marginTop: '3rem' }}>
            <Link href="/corporate-gifts" className={`btn-primary ${styles.giftBtn}`}>
              Explore More <ArrowRight size={16} style={{ verticalAlign: 'middle', marginLeft: '0.35rem' }} />
            </Link>
          </div>
        </div>
      </section>

      {/* Product films — a self-playing reel of our work in motion */}
      <section className="section-padding">
        <div className="container">
          <Reveal>
            <SectionHeading
              eyebrow="See It In Action"
              title="Our Gifts in Motion"
              subtitle="Our premium gifts, in motion — see each piece come to life, then tap through to explore it and enquire."
            />
          </Reveal>
          <Reveal delay={0.1}>
            <VideoShowcase />
          </Reveal>
        </div>
      </section>

      {/* ===== Featured products, grouped by section ("Shop by Category") — temporarily commented out =====
      {showcases.length > 0 && (
        <section className="section-padding">
          <div className="container">
            <Reveal>
              <SectionHeading
                eyebrow="Featured Range"
                title="Shop by Category"
                subtitle="A glimpse of our premium range across every collection."
              />
            </Reveal>

            {showcases.map((sc) => {
              const meta = sectionMeta[sc.slug] || {};
              return (
                <div key={sc.slug} className={styles.shopBlock}>
                  <Reveal className={styles.sectionHead}>
                    <div>
                      <h3 className={styles.shopTitle}>{meta.name || sc.slug}</h3>
                      {meta.description && <p className={styles.shopDesc}>{meta.description}</p>}
                    </div>
                    <Link href={`/${sc.slug}`} className={styles.viewAll}>
                      View all <ArrowRight size={15} style={{ verticalAlign: 'middle' }} />
                    </Link>
                  </Reveal>
                  <div className="grid-4">
                    {sc.products.map((product, i) => (
                      <Reveal key={product.id} delay={i * 0.05}>
                        <ProductCard product={product} />
                      </Reveal>
                    ))}
                  </div>
                </div>
              );
            })}

            <div className="text-center" style={{ marginTop: '3.5rem' }}>
              <Link href="/products" className="btn-primary">
                View Full Catalog
              </Link>
            </div>
          </div>
        </section>
      )}
      ===== end "Shop by Category" section ===== */}

      {/* Why choose us — journey timeline */}
      <section className="section-padding" style={{ backgroundColor: 'var(--bg-alt)' }}>
        <div className="container">
          <Reveal>
            <SectionHeading
              eyebrow="Our Promise"
              title="Why Choose Us"
              subtitle="At Goodwill Printers, quality, innovation, and customer satisfaction remain at the heart of everything we do."
            />
          </Reveal>

          <div className={styles.journey}>
            {/* Decorative connecting wave that threads through each step */}
            <svg
              className={styles.journeyWave}
              viewBox="0 0 1000 260"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                d="M20,200 C160,200 180,90 320,90 C460,90 480,200 620,200 C760,200 780,70 980,70"
                fill="none"
                stroke="var(--blue)"
                strokeWidth="3"
                strokeLinecap="round"
                opacity="0.35"
              />
            </svg>

            <div className={styles.journeyTrack}>
              {USPS.map(({ icon: Icon, title, text }, i) => (
                <Reveal key={title} delay={i * 0.1}>
                  <div className={`${styles.journeyStep} ${i % 2 === 1 ? styles.journeyStepDown : ''}`}>
                    <span className={styles.journeyGhost}>{i + 1}</span>
                    <span className={styles.journeyNode}>
                      <span className={styles.journeyNodeDot}>
                        <Icon size={18} />
                      </span>
                    </span>
                    <div className={styles.journeyCard}>
                      <span className={styles.journeyStepLabel}>Step {String(i + 1).padStart(2, '0')}</span>
                      <h4>{title}</h4>
                      <p>{text}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-padding">
        <div className="container">
          <Reveal>
            <SectionHeading
              eyebrow="Good to Know"
              title="Frequently Asked Questions"
              subtitle="Everything you need to know about ordering with us."
            />
          </Reveal>

          <div className={styles.faq}>
            {FAQS.map((item, i) => (
              <Reveal key={i} delay={i * 0.04}>
                <details className={styles.faqItem}>
                  <summary>{item.q}</summary>
                  <div className={styles.faqAnswer}>{item.a}</div>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className={styles.cta}>
        <Image src={elevateBg} alt="" fill sizes="100vw" className={styles.ctaBg} />
        <div className={styles.ctaVeil} />
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <Reveal className="text-center">
            <h2 className={styles.ctaTitle}>Ready to elevate your corporate gifting?</h2>
            <p className={styles.ctaText}>
              Tell us what you need — our team will craft a tailored quote with full customization options.
            </p>
            <div style={{ marginTop: '2rem' }}>
              <Link href="/contact" className={styles.ctaBtnWhite} style={{ marginRight: '1rem' }}>
                Request a Quote
              </Link>
              <Link href="/products" className={styles.ctaBtnGhost}>
                Browse Catalog
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
