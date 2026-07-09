import styles from './productContent.module.css';

/**
 * Full product-details block shown below the gallery/buy-box.
 * Reads product.description (top-level) + product.content (JSONB):
 *   { goodPoints[], unique, quality, specifications[{label,value}] }
 * Server-rendered; every field is coerced defensively so malformed/partial
 * JSONB can never crash the page.
 */
export default function ProductContent({ product }) {
  const content = product?.content && typeof product.content === 'object' ? product.content : {};

  const description = typeof product?.description === 'string' ? product.description.trim() : '';
  const descParas = description ? description.split(/\n\n+/).filter(Boolean) : [];

  const goodPoints = Array.isArray(content.goodPoints)
    ? content.goodPoints.filter((p) => typeof p === 'string' && p.trim())
    : [];
  const specifications = Array.isArray(content.specifications)
    ? content.specifications
        .filter((s) => s && typeof s === 'object')
        .map((s) => ({ label: typeof s.label === 'string' ? s.label : '', value: typeof s.value === 'string' ? s.value : '' }))
        .filter((s) => s.label || s.value)
    : [];
  const unique = typeof content.unique === 'string' ? content.unique.trim() : '';
  const quality = typeof content.quality === 'string' ? content.quality.trim() : '';

  const hasMain = descParas.length || goodPoints.length || unique || quality;
  if (!hasMain && !specifications.length) return null;

  return (
    <section className={`section-padding ${styles.wrap}`} aria-label={`Details for ${product.name}`}>
      <div className="container">
        <h2 className={styles.sectionTitle}>Product details</h2>

        <div className={styles.grid}>
          <div className={styles.main}>
            {(descParas.length > 0 || quality) && (
              <div className={styles.overview}>
                {descParas.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
                {quality && <p>{quality}</p>}
              </div>
            )}

            {goodPoints.length > 0 && (
              <div className={styles.block}>
                <h3>Highlights</h3>
                <ul className={styles.points}>
                  {goodPoints.map((p, i) => (
                    <li key={i}>
                      <span className={styles.tick} aria-hidden="true">✓</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {unique && (
              <div className={`${styles.block} ${styles.unique}`}>
                <h3>What makes it unique</h3>
                <p>{unique}</p>
              </div>
            )}
          </div>

          {specifications.length > 0 && (
            <aside className={`glass-card ${styles.specs}`}>
              <h3>Specifications</h3>
              <dl>
                {specifications.map((s, i) => (
                  <div key={i} className={styles.specRow}>
                    <dt>{s.label}</dt>
                    <dd>{s.value}</dd>
                  </div>
                ))}
              </dl>
            </aside>
          )}
        </div>
      </div>
    </section>
  );
}
