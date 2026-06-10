export default function Loading() {
  return (
    <div className="container" style={{ padding: '7rem 1.5rem 4rem' }}>
      <div className="skeleton" style={{ height: 14, width: 260, maxWidth: '80%', marginBottom: 32 }} />
      <div className="prod-skel">
        <div className="skeleton" style={{ aspectRatio: '4/3' }} />
        <div>
          <div className="skeleton" style={{ height: 14, width: 120, marginBottom: 16 }} />
          <div className="skeleton" style={{ height: 38, width: '75%', marginBottom: 28 }} />
          <div className="skeleton" style={{ height: 13, marginBottom: 10 }} />
          <div className="skeleton" style={{ height: 13, width: '92%', marginBottom: 10 }} />
          <div className="skeleton" style={{ height: 13, width: '68%', marginBottom: 28 }} />
          <div className="skeleton" style={{ height: 48, borderRadius: 10, marginBottom: 12 }} />
          <div className="skeleton" style={{ height: 48, borderRadius: 10 }} />
        </div>
      </div>
    </div>
  );
}
