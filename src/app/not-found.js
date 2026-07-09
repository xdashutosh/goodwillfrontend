import Link from 'next/link';

// Global 404 UI, served by notFound() in the section/category/product pages.
export default function NotFound() {
  return (
    <div className="container section-padding text-center">
      <h1>Page Not Found</h1>
      <p style={{ margin: '1rem 0 2rem', color: 'var(--text-gray)' }}>
        The page you are looking for does not exist or has been moved.
      </p>
      <Link href="/" className="btn-primary">Back to Home</Link>
    </div>
  );
}
