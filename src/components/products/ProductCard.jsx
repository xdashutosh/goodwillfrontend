import Link from 'next/link';
import { productThumb } from '@/lib/catalog';
import styles from './productCard.module.css';

/**
 * Product tile used by the catalog grid and the related-products rows.
 * Hook-free so it renders from both server and client components.
 * Accepts either a full product row (images[]) or a slim catalog row (thumbnail_url).
 */
export default function ProductCard({ product, eyebrow, badge, compact = false }) {
  const thumb = productThumb(product);

  return (
    <Link href={`/product/${product.slug}`} className={`${styles.card} ${compact ? styles.compact : ''}`}>
      <div className={styles.media}>
        {thumb ? (
          <img src={thumb} alt={product.name} loading="lazy" className={styles.img} />
        ) : (
          <span className={styles.noImg}>Image coming soon</span>
        )}
        {badge && <span className={styles.badge}>{badge}</span>}
      </div>
      <div className={styles.body}>
        {eyebrow && <span className={styles.eyebrow}>{eyebrow}</span>}
        <h3 className={styles.title}>{product.name}</h3>
        <span className={styles.cta}>
          View details<span className={styles.arrow} aria-hidden="true">→</span>
        </span>
      </div>
    </Link>
  );
}
