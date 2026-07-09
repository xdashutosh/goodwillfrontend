'use client';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import styles from './VideoShowcase.module.css';

// Each clip is tagged with a collection (section), so the reel doubles as
// navigation — tap a card to open that section's page. Videos live in
// /public/videos; the tag thumbnail is the section's collection artwork from
// /public/collections. Edit the pairing / order here.
const CARDS = [
  {
    src: '/videos/video1.mp4',
    name: 'Diaries',
    tagline: 'Premium New Year diaries',
    slug: 'diaries',
    thumb: '/collections/diaries.png',
  },
  {
    src: '/videos/video2.mp4',
    name: 'Notebooks',
    tagline: 'Notebooks & folders',
    slug: 'notebooks',
    thumb: '/collections/notebooks.png',
  },
  {
    src: '/videos/video3.mp4',
    name: 'Organizers',
    tagline: 'Professional organizers',
    slug: 'organizers',
    thumb: '/collections/organizers.png',
  },
  {
    src: '/videos/video4.mp4',
    name: 'Corporate Gifts',
    tagline: 'Premium corporate gifting',
    slug: 'corporate-gifts',
    thumb: '/collections/corporate-gifts.png',
  },
];

/**
 * A video wall — all four clips shown together, each autoplaying and looping so
 * every video is always running. Each card links to its collection (section).
 */
export default function VideoShowcase() {
  return (
    <div className={styles.showcase}>
      <div className={styles.grid}>
        {CARDS.map((card) => (
          <Link
            key={card.slug}
            href={`/${card.slug}`}
            className={styles.card}
            aria-label={`${card.name} — view collection`}
          >
            <video
              className={styles.video}
              src={card.src}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              tabIndex={-1}
            />
            <span className={styles.shade} aria-hidden="true" />

            <span className={styles.product}>
              <img className={styles.thumb} src={card.thumb} alt="" loading="lazy" />
              <span className={styles.meta}>
                <span className={styles.name}>{card.name}</span>
                <span className={styles.tagline}>{card.tagline}</span>
              </span>
              <ArrowRight size={16} className={styles.cta} />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
