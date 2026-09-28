import Link from 'next/link';
import { Award, Factory, Palette, Gem, ArrowRight } from 'lucide-react';
import { API_BASE } from '@/lib/api';
import { getSiteAssets, assetList, assetSlot } from '@/lib/assets';
import Reveal from '@/components/ui/Reveal';
import BannerCarousel from '@/components/ui/BannerCarousel';
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

// The "Our Collections" card art, the 2027 poster, the gifting range and the
// closing-CTA background all come from the managed Asset Manager (S3). If a
// collection has no entry the section simply renders without that image.
const DEFAULT_CARD_ART = '/collections/our-collections.jpg';

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
  const [sections, settings, assets] = await Promise.all([
    getSections(),
    getSettings(),
    getSiteAssets(),
  ]);

  // Hero banners — managed in Admin Panel → Assets. Falls back to the legacy
  // site_settings.banners list, then to nothing.
  const bannerAssets = assetList(assets, 'hero_banners')
    .filter((a) => a.url)
    .map((a) => ({ image_url: a.url, webp_url: a.webp_url, title: a.title, link: a.link }));
  const legacyBanners = Array.isArray(settings.banners)
    ? settings.banners.filter((b) => b && b.image_url)
    : [];
  const banners = bannerAssets.length ? bannerAssets : legacyBanners;

  // "Our Collections" card art, by section slug (Asset Manager → collection_cards).
  const cardArt = (slug) =>
    assetSlot(assets, 'collection_cards', slug)?.url ||
    assetSlot(assets, 'collection_cards', 'default')?.url ||
    DEFAULT_CARD_ART;

  // 2027 poster + closing-CTA background (Asset Manager → backgrounds). null = omit.
  const posterUrl = assetSlot(assets, 'backgrounds', 'poster_2027')?.url || null;
  const ctaBgUrl = assetSlot(assets, 'backgrounds', 'cta_bg')?.url || null;

  // Gifting range: hero piece (Doc Kit / first) + supporting cards.
  const giftAssets = assetList(assets, 'gifting').filter((a) => a.url);
  const giftHeroAsset = giftAssets.find((a) => a.slot === 'doc-kit') || giftAssets[0] || null;
  const giftHero = giftHeroAsset
    ? {
        image: giftHeroAsset.url,
        hoverImage: giftHeroAsset.hover_url || null,
        name: giftHeroAsset.title || 'Doc Kit',
        href: giftHeroAsset.link || '/corporate-gifts',
        description: giftHeroAsset.subtitle || '',
      }
    : null;
  const giftCards = giftAssets
    .filter((a) => a !== giftHeroAsset)
    .map((a) => ({
      image: a.url,
      hoverImage: a.hover_url || null,
      name: a.title || '',
      href: a.link || '#',
      description: a.subtitle || '',
    }));

  const showcaseVideos = assetList(assets, 'showcase_videos');

  return (
    <div className={styles.home}>
      {/* Hero — admin-managed banners (Admin Panel → Assets → Hero Banners) */}
      <BannerCarousel banners={banners} />

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
                      src={cardArt(section.slug)}
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
      {posterUrl && (
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
              <img
                src={posterUrl}
                alt="Goodwill Printers — 2027 Collection"
                className={styles.posterImg}
                loading="lazy"
              />
            </Reveal>
          </div>
        </section>
      )}

      {/* Corporate gifting range */}
      <section className="section-padding" style={{ backgroundColor: 'var(--bg-alt)', paddingTop: '2.5rem' }}>
        <div className={`container ${styles.giftContainer}`}>
          <Reveal>
            <SectionHeading
              eyebrow="Gifting"
              title="Corporate Gifts"
              subtitle="Gifts that carry your brand with grace — premium organisers, holders and keepsakes that leave a lasting impression long after they're handed over."
            />
          </Reveal>

          <div className={styles.giftLayout}>
            {giftHero && (
              <Reveal className={styles.giftMain}>
                <Link href={giftHero.href} className={styles.giftMainImgWrap} aria-label={`${giftHero.name} — view product`}>
                  <img src={giftHero.image} alt={giftHero.name} className={styles.giftMainImg} loading="lazy" />
                  {giftHero.hoverImage && (
                    <img src={giftHero.hoverImage} alt="" aria-hidden className={`${styles.giftMainImg} ${styles.giftHoverImg}`} loading="lazy" />
                  )}
                </Link>
              </Reveal>
            )}

            <div className={styles.giftCards}>
              {giftCards.map((item, i) => (
                <Reveal key={item.name || i} delay={i * 0.08} className={styles.giftCardReveal}>
                  <Link href={item.href || '#'} className={styles.giftCardLink} aria-label={`${item.name} — view product`}>
                    <figure className={styles.giftCard}>
                      <div className={styles.giftCardImgWrap}>
                        <img src={item.image} alt={`${item.name} — corporate gift`} className={styles.giftCardImg} loading="lazy" />
                        {item.hoverImage && (
                          <img src={item.hoverImage} alt="" aria-hidden className={`${styles.giftCardImg} ${styles.giftHoverImg}`} loading="lazy" />
                        )}
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
      {showcaseVideos.length > 0 && (
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
              <VideoShowcase videos={showcaseVideos} />
            </Reveal>
          </div>
        </section>
      )}

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
                    <span className={styles.journeyGhost} aria-hidden="true">{i + 1}</span>
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
      <section className={styles.cta} style={{ backgroundColor: '#06296e' }}>
        {ctaBgUrl && (
          <img
            src={ctaBgUrl}
            alt=""
            aria-hidden
            className={styles.ctaBg}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
          />
        )}
        <div className={styles.ctaVeil} />
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <Reveal className="text-center">
            <h2 className={styles.ctaTitle}>Ready to elevate your corporate gifting?</h2>
            <p className={styles.ctaText}>
              Tell us what you need — our team will craft a tailored quote with full customization options.
            </p>
            <div style={{ marginTop: '2rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem' }}>
              <Link href="/contact" className={styles.ctaBtnWhite}>
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
