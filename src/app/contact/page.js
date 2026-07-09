import { Suspense } from 'react';
import Image from 'next/image';
import { Mail, Phone, MapPin, MessageCircle } from 'lucide-react';
import { API_BASE, WHATSAPP_NUMBER } from '@/lib/api';
import contactBg from '@/assets/contactus backgroung.png';
import ContactForm from './ContactForm';
import styles from './contact.module.css';

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
    <section className={styles.wrap}>
      <Image src={contactBg} alt="" fill priority sizes="100vw" className={styles.bgImage} />
      <div className={styles.veil} />

      <div className={`container ${styles.inner}`}>
        <h1 className={styles.heading}>Contact Us</h1>

        <div className={styles.layout}>
          <div className={styles.card}>
            <h2 className={styles.infoTitle}>Contact Information</h2>

            <div className={styles.infoItem}>
              <Mail size={20} className={styles.infoIcon} />
              <span>
                <span className={styles.infoLabel}>Email</span>
                <a href={`mailto:${email}`}>{email}</a>
              </span>
            </div>

            {phone && (
              <div className={styles.infoItem}>
                <Phone size={20} className={styles.infoIcon} />
                <span>
                  <span className={styles.infoLabel}>Phone</span>
                  <a href={`tel:${phone.replace(/\s+/g, '')}`}>{phone}</a>
                </span>
              </div>
            )}

            <div className={styles.infoItem}>
              <MapPin size={20} className={styles.infoIcon} />
              <span style={{ whiteSpace: 'pre-line' }}>
                <span className={styles.infoLabel}>Headquarters</span>
                {address}
              </span>
            </div>

            <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className={styles.whatsapp}>
              <MessageCircle size={18} /> Chat with us on WhatsApp
            </a>
          </div>

          <Suspense fallback={<div className={styles.card}>Loading form...</div>}>
            <ContactForm />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
