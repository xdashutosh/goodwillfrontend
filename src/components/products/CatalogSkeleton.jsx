import ProductCard from './ProductCard';

/**
 * Placeholder for ProductCatalog while it loads (the Suspense fallback on the
 * section, category and /products pages). Mirrors the catalog layout.
 *
 * With `initial` ({ products, pagination }) it renders the real first page of
 * products instead of grey cards — so the server HTML already lists them (for
 * search engines and slow connections) and nothing shifts when the interactive
 * catalog takes over.
 *  - eyebrow: 'category' (category name), 'full' (section · category) or 'none'
 *  - sidebar: whether the catalog will show its filter sidebar
 */
export default function CatalogSkeleton({ initial = null, unit = 'products', eyebrow = 'full', sidebar = true }) {
  const products = initial?.products || [];
  const total = initial?.pagination?.total || 0;

  return (
    <div className="catalog-skel" style={sidebar ? undefined : { gridTemplateColumns: 'minmax(0, 1fr)' }}>
      {sidebar && (
        <aside className="glass-card catalog-skel-side" style={{ padding: '1.2rem' }}>
          <div className="skeleton" style={{ height: 20, width: '45%', marginBottom: '1.25rem' }} />
          <div className="skeleton" style={{ height: 40, width: '100%', marginBottom: '1.5rem' }} />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 14, width: `${70 - i * 6}%`, marginBottom: 14 }} />
          ))}
        </aside>
      )}

      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.9rem', marginBottom: '1rem', borderBottom: '1px solid var(--border)', gap: '1rem', flexWrap: 'wrap', minHeight: 52 }}>
          {products.length ? (
            <p style={{ margin: 0, fontSize: 'var(--fs-base)', color: 'var(--text)' }}>
              Showing <strong style={{ color: 'var(--heading)' }}>1–{products.length}</strong> of{' '}
              <strong style={{ color: 'var(--heading)' }}>{total}</strong> {total === 1 ? unit.replace(/s$/, '') : unit}
            </p>
          ) : (
            <div className="skeleton" style={{ height: 14, width: 200 }} />
          )}
          <div className="skeleton" style={{ height: 36, width: 190 }} />
        </div>

        {products.length ? (
          <div className="catalog-skel-grid">
            {products.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                eyebrow={eyebrow === 'none' ? null : eyebrow === 'category' ? p.category_name : `${p.section_name} · ${p.category_name}`}
              />
            ))}
          </div>
        ) : (
          <div className="catalog-skel-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="glass-card" style={{ overflow: 'hidden' }}>
                <div className="skeleton" style={{ aspectRatio: '1 / 1', borderRadius: 0 }} />
                <div style={{ padding: '0.9rem 1rem 1rem' }}>
                  <div className="skeleton" style={{ height: 10, width: '45%', marginBottom: 10 }} />
                  <div className="skeleton" style={{ height: 18, width: '80%', marginBottom: 14 }} />
                  <div className="skeleton" style={{ height: 12, width: '40%' }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
