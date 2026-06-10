import { API_BASE } from '@/lib/api';
import Reveal from '@/components/ui/Reveal';

export const metadata = {
  title: 'About Us',
  description: 'Learn about Goodwill Printers, crafting corporate excellence since 1978. Experts in premium corporate stationery and gifting solutions.',
  alternates: { canonical: '/about' },
};

const DEFAULT_INTRO = 'At Goodwill Printers, we transform ideas into premium corporate stationery and gifting solutions that reflect professionalism, quality, and brand identity. Since 1978, we have been delivering expertly crafted products under our internationally recognized brand, Plan.A.Day.';

async function getAboutIntro() {
  try {
    const res = await fetch(`${API_BASE}/api/settings`, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error('bad status');
    const settings = await res.json();
    return settings.about_intro || DEFAULT_INTRO;
  } catch {
    return DEFAULT_INTRO;
  }
}

export default async function About() {
  const intro = await getAboutIntro();
  return (
    <>
      <section className="hero" style={{ minHeight: '40vh' }}>
        <div className="container">
          <h1>About Us</h1>
          <p>Goodwill Printers – Crafting Corporate Excellence Since 1978</p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container">
          <div className="grid-2">
            <Reveal>
              <h2 style={{ color: 'var(--text-white)' }}>Our Story</h2>
              <p style={{ color: 'var(--text-gray)', marginBottom: '1.5rem', fontSize: '1.1rem', whiteSpace: 'pre-line' }}>
                {intro}
              </p>
              <p style={{ color: 'var(--text-gray)', marginBottom: '2rem' }}>
                With decades of industry expertise, we specialize in manufacturing and exporting a diverse range of products including diaries, notebooks, organizers, conference folders, address books, and customized corporate gifts designed for modern businesses.
              </p>

              <h3 style={{ color: 'var(--gold-accent)', fontSize: '1.5rem' }}>Craftsmanship Backed by Technology</h3>
              <p style={{ color: 'var(--text-gray)', marginBottom: '2rem' }}>
                Our state-of-the-art in-house manufacturing facility is equipped with advanced printing, paper cutting, folding, sewing, embossing, casing-in, and packaging systems. Combined with the expertise of our skilled team, this enables us to maintain exceptional quality standards across every product we create.
              </p>
            </Reveal>

            <Reveal delay={0.12}>
              <div className="glass-card" style={{ padding: '2.5rem' }}>
                <h3 style={{ color: 'var(--gold-accent)', fontSize: '1.5rem' }}>Designed Around Your Brand</h3>
                <p style={{ color: 'var(--text-gray)', marginBottom: '1.5rem' }}>
                  We understand that every business has unique branding needs. That's why we offer complete customization and personalization solutions — from product colors, sizes, materials, and packaging to logo embossing, branded inserts, and custom designs.
                </p>
                <p style={{ color: 'var(--text-gray)' }}>
                  Whether you are looking for executive gifting solutions or premium corporate stationery, we create products that leave a lasting impression.
                </p>
              </div>

              <div style={{ marginTop: '3rem' }}>
                <h3 style={{ color: 'var(--text-white)' }}>Our Commitment</h3>
                <p style={{ color: 'var(--text-gray)' }}>
                  At Goodwill Printers, quality, innovation, and customer satisfaction remain at the heart of everything we do. We are committed to building long-term partnerships by delivering products that combine functionality, elegance, and brand value.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
