'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { API_BASE } from '@/lib/api';

export default function ProductCatalog({ lockedSection = '', lockedCategory = '', basePath = '/products' }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [filters, setFilters] = useState({ sizes: [], types: [], coverStyles: [], categories: [] });
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [view, setView] = useState('grid'); // grid or list

  // Current active filters from URL (locked props take precedence)
  const activeSection = lockedSection || searchParams.get('section') || '';
  const activeCategory = lockedCategory || searchParams.get('category') || '';
  const activeSize = searchParams.get('size') || '';
  const activeType = searchParams.get('type') || '';
  const activeCover = searchParams.get('coverStyle') || '';
  const activeSearch = searchParams.get('search') || '';
  const activeSort = searchParams.get('sort') || 'newest';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  // Whether any user-controllable filter/search is currently applied
  const hasActiveFilters = ['size', 'type', 'coverStyle', 'search', 'page'].some(
    (k) => searchParams.get(k)
  ) || (!lockedSection && !!searchParams.get('section'))
    || (!lockedCategory && !!searchParams.get('category'));

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: currentPage,
        sort: activeSort,
      });
      if (activeSection) query.append('section', activeSection);
      if (activeCategory) query.append('category', activeCategory);
      if (activeSize) query.append('size', activeSize);
      if (activeType) query.append('type', activeType);
      if (activeCover) query.append('coverStyle', activeCover);
      if (activeSearch) query.append('search', activeSearch);

      const res = await fetch(`${API_BASE}/api/products?${query.toString()}`);
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();

      setLoadError(false);
      setProducts(data.products || []);
      setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
      if (data.filters) {
        setFilters(data.filters);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setProducts([]);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, [activeSection, activeCategory, activeSize, activeType, activeCover, activeSearch, activeSort, currentPage]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const updateFilter = (key, value) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // Reset to page 1 on filter change
    if (key !== 'page') params.set('page', '1');

    const qs = params.toString();
    router.push(qs ? `${basePath}?${qs}` : basePath);
  };

  const clearFilters = () => {
    router.push(basePath);
  };

  // Changing the section also clears any category selection, since the category
  // options are scoped to the selected section (a stale category would yield 0 results).
  const updateSection = (value) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set('section', value);
    else params.delete('section');
    params.delete('category');
    params.set('page', '1');
    const qs = params.toString();
    router.push(qs ? `${basePath}?${qs}` : basePath);
  };

  return (
    <div className="catalog-container">
      {/* Sidebar Filters */}
      <aside className="sidebar glass-card">
        <h3>Filters</h3>
        {hasActiveFilters && (
          <button onClick={clearFilters} className="clear-btn">Clear All</button>
        )}

        {!lockedSection && (
          <div className="filter-group">
            <h4>Section</h4>
            <select value={activeSection} onChange={(e) => updateSection(e.target.value)}>
              <option value="">All Sections</option>
              <option value="diaries">Diaries</option>
              <option value="notebooks">Notebooks</option>
              <option value="organizers">Organizers</option>
              <option value="corporate-gifts">Corporate Gifts</option>
            </select>
          </div>
        )}

        {!lockedCategory && filters.categories && filters.categories.length > 0 && (
          <div className="filter-group">
            <h4>Category</h4>
            <select value={activeCategory} onChange={(e) => updateFilter('category', e.target.value)}>
              <option value="">All Categories</option>
              {filters.categories.map(cat => (
                <option key={cat.slug} value={cat.slug}>{cat.name}{typeof cat.count === 'number' ? ` (${cat.count})` : ''}</option>
              ))}
            </select>
          </div>
        )}

        {filters.sizes && filters.sizes.length > 0 && (
          <div className="filter-group">
            <h4>Size</h4>
            <select value={activeSize} onChange={(e) => updateFilter('size', e.target.value)}>
              <option value="">All Sizes</option>
              {filters.sizes.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
        )}

        {filters.types && filters.types.length > 0 && (
          <div className="filter-group">
            <h4>Type</h4>
            <select value={activeType} onChange={(e) => updateFilter('type', e.target.value)}>
              <option value="">All Types</option>
              {filters.types.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        )}

        {filters.coverStyles && filters.coverStyles.length > 0 && (
          <div className="filter-group">
            <h4>Cover Style</h4>
            <select value={activeCover} onChange={(e) => updateFilter('coverStyle', e.target.value)}>
              <option value="">All Styles</option>
              {filters.coverStyles.map(style => (
                <option key={style} value={style}>{style}</option>
              ))}
            </select>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div className="main-content">
        <div className="catalog-header glass-card">
          <div className="results-info">
            Showing {products.length} of {pagination.total} products
          </div>
          <div className="catalog-controls">
            <select value={activeSort} onChange={(e) => updateFilter('sort', e.target.value)} className="sort-select">
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name_asc">Name A-Z</option>
              <option value="name_desc">Name Z-A</option>
            </select>
            <div className="view-toggle">
              <button className={view === 'grid' ? 'active' : ''} onClick={() => setView('grid')}>Grid</button>
              <button className={view === 'list' ? 'active' : ''} onClick={() => setView('list')}>List</button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="products-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="product-card glass-card">
                <div className="skeleton" style={{ aspectRatio: '1/1', borderRadius: 0 }} />
                <div style={{ padding: '1.5rem' }}>
                  <div className="skeleton" style={{ height: 12, width: '55%', marginBottom: 12 }} />
                  <div className="skeleton" style={{ height: 20, width: '85%', marginBottom: 18 }} />
                  <div className="skeleton" style={{ height: 38, width: '100%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : loadError ? (
          <div className="no-results glass-card">
            <h3>Unable to load products</h3>
            <p>We couldn&apos;t reach the catalog right now. Please try again in a moment.</p>
            <button onClick={fetchProducts} className="btn-secondary" style={{ marginTop: '1rem' }}>Retry</button>
          </div>
        ) : products.length === 0 ? (
          <div className="no-results glass-card">
            <h3>No products found</h3>
            <p>Try adjusting your filters or search criteria.</p>
            <button onClick={clearFilters} className="btn-secondary" style={{ marginTop: '1rem' }}>Clear Filters</button>
          </div>
        ) : (
          <div className={`products-${view}`}>
            {products.map(product => (
              <div key={product.id} className="product-card glass-card">
                <Link href={`/product/${product.slug}`} className="product-img-wrap">
                  {product.images && product.images.length > 0 ? (
                    <img 
                      src={product.images.find(img => img.is_primary)?.thumbnail_url || product.images[0].thumbnail_url} 
                      alt={product.name} 
                      className="product-img" 
                      loading="lazy" 
                    />
                  ) : (
                    <div className="no-img">No Image</div>
                  )}
                </Link>
                <div className="product-info">
                  <div className="product-category">{product.section_name} • {product.category_name}</div>
                  <Link href={`/product/${product.slug}`}>
                    <h3 className="product-title">{product.name}</h3>
                  </Link>
                  {view === 'list' && <p className="product-desc">{product.description?.substring(0, 150)}...</p>}
                  
                  <div className="product-meta">
                    {product.cover_style && <span className="badge">{product.cover_style}</span>}
                  </div>
                  
                  <div className="product-actions">
                    <Link href={`/product/${product.slug}`} className="btn-secondary" style={{ width: '100%', textAlign: 'center', padding: '0.45rem', fontSize: '0.85rem' }}>
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="pagination">
            <button 
              disabled={currentPage === 1} 
              onClick={() => updateFilter('page', currentPage - 1)}
              className="page-btn"
            >
              Previous
            </button>
            <span className="page-info">Page {currentPage} of {pagination.totalPages}</span>
            <button 
              disabled={currentPage === pagination.totalPages} 
              onClick={() => updateFilter('page', currentPage + 1)}
              className="page-btn"
            >
              Next
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .catalog-container {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
          align-items: start;
        }

        @media (min-width: 768px) {
          .catalog-container {
            grid-template-columns: 250px 1fr;
          }
        }

        .sidebar {
          padding: 1.5rem;
          position: sticky;
          top: 100px;
        }

        .sidebar h3 {
          margin-bottom: 1.5rem;
          font-size: 1.25rem;
          border-bottom: 1px solid var(--glass-border);
          padding-bottom: 0.5rem;
        }

        .clear-btn {
          background: transparent;
          border: none;
          color: var(--text-gray);
          text-decoration: underline;
          cursor: pointer;
          margin-bottom: 1rem;
          font-family: var(--font-inter);
          font-size: 0.85rem;
        }

        .clear-btn:hover {
          color: var(--gold-accent);
        }

        .filter-group {
          margin-bottom: 1.5rem;
        }

        .filter-group h4 {
          font-family: var(--font-inter);
          font-size: 0.9rem;
          color: var(--gold-light);
          margin-bottom: 0.5rem;
        }

        .filter-group select {
          padding: 0.5rem;
          font-size: 0.9rem;
        }

        .catalog-header {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
          margin-bottom: 2rem;
          gap: 1rem;
        }

        .catalog-controls {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .sort-select {
          padding: 0.5rem;
          width: auto;
          margin-bottom: 0;
        }

        .view-toggle {
          display: flex;
          background: #eef2f8;
          border-radius: 10px;
          overflow: hidden;
        }

        .view-toggle button {
          background: transparent;
          border: none;
          padding: 0.5rem 1rem;
          color: var(--text-gray);
          cursor: pointer;
          transition: var(--transition);
        }

        .view-toggle button.active {
          background: var(--gold-accent);
          color: var(--primary-dark);
        }

        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 1.25rem;
        }

        .products-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .product-card {
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .products-list .product-card {
          flex-direction: row;
        }

        .product-img-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          aspect-ratio: 1 / 1;
          background: #f5f7fb;
          overflow: hidden;
          padding: 0.6rem;
        }

        .products-list .product-img-wrap {
          width: 220px;
          aspect-ratio: auto;
          flex-shrink: 0;
        }

        .product-img {
          max-width: 100%;
          max-height: 100%;
          width: auto;
          height: auto;
          object-fit: contain;
          transition: transform 0.4s ease;
        }

        .product-card:hover .product-img {
          transform: scale(1.04);
        }

        .no-img {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: var(--text-gray-dark);
        }

        .product-info {
          padding: 0.75rem 0.9rem 0.9rem;
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .product-category {
          font-size: 0.8rem;
          color: var(--gold-accent);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.5rem;
        }

        .product-title {
          font-family: var(--font-playfair);
          font-size: 0.98rem;
          line-height: 1.3;
          color: var(--heading);
          margin-bottom: 0.5rem;
          transition: var(--transition);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          /* Reserve two lines so 1- and 2-line titles keep cards the same height */
          min-height: 2.6em;
        }

        .product-title:hover {
          color: var(--blue);
        }

        .product-meta {
          margin-top: auto;
          padding: 0.55rem 0 0.4rem;
          /* Reserve the badge row so cards with/without a badge stay even */
          min-height: 2.1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .loading {
          text-align: center;
          padding: 4rem;
          color: var(--gold-accent);
          font-size: 1.2rem;
        }

        .no-results {
          text-align: center;
          padding: 4rem;
        }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 1.5rem;
          margin-top: 3rem;
        }

        .page-btn {
          background: #ffffff;
          border: 1px solid var(--border);
          color: var(--text);
          padding: 0.5rem 1rem;
          border-radius: 10px;
          cursor: pointer;
          transition: var(--transition);
        }

        .page-btn:not(:disabled):hover {
          border-color: var(--gold-accent);
          color: var(--gold-accent);
        }

        .page-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 600px) {
          .products-list .product-card {
            flex-direction: column;
          }
          .products-list .product-img-wrap {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
