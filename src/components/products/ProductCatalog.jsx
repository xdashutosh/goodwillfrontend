'use client';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { API_BASE } from '@/lib/api';
import ProductCard from './ProductCard';
import styles from './catalog.module.css';

const PAGE_SIZE = 24;
const DEFAULT_SORT = 'sort_order';
const SORTS = [
  { value: 'sort_order', label: 'Recommended' },
  { value: 'name_asc', label: 'Name: A to Z' },
  { value: 'name_desc', label: 'Name: Z to A' },
  { value: 'newest', label: 'Newest first' },
];
const FALLBACK_SECTIONS = [
  { slug: 'diaries', name: 'Diaries' },
  { slug: 'notebooks', name: 'Notebooks' },
  { slug: 'organizers', name: 'Organizers' },
  { slug: 'corporate-gifts', name: 'Corporate Gifts' },
];

const distinct = (values) => [...new Set(values.filter(Boolean))].sort();

// Does a category come in this size/format? Mirrors the API, where a size filter
// excludes categories without a size label. Unknown (undefined) labels always fit.
const labelFits = (label, wanted) => !wanted || label === undefined || label === wanted;

// Page numbers with ellipses: 1 … 4 5 6 … 12
function pageList(current, total) {
  const pages = new Set([1, total, current - 1, current, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push(`gap-${p}`);
    out.push(p);
  });
  return out;
}

/**
 * Filterable, paginated product grid. All state lives in the URL so filtered
 * views can be shared and survive back/forward.
 *
 * Props:
 *  - lockedSection / lockedCategory: scope the grid (their filters are hidden)
 *  - basePath: the page URL filters are applied to
 *  - facets: optional { categories: [{ slug, name, size_label, type_label, count }] }
 *    from the server-side section catalog. When given, the Category / Size /
 *    Format options only offer combinations that actually have products.
 *    Rows may carry section_slug, so an unscoped catalog can narrow them per section.
 *  - sections: optional [{ slug, name }] for the Section filter (unscoped catalog)
 *  - initial: optional { products, pagination } — the unfiltered first page, rendered
 *    straight away (and also in the server HTML via CatalogSkeleton) instead of
 *    waiting for the first fetch
 *  - unit: noun for results ("designs" / "products")
 */
