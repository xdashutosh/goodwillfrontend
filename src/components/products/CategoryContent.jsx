import styles from './categoryContent.module.css';

/**
 * Renders the rich "data breakdown" stored on category.content (JSONB):
 *   { intro, highlights[], specifications[{label,value}], useCases[], faqs[{q,a}] }
 * Server-rendered; FAQs use native <details> so no client JS is needed.
 * Renders nothing if the category has no content yet.
 *
 * content is a freeform JSONB column, so every field is coerced defensively —
 * an explicit null or non-array value must never crash this server component.
 */
export default function CategoryContent({ category }) {
  const content = category?.content;
  if (!content || typeof content !== 'object') return null;

  const intro = typeof content.intro === 'string' ? content.intro : '';
  const highlights = Array.isArray(content.highlights)
    ? content.highlights.filter((h) => typeof h === 'string' && h.trim())
    : [];
  const specifications = Array.isArray(content.specifications)
    ? content.specifications
        .filter((s) => s && typeof s === 'object')
        .map((s) => ({ label: typeof s.label === 'string' ? s.label : '', value: typeof s.value === 'string' ? s.value : '' }))
        .filter((s) => s.label || s.value)
    : [];
  const useCases = Array.isArray(content.useCases)
    ? content.useCases.filter((u) => typeof u === 'string' && u.trim())
    : [];
  const faqs = Array.isArray(content.faqs)
    ? content.faqs
        .filter((f) => f && typeof f === 'object')
        .map((f) => ({ q: typeof f.q === 'string' ? f.q : '', a: typeof f.a === 'string' ? f.a : '' }))
        .filter((f) => f.q || f.a)
    : [];

  // Split the intro into paragraphs on blank lines.
  const introParas = intro.split(/\n\n+/).filter(Boolean);

  const hasAnything =
    introParas.length || highlights.length || specifications.length || useCases.length || faqs.length;
  if (!hasAnything) return null;

  return (
    <section className={`section-padding ${styles.wrap}`} aria-label={`About ${category.name}`}>
      <div className="container">
        {/* Single section heading so the hierarchy is always h1 (page) -> h2 -> h3 */}
        <h2 className={styles.sectionTitle}>About {category.name}</h2>

        <div className={styles.grid}>
          {/* Intro + highlights */}
          <div className={styles.main}>
            {introParas.length > 0 && (
              <div className={styles.intro}>
                {introParas.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            )}

            {highlights.length > 0 && (
              <div className={styles.highlights}>
                <h3>Key highlights</h3>
                <ul>
                  {highlights.map((h, i) => (
                    <li key={i}>
                      <span className={styles.tick} aria-hidden="true">✓</span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {useCases.length > 0 && (
              <div className={styles.useCases}>
                <h3>Ideal for</h3>
                <div className={styles.chips}>
                  {useCases.map((u, i) => (
                    <span key={i} className={styles.chip}>
                      {u}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Specifications */}
          {specifications.length > 0 && (
            <aside className={`glass-card ${styles.specs}`}>
              <h3>At a glance</h3>
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

        {/* FAQs */}
        {faqs.length > 0 && (
          <div className={styles.faqs}>
            <h3>Frequently asked questions</h3>
            <div className={styles.faqList}>
              {faqs.map((f, i) => (
                <details key={i} className={`glass-card ${styles.faq}`}>
                  <summary>{f?.q}</summary>
                  <p>{f?.a}</p>
                </details>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
