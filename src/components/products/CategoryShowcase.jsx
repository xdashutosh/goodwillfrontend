import Link from 'next/link';
import { productThumb } from '@/lib/catalog';
import styles from './categoryShowcase.module.css';

const NAMES_SHOWN = 4;

/**
 * One card per category in a section: a three-image collage, size/format tags,
 * the design count and the first few design names ("Angola, Aruba, … +80 more"),
 * so a visitor can see at a glance what each format holds.
 *
 * `categories` comes from getSectionCatalog(). Each card links to the category
 * page (/{section}/{category}) — the one canonical URL for a category's list.
 */
export default function CategoryShowcase({ sectionSlug, categories = [], currentCategory = '', unit = 'designs' }) {
  if (!categories.length) return null;

  return (
    <div className={styles.grid}>
      {categories.map((c) => {
        const products = c.products || [];
        // Prefer featured designs for the collage, then fill in list order.
        const collage = [...products.filter((p) => p.is_featured), ...products.filter((p) => !p.is_featured)]
          .filter((p) => productThumb(p))
          .slice(0, 3);
        const names = products.slice(0, NAMES_SHOWN).map((p) => p.name);
        const more = c.product_count - names.length;
        const isCurrent = c.slug === currentCategory;

        return (
          <Link
            key={c.slug}
            href={`/${sectionSlug}/${c.slug}`}
            className={`${styles.card} ${isCurrent ? styles.current : ''}`}
            aria-current={isCurrent ? 'true' : undefined}
          >
            <div className={styles.collage} data-count={collage.length}>
              {collage.length > 0 ? (
                collage.map((p) => (
                  <span key={p.id} className={styles.tile}>
                    <img src={productThumb(p)} alt="" loading="lazy" />
                  </span>
                ))
              ) : (
                <span className={styles.tileEmpty}>{c.name}</span>
              )}
              {isCurrent && <span className={styles.here}>You&apos;re viewing</span>}
            </div>

            <div className={styles.body}>
              {(c.size_label || c.type_label) && (
                <div className={styles.tags}>
                  {c.size_label && <span className={styles.tag}>{c.size_label}</span>}
                  {c.type_label && <span className={styles.tag}>{c.type_label}</span>}
                </div>
              )}
              <h3 className={styles.name}>{c.name}</h3>
              <p className={styles.count}>
                {c.product_count} {c.product_count === 1 ? unit.replace(/s$/, '') : unit}
              </p>
              {names.length > 0 && (
                <p className={styles.names}>
                  {names.join(', ')}
                  {more > 0 && <span className={styles.more}> +{more} more</span>}
                </p>
              )}
              <span className={styles.cta}>
                Browse {c.name}
                <span className={styles.arrow} aria-hidden="true">→</span>
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
