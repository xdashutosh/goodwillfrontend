export default function Loading() {
  return (
    <div className="container" style={{ maxWidth: 1320, padding: '1.5rem 1.5rem 4rem' }}>
      <div className="skeleton" style={{ height: 14, width: 280, maxWidth: '80%', marginBottom: 24 }} />
      <div className="prod-skel">
        {/* Browse panel */}
        <div className="glass-card prod-skel-side" style={{ padding: '1rem' }}>
          <div className="skeleton" style={{ height: 20, width: '60%', marginBottom: 16 }} />
          <div className="skeleton" style={{ height: 36, marginBottom: 16 }} />
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 }}>
              <div className="skeleton" style={{ width: 34, height: 34, flexShrink: 0 }} />
              <div className="skeleton" style={{ height: 12, width: `${75 - (i % 4) * 10}%` }} />
            </div>
          ))}
        </div>
        {/* Gallery */}
        <div className="skeleton" style={{ aspectRatio: '1 / 1', maxWidth: 480 }} />
        {/* Buy box */}
        <div>
          <div className="skeleton" style={{ height: 22, width: 150, marginBottom: 16 }} />
          <div className="skeleton" style={{ height: 42, width: '60%', marginBottom: 14 }} />
          <div className="skeleton" style={{ height: 14, width: '80%', marginBottom: 24 }} />
          <div className="skeleton" style={{ height: 150, borderRadius: 12, marginBottom: 24 }} />
          <div className="skeleton" style={{ height: 60, marginBottom: 24 }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div className="skeleton" style={{ height: 48 }} />
            <div className="skeleton" style={{ height: 48 }} />
          </div>
        </div>
      </div>
    </div>
  );
}
