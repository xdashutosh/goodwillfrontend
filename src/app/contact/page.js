import { Suspense } from 'react';
import { Mail, Phone, MapPin, MessageCircle } from 'lucide-react';
import { API_BASE, WHATSAPP_NUMBER, DEFAULT_DISPLAY_EMAIL, normalizeWhatsApp, formatPhone } from '@/lib/api';
import { getSiteAssets, assetSlot } from '@/lib/assets';
import { officeLocation } from '@/lib/location';
import LocationMap from '@/components/ui/LocationMap';
import Directions from '@/components/ui/Directions';
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
  const [settings, assets] = await Promise.all([getSettings(), getSiteAssets()]);
  const bgUrl = assetSlot(assets, 'backgrounds', 'contact_bg')?.url || null;
  const email = settings.contact_email || 'tanujdhawangp@gmail.com';
  // Shown address; the mailto link still goes to the Contact Email inbox
  const shownEmail = settings.display_email || DEFAULT_DISPLAY_EMAIL;
  const phone = formatPhone(settings.contact_phone);
  const location = officeLocation({ coords: settings.map_coordinates, address: settings.contact_address });
  const whatsapp = normalizeWhatsApp(settings.whatsapp_number) || WHATSAPP_NUMBER;
  const whatsappHref = `https://wa.me/${whatsapp}?text=${encodeURIComponent('Hi Goodwill Printers, I would like to enquire about your products.')}`;

  return (
    <section className={styles.wrap}>
      {bgUrl && (
        <img
          src={bgUrl}
          alt=""
          aria-hidden
          className={styles.bgImage}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        />
      )}
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
                <a href={`mailto:${email}`}>{shownEmail}</a>
              </span>
            </div>

            {phone.href && (
              <div className={styles.infoItem}>
                <Phone size={20} className={styles.infoIcon} />
                <span>
                  <span className={styles.infoLabel}>Phone</span>
                  <a href={phone.href}>{phone.display}</a>
                </span>
              </div>
            )}

            <div className={styles.infoItem}>
              <MapPin size={20} className={styles.infoIcon} />
              <span style={{ whiteSpace: 'pre-line' }}>
                <span className={styles.infoLabel}>Office &amp; Factory</span>
                {location.address}
                <a href="#visit" className={styles.mapLink}>Show on map</a>
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

        {/* Office & factory location */}
        <div className={`${styles.card} ${styles.visit}`} id="visit">
          <div className={styles.visitInfo}>
            <h2 className={styles.infoTitle}>Visit our office &amp; factory</h2>
            <p className={styles.visitAddress}>{location.address}</p>
            <Directions location={location} />
          </div>
          <LocationMap location={location} className={styles.visitMap} />
        </div>
      </div>
    </section>
  );
}
