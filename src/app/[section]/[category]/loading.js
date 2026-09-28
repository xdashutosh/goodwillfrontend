import CatalogSkeleton from '@/components/products/CatalogSkeleton';

export default function Loading() {
  return (
    <>
      <section style={{ background: 'var(--bg-alt)', borderBottom: '1px solid var(--border)', padding: '1.25rem 0 1.5rem' }}>
        <div className="container">
          <div className="skeleton" style={{ height: 13, width: 200, marginBottom: 24 }} />
          <div className="skeleton" style={{ height: 42, width: 240, maxWidth: '80%', marginBottom: 14 }} />
          <div className="skeleton" style={{ height: 15, width: 560, maxWidth: '95%', marginBottom: 24 }} />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 36, width: 120, borderRadius: 999 }} />
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
