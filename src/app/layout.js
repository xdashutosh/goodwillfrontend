import { Cormorant_Garamond } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WhatsAppFab from '@/components/layout/WhatsAppFab';
import { API_BASE } from '@/lib/api';
import { getSiteAssets, assetSlot } from '@/lib/assets';

// Body/UI font — Avenir Next. It's a proprietary (Apple/Linotype) font, not
// available via next/font/google, so it's set as a system font stack on the
// --font-inter variable in globals.css rather than loaded here.

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['600'],
  variable: '--font-cormorant',
  display: 'swap',
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.plan-a-day.com'),
  title: {
    default: 'Goodwill Printers | Premium Diaries, Notebooks & Corporate Gifts',
    template: '%s | Goodwill Printers',
  },
  description:
    'Goodwill Printers — manufacturers & exporters of premium New Year diaries, notebooks, organizers and corporate gifts since 1978, under our Plan.A.Day brand. Crafting Corporate Excellence.',
  keywords:
    'Goodwill Printers, Plan A Day, diary manufacturer, corporate gifts, premium diaries, notebooks, organizers, customized stationery',
  applicationName: 'Goodwill Printers',
  authors: [{ name: 'Goodwill Printers' }],
  openGraph: {
    title: 'Goodwill Printers | Premium Diaries, Notebooks & Corporate Gifts',
    description: 'Premium corporate stationery and gifting solutions since 1978.',
    url: '/',
    siteName: 'Goodwill Printers',
    images: [
      {
        url: '/collections/our-collections.jpg',
        width: 1200,
        height: 800,
        alt: 'Goodwill Printers — premium diaries and notebooks',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Goodwill Printers',
    description: 'Premium corporate stationery and gifting solutions since 1978.',
    images: ['/collections/our-collections.jpg'],
  },
};

// Nav data for the header (sections + their categories + contact details).
// Cached/revalidated so it stays cheap across the many prerendered pages.
async function getNavData() {
  try {
    const [secRes, catRes, setRes] = await Promise.all([
      fetch(`${API_BASE}/api/sections`, { next: { revalidate: 300 } }),
      fetch(`${API_BASE}/api/categories`, { next: { revalidate: 300 } }),
      fetch(`${API_BASE}/api/settings`, { next: { revalidate: 60 } }),
    ]);
    const sections = secRes.ok ? await secRes.json() : [];
    const categories = catRes.ok ? await catRes.json() : [];
    const settings = setRes.ok ? await setRes.json() : {};

    const bySection = {};
    for (const c of Array.isArray(categories) ? categories : []) {
      (bySection[c.section_slug] = bySection[c.section_slug] || []).push({ name: c.name, slug: c.slug });
    }
    const navSections = (Array.isArray(sections) ? sections : []).map((s) => ({
      name: s.name,
      slug: s.slug,
      categories: bySection[s.slug] || [],
    }));

    return {
      sections: navSections,
      contact: {
        phone: settings.contact_phone || '',
        email: settings.contact_email || '',
        whatsapp: settings.whatsapp_number || '',
      },
      socials: {
        facebook: settings.facebook_url || '',
        instagram: settings.instagram_url || '',
        twitter: settings.twitter_url || '',
        linkedin: settings.linkedin_url || '',
      },
    };
  } catch {
    return { sections: [], contact: {}, socials: {} };
  }
}

export default async function RootLayout({ children }) {
  const [navData, assets] = await Promise.all([getNavData(), getSiteAssets()]);

  const logos = {
    primary: assetSlot(assets, 'brand', 'logo_primary')?.url || '/brand/goodwill-printers.png',
    footer: assetSlot(assets, 'brand', 'logo_footer')?.url || '/brand/plan-a-day.png',
  };

  return (
    <html lang="en" className={`${cormorant.variable}`}>
      <body>
        <Header navData={navData} logo={logos.primary} />
        <main>{children}</main>
        <Footer socials={navData.socials} contact={navData.contact} logo={logos.footer} />
        <WhatsAppFab number={navData.contact.whatsapp} />
      </body>
    </html>
  );
}