export default function ProductCatalog({
  lockedSection = '',
  lockedCategory = '',
  basePath = '/products',
  facets = null,
  sections = null,
  initial = null,
  unit = 'products',
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const topRef = useRef(null);

  // No filter/sort/page in the URL → the server-provided first page is exactly what
  // the API would return, so it can be shown without a fetch.
  const pristine = !['section', 'category', 'size', 'type', 'coverStyle', 'search', 'sort', 'page'].some((k) => searchParams.get(k));
  const hasFacets = Boolean(facets?.categories?.length);
  const useInitial = Boolean(initial?.products?.length && pristine && (hasFacets || lockedCategory));

  const [products, setProducts] = useState(() => (useInitial ? initial.products : []));
  const [loading, setLoading] = useState(!useInitial);
  const [loadError, setLoadError] = useState(false);
  const [apiFilters, setApiFilters] = useState(null);
  const [pagination, setPagination] = useState(() => (useInitial ? initial.pagination : { page: 1, totalPages: 1, total: 0 }));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  // Current filters from the URL (locked props take precedence)
  const activeSection = lockedSection || searchParams.get('section') || '';
  const activeCategory = lockedCategory || searchParams.get('category') || '';
  const activeSize = searchParams.get('size') || '';
  const activeType = searchParams.get('type') || '';
  const activeCover = searchParams.get('coverStyle') || '';
  const activeSearch = searchParams.get('search') || '';
  const activeSort = searchParams.get('sort') || DEFAULT_SORT;
  const currentPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);

  const [query, setQuery] = useState(activeSearch);
  // Last search value this component wrote to the URL. Lets us tell our own
  // (debounced) updates apart from external ones like back/forward, so a slow
  // navigation never overwrites what the visitor is still typing.
  const lastSearch = useRef(activeSearch);
  useEffect(() => {
    if (activeSearch !== lastSearch.current) {
      lastSearch.current = activeSearch;
      setQuery(activeSearch);
    }
  }, [activeSearch]);

  // ---- URL updates ----
  // The query string we last navigated to. Updates build on this rather than on the
  // rendered searchParams, so two quick updates (a filter click while a debounced
  // search is pending) never overwrite each other before navigation completes.
  const urlRef = useRef(searchParams.toString());
  useEffect(() => {
    urlRef.current = searchParams.toString();
  }, [searchParams]);

  const pushParams = useCallback(
    (patch, { keepPage = false } = {}) => {
      const params = new URLSearchParams(urlRef.current);
      Object.entries(patch).forEach(([k, v]) => {
        if (v) params.set(k, String(v));
        else params.delete(k);
      });
      if (!keepPage) params.delete('page');
      if (params.get('sort') === DEFAULT_SORT) params.delete('sort');
      if (params.get('page') === '1') params.delete('page');
      const qs = params.toString();
      urlRef.current = qs;
      router.push(qs ? `${basePath}?${qs}` : basePath, { scroll: false });
    },
    [router, basePath]
  );

  const clearAll = () => {
    lastSearch.current = '';
    urlRef.current = '';
    setQuery('');
    router.push(basePath, { scroll: false });
  };

  const commitSearch = useCallback(
    (value) => {
      const q = value.trim();
      if (q === lastSearch.current) return;
      lastSearch.current = q;
      pushParams({ search: q });
    },
    [pushParams]
  );

  // Debounced search-as-you-type
  useEffect(() => {
    if (query.trim() === lastSearch.current) return;
    const t = setTimeout(() => commitSearch(query), 400);
    return () => clearTimeout(t);
  }, [query, commitSearch]);

  // ---- Data ----
  useEffect(() => {
    if (useInitial) {
      setProducts(initial.products);
      setPagination(initial.pagination);
      setLoadError(false);
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    const params = new URLSearchParams({ page: String(currentPage), limit: String(PAGE_SIZE), sort: activeSort });
    if (activeSection) params.set('section', activeSection);
    if (activeCategory) params.set('category', activeCategory);
    if (activeSize) params.set('size', activeSize);
    if (activeType) params.set('type', activeType);
    if (activeCover) params.set('coverStyle', activeCover);
    if (activeSearch) params.set('search', activeSearch);
    // Filter aggregations only come with page 1 unless asked for explicitly.
    if (!hasFacets) params.set('withFilters', '1');

    const load = async () => {
      setLoading(true);
      // Retry transient failures (cold-starting API host, brief 5xx) before giving up.
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const res = await fetch(`${API_BASE}/api/products?${params.toString()}`, { signal: controller.signal });
          if (!res.ok && res.status < 500) throw Object.assign(new Error(`HTTP ${res.status}`), { fatal: true });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json();
          setProducts(data.products || []);
          setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
          if (data.filters) setApiFilters(data.filters);
          setLoadError(false);
          setLoading(false);
          return;
        } catch (err) {
          if (controller.signal.aborted) return;
          if (err.fatal || attempt === 2) break;
          await new Promise((r) => setTimeout(r, 800 * 2 ** attempt));
          if (controller.signal.aborted) return;
        }
      }
      setProducts([]);
      setLoadError(true);
      setLoading(false);
    };

    load();
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `initial` is static server data
  }, [activeSection, activeCategory, activeSize, activeType, activeCover, activeSearch, activeSort, currentPage, hasFacets, useInitial, reloadKey]);

  // ---- Facet options ----
  // Category metadata: server facets (with size/type labels) or, without them,
  // the API's category counts — whose size/type are unknown (left undefined).
  const categoryMeta = useMemo(() => {
    if (hasFacets) return facets.categories.filter((c) => !activeSection || !c.section_slug || c.section_slug === activeSection);
    return (apiFilters?.categories || []).map(({ name, slug, count }) => ({ name, slug, count }));
  }, [hasFacets, facets, apiFilters, activeSection]);

  const fits = (c) => labelFits(c.size_label, activeSize) && labelFits(c.type_label, activeType);

  const selectedCategoryMeta = categoryMeta.find((c) => c.slug === activeCategory) || null;

  // Sizes / formats that have products given the other facet (e.g. Weekly → A4, A6).
  const sizeOptions = useMemo(() => {
    const all = hasFacets ? distinct(categoryMeta.map((c) => c.size_label)) : apiFilters?.sizes || [];
    return all.map((s) => ({
      value: s,
      enabled: !hasFacets || categoryMeta.some((c) => c.size_label === s && labelFits(c.type_label, activeType)),
    }));
  }, [hasFacets, categoryMeta, apiFilters, activeType]);

  const typeOptions = useMemo(() => {
    const all = hasFacets ? distinct(categoryMeta.map((c) => c.type_label)) : apiFilters?.types || [];
    return all.map((t) => ({
      value: t,
      enabled: !hasFacets || categoryMeta.some((c) => c.type_label === t && labelFits(c.size_label, activeSize)),
    }));
  }, [hasFacets, categoryMeta, apiFilters, activeSize]);

  const sectionOptions = sections?.length ? sections : FALLBACK_SECTIONS;
  const showCategoryFilter = !lockedCategory && categoryMeta.length > 1;
  const showSizeFilter = !lockedCategory && sizeOptions.length > 1;
  const showTypeFilter = !lockedCategory && typeOptions.length > 1;
  const facetTotal = categoryMeta.reduce((n, c) => n + (c.count || 0), 0);
  // Single-category pages have nothing to filter but the search — skip the sidebar.
  const hasSidebar = !lockedSection || showCategoryFilter || showSizeFilter || showTypeFilter;

  // Picking a category drops a size/format it doesn't come in (and vice versa),
  // so a click never lands on an empty grid.
  const selectCategory = (slug) => {
    const meta = categoryMeta.find((c) => c.slug === slug);
    const patch = { category: slug };
    if (meta && !labelFits(meta.size_label, activeSize)) patch.size = '';
    if (meta && !labelFits(meta.type_label, activeType)) patch.type = '';
    pushParams(patch);
  };
  const selectSize = (size) => {
    const patch = { size };
    if (selectedCategoryMeta && !labelFits(selectedCategoryMeta.size_label, size)) patch.category = '';
    pushParams(patch);
  };
  const selectType = (type) => {
    const patch = { type };
    if (selectedCategoryMeta && !labelFits(selectedCategoryMeta.type_label, type)) patch.category = '';
    pushParams(patch);
  };
  const selectSection = (section) => pushParams({ section, category: '', size: '', type: '' });

  const goToPage = (page) => {
    pushParams({ page }, { keepPage: true });
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // ---- Active filter chips ----
  const sectionName = sectionOptions.find((s) => s.slug === activeSection)?.name || activeSection;
  const chips = [
    !lockedSection && activeSection && { key: 'section', label: sectionName, clear: () => selectSection('') },
    !lockedCategory && activeCategory && { key: 'category', label: selectedCategoryMeta?.name || activeCategory, clear: () => pushParams({ category: '' }) },
    activeSize && { key: 'size', label: `Size ${activeSize}`, clear: () => pushParams({ size: '' }) },
    activeType && { key: 'type', label: activeType, clear: () => pushParams({ type: '' }) },
    activeCover && { key: 'coverStyle', label: `Cover: ${activeCover}`, clear: () => pushParams({ coverStyle: '' }) },
    activeSearch && { key: 'search', label: `“${activeSearch}”`, clear: () => { setQuery(''); commitSearch(''); } },
  ].filter(Boolean);

  // The drawer only exists below 900px — close it if the viewport grows past that
  // (e.g. a tablet rotating) so the scroll lock below is released.
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 900px)');
    const onChange = () => mq.matches && setDrawerOpen(false);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Lock page scroll while the mobile filter drawer is open; Esc closes it.
  useEffect(() => {
    if (!drawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => e.key === 'Escape' && setDrawerOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [drawerOpen]);

  const singularUnit = unit.replace(/s$/, '');
  const totalPages = pagination.totalPages || 1;
  const outOfRange = !loading && !loadError && products.length === 0 && currentPage > 1;
  const from = products.length ? (currentPage - 1) * PAGE_SIZE + 1 : 0;
  const to = products.length ? from + products.length - 1 : 0;

  const searchBox = (
    <label className={styles.search}>
      <Search size={16} aria-hidden="true" />
      <input
        type="text"
        inputMode="search"
        enterKeyHint="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && commitSearch(query)}
        placeholder={`Search ${unit}…`}
        aria-label={`Search ${unit}`}
      />
      {query && (
        <button type="button" className={styles.clearQ} onClick={() => { setQuery(''); commitSearch(''); }} aria-label="Clear search">
          <X size={14} />
        </button>
      )}
    </label>
  );

  return (
    <div className={`${styles.catalog} ${hasSidebar ? '' : styles.noSidebar}`} ref={topRef}>
      {/* ---------- Filters ---------- */}
      {hasSidebar && (
      <>
      <div
        className={`${styles.backdrop} ${drawerOpen ? styles.backdropOn : ''}`}
        onClick={() => setDrawerOpen(false)}
        aria-hidden="true"
      />
      <aside className={`${styles.sidebar} ${drawerOpen ? styles.sidebarOpen : ''}`} aria-label="Filters">
        <div className={styles.sidebarHead}>
          <h2 className={styles.sidebarTitle}>Filters</h2>
          {chips.length > 0 && (
            <button type="button" className={styles.linkBtn} onClick={clearAll}>Clear all</button>
          )}
          <button type="button" className={styles.closeBtn} onClick={() => setDrawerOpen(false)} aria-label="Close filters">
            <X size={18} />
          </button>
        </div>

        <div className={styles.sidebarBody}>
          <div className={styles.group}>{searchBox}</div>

          {!lockedSection && (
            <div className={styles.group} role="group" aria-labelledby="flt-section">
              <h3 className={styles.groupTitle} id="flt-section">Section</h3>
              <div className={styles.options}>
                <button type="button" className={`${styles.option} ${!activeSection ? styles.optionOn : ''}`} onClick={() => selectSection('')}>
                  <span className={styles.radio} aria-hidden="true" />
                  <span className={styles.optionLabel}>All sections</span>
                </button>
                {sectionOptions.map((s) => (
                  <button key={s.slug} type="button" className={`${styles.option} ${activeSection === s.slug ? styles.optionOn : ''}`} onClick={() => selectSection(s.slug)} aria-pressed={activeSection === s.slug}>
                    <span className={styles.radio} aria-hidden="true" />
                    <span className={styles.optionLabel}>{s.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {showCategoryFilter && (
            <div className={styles.group} role="group" aria-labelledby="flt-category">
              <h3 className={styles.groupTitle} id="flt-category">Category</h3>
              <div className={styles.options}>
                <button type="button" className={`${styles.option} ${!activeCategory ? styles.optionOn : ''}`} onClick={() => selectCategory('')}>
                  <span className={styles.radio} aria-hidden="true" />
                  <span className={styles.optionLabel}>All categories</span>
                  {facetTotal > 0 && <span className={styles.count}>{facetTotal}</span>}
                </button>
                {categoryMeta.map((c) => {
                  const dim = !fits(c);
                  return (
                    <button
                      key={c.slug}
                      type="button"
                      className={`${styles.option} ${activeCategory === c.slug ? styles.optionOn : ''} ${dim ? styles.optionDim : ''}`}
                      onClick={() => selectCategory(c.slug)}
                      aria-pressed={activeCategory === c.slug}
                      title={dim ? `Not available in the selected size/format — picking it clears that filter` : undefined}
                    >
                      <span className={styles.radio} aria-hidden="true" />
                      <span className={styles.optionLabel}>{c.name}</span>
                      {typeof c.count === 'number' && <span className={styles.count}>{c.count}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {showSizeFilter && (
            <div className={styles.group} role="group" aria-labelledby="flt-size">
              <h3 className={styles.groupTitle} id="flt-size">Size</h3>
              <div className={styles.pills}>
                {sizeOptions.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    className={`${styles.pill} ${activeSize === s.value ? styles.pillOn : ''}`}
                    onClick={() => selectSize(activeSize === s.value ? '' : s.value)}
                    disabled={!s.enabled && activeSize !== s.value}
                    aria-pressed={activeSize === s.value}
                  >
                    {s.value}
                  </button>
                ))}
              </div>
            </div>
          )}

          {showTypeFilter && (
            <div className={styles.group} role="group" aria-labelledby="flt-format">
              <h3 className={styles.groupTitle} id="flt-format">Format</h3>
              <div className={styles.pills}>
                {typeOptions.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    className={`${styles.pill} ${activeType === t.value ? styles.pillOn : ''}`}
                    onClick={() => selectType(activeType === t.value ? '' : t.value)}
                    disabled={!t.enabled && activeType !== t.value}
                    aria-pressed={activeType === t.value}
                  >
                    {t.value}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className={styles.drawerFoot}>
          <button type="button" className="btn-primary" onClick={() => setDrawerOpen(false)}>
            Show {pagination.total} {pagination.total === 1 ? singularUnit : unit}
          </button>
        </div>
      </aside>
      </>
      )}

      {/* ---------- Results ---------- */}
      <div className={styles.results}>
        <div className={styles.toolbar}>
          <p className={styles.resultCount} aria-live="polite">
            {loading ? (
              'Loading…'
            ) : products.length ? (
              <>
                Showing <strong>{from}–{to}</strong> of <strong>{pagination.total}</strong> {pagination.total === 1 ? singularUnit : unit}
              </>
            ) : (
              `No ${unit} found`
            )}
          </p>
          <div className={styles.toolbarRight}>
            {!hasSidebar && <div className={styles.toolbarSearch}>{searchBox}</div>}
            {hasSidebar && (
              <button type="button" className={styles.filterBtn} onClick={() => setDrawerOpen(true)}>
                <SlidersHorizontal size={16} aria-hidden="true" />
                Filters
                {chips.length > 0 && <span className={styles.filterCount}>{chips.length}</span>}
              </button>
            )}
            <label className={styles.sort}>
              <span>Sort by</span>
              <select value={activeSort} onChange={(e) => pushParams({ sort: e.target.value })}>
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {chips.length > 0 && (
          <div className={styles.chips}>
            {chips.map((c) => (
              <button key={c.key} type="button" className={styles.chip} onClick={c.clear} aria-label={`Remove filter ${c.label}`}>
                {c.label}
                <X size={13} aria-hidden="true" />
              </button>
            ))}
            <button type="button" className={styles.linkBtn} onClick={clearAll}>Clear all</button>
          </div>
        )}

        {loading ? (
          <div className={styles.grid}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className={styles.skelCard}>
                <div className="skeleton" style={{ aspectRatio: '1 / 1', borderRadius: 0 }} />
                <div style={{ padding: '0.9rem 1rem 1rem' }}>
                  <div className="skeleton" style={{ height: 10, width: '45%', marginBottom: 10 }} />
                  <div className="skeleton" style={{ height: 18, width: '80%', marginBottom: 14 }} />
                  <div className="skeleton" style={{ height: 12, width: '40%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : loadError ? (
          <div className={styles.state}>
            <h3>Unable to load {unit}</h3>
            <p>We couldn&apos;t reach the catalog just now. Please try again in a moment.</p>
            <button type="button" onClick={() => setReloadKey((k) => k + 1)} className="btn-secondary">Try again</button>
          </div>
        ) : outOfRange ? (
          <div className={styles.state}>
            <h3>This page doesn&apos;t exist</h3>
            <p>There are only {totalPages} {totalPages === 1 ? 'page' : 'pages'} of results.</p>
            <button type="button" onClick={() => pushParams({ page: '' }, { keepPage: true })} className="btn-secondary">Go to the first page</button>
          </div>
        ) : products.length === 0 ? (
          <div className={styles.state}>
            <h3>No {unit} match your selection</h3>
            {chips.length > 0 ? (
              <>
                <p>Try removing a filter or searching for a different name.</p>
                <button type="button" onClick={clearAll} className="btn-secondary">Clear all filters</button>
              </>
            ) : (
              <p>New designs are added regularly — please check back soon or contact us for the full range.</p>
            )}
          </div>
        ) : (
          <div className={styles.grid}>
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                eyebrow={lockedCategory ? null : lockedSection ? product.category_name : `${product.section_name} · ${product.category_name}`}
              />
            ))}
          </div>
        )}

        {!loading && !loadError && !outOfRange && totalPages > 1 && (
          <nav className={styles.pagination} aria-label="Pagination">
            <button type="button" className={styles.pageBtn} disabled={currentPage <= 1} onClick={() => goToPage(currentPage - 1)}>
              ‹ Prev
            </button>
            {pageList(currentPage, totalPages).map((p) =>
              typeof p === 'string' ? (
                <span key={p} className={styles.pageGap}>…</span>
              ) : (
                <button
                  key={p}
                  type="button"
                  className={`${styles.pageBtn} ${p === currentPage ? styles.pageOn : ''}`}
                  onClick={() => goToPage(p)}
                  aria-current={p === currentPage ? 'page' : undefined}
                >
                  {p}
                </button>
              )
            )}
            <button type="button" className={styles.pageBtn} disabled={currentPage >= totalPages} onClick={() => goToPage(currentPage + 1)}>
              Next ›
            </button>
          </nav>
        )}
      </div>
    </div>
  );
}
