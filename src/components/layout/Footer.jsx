'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Facebook, Instagram, Twitter, Linkedin, Whatsapp } from '@/components/ui/SocialIcons';
import { normalizeWhatsApp } from '@/lib/api';
import { officeLocation } from '@/lib/location';
import LocationMap from '@/components/ui/LocationMap';
import Directions from '@/components/ui/Directions';

export default function Footer({ socials = {}, contact = {}, logo }) {
  const currentYear = new Date().getFullYear();
  const logoSrc = logo || '/brand/plan-a-day.png';
  const email = contact.email || 'tanujdhawangp@gmail.com';
  const shownEmail = contact.displayEmail || email;
  const waNumber = normalizeWhatsApp(contact.whatsapp);
  const location = officeLocation({ coords: contact.mapCoords, address: contact.address });
  // The contact page has its own large map — don't repeat it in the footer there.
  const showMap = usePathname() !== '/contact';
  const socialLinks = [
    { Icon: Facebook, url: socials.facebook, label: 'Facebook' },
    { Icon: Instagram, url: socials.instagram, label: 'Instagram' },
    { Icon: Twitter, url: socials.twitter, label: 'X (Twitter)' },
    { Icon: Linkedin, url: socials.linkedin, label: 'LinkedIn' },
    ...(waNumber ? [{ Icon: Whatsapp, url: `https://wa.me/${waNumber}`, label: 'WhatsApp' }] : []),
  ];

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand Col */}
          <div className="footer-brand">
            <Link href="/" className="logo">
              <img src={logoSrc} alt="Plan.A.Day by Goodwill Printers" className="logo-img" />
            </Link>
            <p className="footer-desc">
              Crafting Corporate Excellence Since 1978. Premium corporate stationery and gifting solutions designed for modern businesses.
            </p>
            <div className="footer-social">
              {socialLinks.map(({ Icon, url, label }) => (
                <a
                  key={label}
                  href={url || '#'}
                  className="social-btn"
                  aria-label={label}
                  {...(url ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Links Col 1 */}
          <div className="footer-links">
            <h3>Collections</h3>
            <ul>
              <li><Link href="/diaries">Premium Diaries</Link></li>
              <li><Link href="/notebooks">Notebooks</Link></li>
              <li><Link href="/organizers">Organizers</Link></li>
              <li><Link href="/corporate-gifts">Corporate Gifts</Link></li>
            </ul>
          </div>

          {/* Links Col 2 */}
          <div className="footer-links">
            <h3>Company</h3>
            <ul>
              <li><Link href="/about">About Us</Link></li>
              <li><Link href="/products">Browse Catalog</Link></li>
              <li><Link href="/contact">Contact Us</Link></li>
            </ul>
          </div>

          {/* Contact Col */}
          <div className="footer-contact">
            <h3>Contact</h3>
            <p><strong>Email:</strong><br/>
              <a href={`mailto:${email}`}>{shownEmail}</a>
            </p>
            <div className="mt-4">
              <Link href="/contact" className="btn-secondary">Enquire Now</Link>
            </div>
          </div>

          {/* Office & factory — map + directions in the visitor's maps app */}
          <div className="footer-visit">
            <h3>Visit Us</h3>
            {showMap && <LocationMap location={location} className="footer-map" />}
            <p className="footer-address">{location.address}</p>
            <Directions location={location} compact />
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {currentYear} Goodwill Printers. All rights reserved.</p>
        </div>
      </div>

      <style jsx>{`
        .footer {
          background-color: var(--bg-alt);
          border-top: 1px solid var(--border);
          padding: 2.5rem 0 0;
          margin-top: auto;
        }

        .footer-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        @media (min-width: 768px) {
          .footer-grid {
            grid-template-columns: 2fr 1fr 1fr;
          }

          .footer-visit {
            grid-column: span 2;
          }
        }

        /* Contact column wide enough for the email address on one line at 17px */
        @media (min-width: 1024px) {
          .footer-grid {
            grid-template-columns: 1.45fr 0.85fr 0.85fr 1.25fr 1.6fr;
          }

          .footer-visit {
            grid-column: auto;
          }
        }

        .footer-visit :global(.footer-map) {
          height: 170px;
          margin-bottom: 0.85rem;
        }

        .footer-address {
          white-space: pre-line;
          color: var(--text);
          font-size: var(--fs-sm);
          line-height: 1.55;
          margin-bottom: 0.85rem;
        }

        .logo {
          display: inline-flex;
          margin-bottom: 1rem;
        }

        .logo-img {
          height: 46px;
          width: auto;
          display: block;
        }

        .footer-desc {
          color: var(--muted);
          max-width: 380px;
          margin-top: 0.75rem;
          font-size: var(--fs-base);
          line-height: var(--lh-body);
        }

        .footer-social {
          display: flex;
          gap: 0.6rem;
          margin-top: 1rem;
        }

        .social-btn {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: #ffffff;
          border: 1px solid var(--border);
          color: var(--brand-navy);
          transition: all 0.25s ease;
        }

        .social-btn:hover {
          background: var(--blue);
          border-color: var(--blue);
          color: #ffffff;
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(6, 41, 110, 0.25);
        }

        /* Column headings: small UI headings, so the sans (not the Cormorant display serif) */
        .footer h3 {
          color: var(--heading);
          font-family: var(--font-inter);
          font-size: var(--fs-md);
          font-weight: 700;
          letter-spacing: 0;
          line-height: var(--lh-heading);
          margin-bottom: 1rem;
        }

        .footer-links ul {
          list-style: none;
        }

        .footer-links li {
          margin-bottom: 0.55rem;
        }

        /* These links are next/link components, which don't receive the styled-jsx
           scope class — hence :global(a) so the rules actually apply. */
        .footer-links :global(a) {
          color: var(--text);
          font-size: var(--fs-base);
        }

        .footer-links :global(a:hover) {
          color: var(--blue);
          padding-left: 5px;
        }

        .footer-contact p {
          color: var(--muted);
          font-size: var(--fs-base);
          margin-bottom: 0.5rem;
        }

        .footer-contact strong {
          color: var(--heading);
          font-weight: 700;
        }

        .footer-contact a {
          color: var(--blue);
          font-weight: 500;
          overflow-wrap: anywhere;
        }

        .footer-contact a:hover {
          text-decoration: underline;
        }

        .mt-4 {
          margin-top: 1rem;
        }

        .footer-bottom {
          border-top: 1px solid var(--border);
          padding: 1rem 0;
          text-align: center;
          color: var(--muted);
          font-size: var(--fs-sm);
        }
      `}</style>
    </footer>
  );
}
