'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Phone, Mail, ChevronDown, Menu, X } from 'lucide-react';
import { Facebook, Instagram, Twitter, Linkedin, Whatsapp } from '@/components/ui/SocialIcons';
import styles from './Header.module.css';

export default function Header({ navData }) {
  const sections = navData?.sections || [];
  const contact = navData?.contact || {};
  const socials = navData?.socials || {};

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openSection, setOpenSection] = useState(null);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close the mobile menu whenever the route changes.
  useEffect(() => {
    setMobileOpen(false);
    setOpenSection(null);
  }, [pathname]);

  const isActive = (path) => pathname === path;
  const inSection = (slug) => pathname === `/${slug}` || pathname.startsWith(`/${slug}/`);
  const telHref = contact.phone ? `tel:${contact.phone.replace(/[^0-9+]/g, '')}` : null;
  const waNumber = (contact.whatsapp || '').replace(/[^0-9]/g, '');

  const socialLinks = [
    { Icon: Facebook, url: socials.facebook, label: 'Facebook' },
    { Icon: Instagram, url: socials.instagram, label: 'Instagram' },
    { Icon: Twitter, url: socials.twitter, label: 'X (Twitter)' },
    { Icon: Linkedin, url: socials.linkedin, label: 'LinkedIn' },
    ...(waNumber ? [{ Icon: Whatsapp, url: `https://wa.me/${waNumber}`, label: 'WhatsApp' }] : []),
  ];

  return (
    <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
      {/* Tier 1 — utility bar */}
      <div className={styles.topbar}>
        <div className={`container ${styles.topbarInner}`}>
          <div className={styles.topbarGroup}>
            {telHref && (
              <a href={telHref} className={styles.tbLink}><Phone size={13} /> {contact.phone}</a>
            )}
            {contact.email && (
              <a href={`mailto:${contact.email}`} className={styles.tbLink}><Mail size={13} /> {contact.email}</a>
            )}
          </div>
          <div className={styles.topbarGroup}>
            <span className={styles.tbNote}>Follow us</span>
            <div className={styles.socials}>
              {socialLinks.map(({ Icon, url, label }) => (
                <a
                  key={label}
                  href={url || '#'}
                  className={styles.socialLink}
                  aria-label={label}
                  {...(url ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tier 2 — main navigation */}
      <div className={styles.mainnav}>
        <div className={`container ${styles.mainnavInner}`}>
          <Link href="/" className={styles.logo} aria-label="Goodwill Printers — Home">
            <img src="/brand/goodwill-printers.png" alt="Goodwill Printers" className={styles.logoImg} />
          </Link>

          <nav className={styles.desktopNav} aria-label="Primary">
            <Link href="/" className={`${styles.navLink} ${isActive('/') ? styles.active : ''}`}>Home</Link>

            {sections.map((s) => (
              <div key={s.slug} className={`${styles.navItem} ${s.categories.length ? styles.hasDropdown : ''}`}>
                <Link href={`/${s.slug}`} className={`${styles.navLink} ${inSection(s.slug) ? styles.active : ''}`}>
                  {s.name}
                  {s.categories.length > 0 && <ChevronDown size={14} className={styles.caret} />}
                </Link>

                {s.categories.length > 0 && (
                  <div className={styles.dropdown}>
                    <div className={styles.dropdownCard}>
                      <div className={styles.dropdownGrid}>
                        {s.categories.map((c) => (
                          <Link key={c.slug} href={`/${s.slug}/${c.slug}`} className={styles.ddLink}>{c.name}</Link>
                        ))}
                      </div>
                      <Link href={`/${s.slug}`} className={styles.ddAll}>View all {s.name} →</Link>
                    </div>
                  </div>
                )}
              </div>
            ))}

            <Link href="/about" className={`${styles.navLink} ${isActive('/about') ? styles.active : ''}`}>About Us</Link>
            <Link href="/contact" className={`btn-primary ${styles.navBtn}`}>Enquire Now</Link>
          </nav>

          <button
            className={styles.mobileMenuBtn}
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div className={`${styles.mobileDrawer} ${mobileOpen ? styles.open : ''}`}>
        <Link href="/" className={`${styles.mLink} ${isActive('/') ? styles.active : ''}`}>Home</Link>

        {sections.map((s) => (
          <div key={s.slug}>
            {s.categories.length > 0 ? (
              <>
                <button
                  className={styles.mSectionHead}
                  onClick={() => setOpenSection((o) => (o === s.slug ? null : s.slug))}
                  aria-expanded={openSection === s.slug}
                >
                  <span className={inSection(s.slug) ? styles.active : ''}>{s.name}</span>
                  <ChevronDown size={16} className={`${styles.caret} ${openSection === s.slug ? styles.caretOpen : ''}`} />
                </button>
                {openSection === s.slug && (
                  <div className={styles.mSublist}>
                    <Link href={`/${s.slug}`} className={`${styles.mSublink} ${styles.strong}`}>All {s.name}</Link>
                    {s.categories.map((c) => (
                      <Link key={c.slug} href={`/${s.slug}/${c.slug}`} className={styles.mSublink}>{c.name}</Link>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <Link href={`/${s.slug}`} className={`${styles.mLink} ${inSection(s.slug) ? styles.active : ''}`}>{s.name}</Link>
            )}
          </div>
        ))}

        <Link href="/about" className={`${styles.mLink} ${isActive('/about') ? styles.active : ''}`}>About Us</Link>
        <Link href="/contact" className={`btn-primary ${styles.mCta}`}>Enquire Now</Link>

        <div className={styles.mContact}>
          {telHref && <a href={telHref}><Phone size={14} /> {contact.phone}</a>}
          {contact.email && <a href={`mailto:${contact.email}`}><Mail size={14} /> {contact.email}</a>}
        </div>
      </div>
    </header>
  );
}
