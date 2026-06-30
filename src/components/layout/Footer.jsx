'use client';
import Link from 'next/link';
import { Facebook, Instagram, Twitter, Linkedin, Whatsapp } from '@/components/ui/SocialIcons';

export default function Footer({ socials = {}, contact = {} }) {
  const currentYear = new Date().getFullYear();
  const email = contact.email || 'tanujdhawangp@gmail.com';
  const waNumber = (contact.whatsapp || '').replace(/[^0-9]/g, '');
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
              <img src="/brand/plan-a-day.png" alt="Plan.A.Day by Goodwill Printers" className="logo-img" />
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
              <a href={`mailto:${email}`}>{email}</a>
            </p>
            <div className="mt-4">
              <Link href="/contact" className="btn-secondary">Enquire Now</Link>
            </div>
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
        }

        @media (min-width: 1024px) {
          .footer-grid {
            grid-template-columns: 2fr 1fr 1fr 1fr;
          }
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
          max-width: 320px;
          margin-top: 0.75rem;
          font-size: 0.89rem;
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

        .footer h3 {
          color: var(--gold-light);
          font-family: var(--font-inter);
          font-size: 1.04rem;
          margin-bottom: 1rem;
        }

        .footer-links ul {
          list-style: none;
        }

        .footer-links li {
          margin-bottom: 0.55rem;
        }

        .footer-links a {
          color: var(--text-gray);
          font-size: 0.89rem;
        }

        .footer-links a:hover {
          color: var(--gold-accent);
          padding-left: 5px;
        }

        .footer-contact p {
          color: var(--text-gray);
          font-size: 0.89rem;
          margin-bottom: 0.5rem;
        }

        .footer-contact a {
          color: var(--gold-accent);
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
          font-size: 0.79rem;
        }
      `}</style>
    </footer>
  );
}
