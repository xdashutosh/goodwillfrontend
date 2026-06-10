import { Suspense } from 'react';
import ProductCatalog from '@/components/products/ProductCatalog';
import CatalogSkeleton from '@/components/products/CatalogSkeleton';

export const metadata = {
  title: 'Our Collection',
  description: 'Browse the full Goodwill Printers collection of premium diaries, notebooks, organizers, and corporate gifts.',
  alternates: { canonical: '/products' },
};

export default function ProductsPage() {
  return (
    <>
      <section className="hero" style={{ minHeight: '30vh' }}>
        <div className="container">
          <h1>Our Collection</h1>
          <p>Discover our range of premium corporate stationery and gifts</p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container">
          <Suspense fallback={<CatalogSkeleton />}>
            <ProductCatalog />
          </Suspense>
        </div>
      </section>
    </>
  );
}
