'use client';
import Link from 'next/link';

// Route-segment error boundary. When a page throws (e.g. a sustained backend
// outage after fetchJson exhausts its retries), degrade gracefully instead of
// falling through to the framework default 500 page.
export default function Error({ reset }) {
  return (
    <div className="container section-padding text-center">
      <h1>Something went wrong</h1>
      <p style={{ margin: '1rem 0 2rem', color: 'var(--text-gray)' }}>
        We hit a temporary problem loading this page. Please try again in a moment.
      </p>
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button className="btn-primary" onClick={() => reset()}>Try again</button>
        <Link href="/" className="btn-secondary">Go home</Link>
      </div>
    </div>
  );
}
