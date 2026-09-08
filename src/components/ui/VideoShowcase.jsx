'use client';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import styles from './VideoShowcase.module.css';

function VideoCard({ card, cloneIndex }) {
  const inner = (
    <>
      <video
        className={styles.video}
        src={card.src}
        poster={card.thumb || undefined}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        tabIndex={-1}
      />
      <span className={styles.shade} aria-hidden="true" />
      <span className={styles.product}>
        {card.thumb && <img className={styles.thumb} src={card.thumb} alt="" loading="lazy" />}
        <span className={styles.meta}>
          <span className={styles.name}>{card.name}</span>
          {card.tagline && <span className={styles.tagline}>{card.tagline}</span>}
        </span>
        <ArrowRight size={16} className={styles.cta} />
      </span>
    </>
  );

  return (
    <div className={styles.cardWrapper}>
      {card.href ? (
        <Link
          href={card.href}
          className={styles.card}
          aria-label={`${card.name} — view collection`}
          tabIndex={cloneIndex !== undefined ? -1 : 0}
        >
          {inner}
        </Link>
      ) : (
        <div className={styles.card}>{inner}</div>
      )}
    </div>
  );
}

export default function VideoShowcase({ videos }) {
  const cards = (Array.isArray(videos) ? videos : [])
    .filter((v) => v && v.url)
    .map((v) => ({
      id: v.slot || `asset-${v.id}`,
      src: v.url,
      thumb: v.thumbnail_url || '',
      name: v.title || '',
      tagline: v.subtitle || '',
      href: v.link || '',
    }));

  if (cards.length === 0) return null;

  return (
    <div className={styles.showcase}>
      <div className={styles.carouselContainer}>
        {/* Track is rendered twice — second copy ensures a seamless infinite loop */}
        <div className={styles.track}>
          {cards.map((card) => (
            <VideoCard key={card.id} card={card} />
          ))}
          {/* Clone set — aria-hidden so screen readers skip duplicates */}
          <div className={styles.cloneGroup} aria-hidden="true">
            {cards.map((card) => (
              <VideoCard key={`clone-${card.id}`} card={card} cloneIndex={1} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
