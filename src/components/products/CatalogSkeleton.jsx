// Full catalog skeleton — mirrors the ProductCatalog layout (filter sidebar + product grid).
// Used as the Suspense fallback on /products and category pages.
export default function CatalogSkeleton() {
  return (
    <div className="catalog-skel">
      {/* Filter sidebar */}
      <aside className="glass-card" style={{ padding: '1.5rem' }}>
        <div className="skeleton" style={{ height: 20, width: '55%', marginBottom: '1.5rem' }} />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={{ marginBottom: '1.5rem' }}>
            <div className="skeleton" style={{ height: 12, width: 80, marginBottom: 10 }} />
            <div className="skeleton" style={{ height: 40, width: '100%' }} />
          </div>
        ))}
      </aside>

      {/* Main content */}
      <div>
        <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', marginBottom: '2rem', gap: '1rem', flexWrap: 'wrap' }}>
          <div className="skeleton" style={{ height: 14, width: 180 }} />
          <div className="skeleton" style={{ height: 34, width: 220 }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1.25rem' }}>
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="glass-card" style={{ overflow: 'hidden' }}>
              <div className="skeleton" style={{ aspectRatio: '1 / 1', borderRadius: 0 }} />
              <div style={{ padding: '0.9rem' }}>
                <div className="skeleton" style={{ height: 11, width: '55%', marginBottom: 10 }} />
                <div className="skeleton" style={{ height: 16, width: '85%', marginBottom: 14 }} />
                <div className="skeleton" style={{ height: 32, width: '100%' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
