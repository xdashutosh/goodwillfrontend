import Link from 'next/link';

// Global 404 UI, served by notFound() in the section/category/product pages.
export default function NotFound() {
  return (
    <div className="section-padding">
      <div className="container text-center">
        <h1>Page Not Found</h1>
        <p style={{ margin: '1rem auto 2rem', maxWidth: '640px', color: 'var(--muted)', fontSize: 'var(--fs-md)' }}>
          The page you are looking for does not exist or has been moved.
        </p>
        <Link href="/" className="btn-primary">Back to Home</Link>
      </div>
    </div>
  );
}
