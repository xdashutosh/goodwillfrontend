import styles from './productContent.module.css';

/**
 * Renders the rich per-product detail stored on product.content (JSONB):
 *   { goodPoints[], unique, quality, specifications[{label,value}] }
 * Server-rendered. Every field is coerced defensively so a malformed/partial
 * JSONB row (e.g. hand-edited via the admin panel) can never crash the page.
 */
export default function ProductContent({ product }) {
  const content = product?.content;
  if (!content || typeof content !== 'object') return null;

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

  if (!goodPoints.length && !specifications.length && !unique && !quality) return null;

  return (
    <section className={`section-padding ${styles.wrap}`} aria-label={`Details for ${product.name}`}>
      <div className="container">
        <h2 className={styles.sectionTitle}>Why choose the {product.name}</h2>

        <div className={styles.grid}>
          <div className={styles.main}>
            {goodPoints.length > 0 && (
              <div className={styles.block}>
                <h3>Good points</h3>
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

            {quality && (
              <div className={styles.block}>
                <h3>Quality &amp; finish</h3>
                <p>{quality}</p>
              </div>
            )}
          </div>

          {specifications.length > 0 && (
            <aside className={`glass-card ${styles.specs}`}>
              <h3>Specifications</h3>
              <dl>
                {specifications.map((s, i) => (
                  <div key={i} className={styles.specRow}>
                    <dt>{s?.label}</dt>
                    <dd>{s?.value}</dd>
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
