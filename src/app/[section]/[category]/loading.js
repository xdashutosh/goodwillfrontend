export default function Loading() {
  return (
    <>
      <section className="hero" style={{ minHeight: '32vh', maxHeight: '360px' }}>
        <div className="container">
          <div className="skeleton" style={{ height: 42, width: 280, maxWidth: '80%', margin: '0 auto 1rem' }} />
          <div className="skeleton" style={{ height: 16, width: 380, maxWidth: '90%', margin: '0 auto' }} />
        </div>
      </section>
      <section className="section-padding">
        <div className="container">
          <div className="skel-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="glass-card" style={{ overflow: 'hidden' }}>
                <div className="skeleton" style={{ aspectRatio: '1/1', borderRadius: 0 }} />
                <div style={{ padding: '1.5rem' }}>
                  <div className="skeleton" style={{ height: 12, width: '50%', marginBottom: 12 }} />
                  <div className="skeleton" style={{ height: 18, width: '80%' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
