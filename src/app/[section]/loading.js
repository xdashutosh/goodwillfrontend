export default function Loading() {
  return (
    <>
      <section className="hero" style={{ minHeight: '40vh' }}>
        <div className="container">
          <div className="skeleton" style={{ height: 46, width: 300, maxWidth: '80%', margin: '0 auto 1rem' }} />
          <div className="skeleton" style={{ height: 16, width: 420, maxWidth: '90%', margin: '0 auto' }} />
        </div>
      </section>
      <section className="section-padding">
        <div className="container">
          <div className="skel-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass-card" style={{ padding: '2rem' }}>
                <div className="skeleton" style={{ height: 22, width: '60%', marginBottom: 14 }} />
                <div className="skeleton" style={{ height: 14, width: '90%', marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 14, width: '70%' }} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
