import CatalogSkeleton from '@/components/products/CatalogSkeleton';

export default function Loading() {
  return (
    <>
      <section style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '1.25rem 0 2rem' }}>
        <div className="container">
          <div className="skeleton" style={{ height: 13, width: 140, marginBottom: 24 }} />
          <div className="skeleton" style={{ height: 44, width: 260, maxWidth: '80%', marginBottom: 14 }} />
          <div className="skeleton" style={{ height: 15, width: 520, maxWidth: '95%' }} />
        </div>
      </section>
      <section style={{ padding: '2.75rem 0 1rem' }}>
        <div className="container">
          <div className="skeleton" style={{ height: 28, width: 220, marginBottom: 20 }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '1.25rem' }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="glass-card" style={{ overflow: 'hidden' }}>
                <div className="skeleton" style={{ aspectRatio: '3 / 2', borderRadius: 0 }} />
                <div style={{ padding: '1rem' }}>
                  <div className="skeleton" style={{ height: 20, width: '55%', marginBottom: 10 }} />
                  <div className="skeleton" style={{ height: 12, width: '85%' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="section-padding">
        <div className="container">
          <CatalogSkeleton />
        </div>
      </section>
    </>
  );
}
