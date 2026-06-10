import { Suspense } from 'react';
import { MessageCircle } from 'lucide-react';
import { API_BASE, WHATSAPP_NUMBER } from '@/lib/api';
import ContactForm from './ContactForm';

export const metadata = {
  title: 'Contact Us',
  description: 'Get in touch with Goodwill Printers for custom corporate stationery orders, bulk quotes, and gifting enquiries.',
  alternates: { canonical: '/contact' },
};

async function getSettings() {
  try {
    const res = await fetch(`${API_BASE}/api/settings`, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error('bad status');
    return await res.json();
  } catch {
    return {};
  }
}

export default async function Contact() {
  const settings = await getSettings();
  const email = settings.contact_email || 'tanujdhawangp@gmail.com';
  const phone = settings.contact_phone || '';
  const address = settings.contact_address || 'Goodwill Printers\nNew Delhi, India';
  const whatsapp = settings.whatsapp_number || WHATSAPP_NUMBER;
  const whatsappHref = `https://wa.me/${whatsapp}?text=${encodeURIComponent('Hi Goodwill Printers, I would like to enquire about your products.')}`;

  return (
    <>
      <section className="hero" style={{ minHeight: '40vh' }}>
        <div className="container">
          <h1>Contact Us</h1>
          <p>Get in touch for custom orders, quotes, or any general enquiries.</p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container">
          <div className="grid-2">
            <div>
              <h2>Let&apos;s Discuss Your Needs</h2>
              <p style={{ color: 'var(--text-gray)', marginBottom: '2rem' }}>
                Fill out the form to request a quote or ask about our customization options. Our team will get back to you within 24 hours.
              </p>

              <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
                <h3 style={{ color: 'var(--gold-light)', marginBottom: '1rem', fontSize: '1.2rem' }}>Contact Information</h3>
                <p style={{ color: 'var(--text-gray)', marginBottom: '0.5rem' }}>
                  <strong>Email:</strong>{' '}
                  <a href={`mailto:${email}`} style={{ color: 'var(--gold-accent)' }}>{email}</a>
                </p>
                {phone && (
                  <p style={{ color: 'var(--text-gray)', marginBottom: '0.5rem' }}>
                    <strong>Phone:</strong>{' '}
                    <a href={`tel:${phone.replace(/\s+/g, '')}`} style={{ color: 'var(--gold-accent)' }}>{phone}</a>
                  </p>
                )}
                <p style={{ color: 'var(--text-gray)', whiteSpace: 'pre-line' }}>
                  <strong>Headquarters:</strong>{'\n'}{address}
                </p>
              </div>

              <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ background: '#25d366', color: '#fff', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <MessageCircle size={18} /> Chat with us on WhatsApp
              </a>
            </div>

            <Suspense fallback={<div className="glass-card" style={{ padding: '2.5rem' }}>Loading form...</div>}>
              <ContactForm />
            </Suspense>
          </div>
        </div>
      </section>
    </>
  );
}
