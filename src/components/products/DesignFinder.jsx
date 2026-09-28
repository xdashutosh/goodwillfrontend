'use client';
import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronRight, Search, X } from 'lucide-react';
import styles from './designFinder.module.css';

const WIDE_QUERY = '(min-width: 1200px)';
const distinct = (values) => [...new Set(values.filter(Boolean))].sort();

// Scroll `el` into view inside its scrollable `container` only (never the page).
function scrollWithin(container, el, offset = 0) {
  if (!container || !el || !container.clientHeight) return;
  const top = el.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop;
  container.scrollTop = Math.max(0, top - offset);
}

/**
 * Product-page side panel: every category in the section with every design in
 * it (e.g. A5 Daily → Angola, Aruba, … Serbia), with a search box and Size /
 * Format filters. The current design is highlighted and scrolled into view.
 *
 * - Wide screens: an always-open sticky sidebar. Each open category list has its
 *   own capped scroll area, so every category header stays visible.
 * - Narrower screens: a toggle bar plus an always-visible row of category chips
 *   ("A5 Daily 84 · B5 Daily 28 …"); a chip opens the panel at that category.
 * All design links are in the server HTML (collapsed groups are only hidden), so
 * every product page links to every other product in its section.
 */
export default function DesignFinder({ section, categories = [], total = 0, currentSlug = '', currentCategory = '', unit = 'designs' }) {
  const [query, setQuery] = useState('');
  const [size, setSize] = useState('');
  const [type, setType] = useState('');
  const [open, setOpen] = useState(() => new Set(currentCategory ? [currentCategory] : []));
  const [panelOpen, setPanelOpen] = useState(false); // narrow screens only
  const [wide, setWide] = useState(false);

  const listRef = useRef(null);
  const groupRefs = useRef({});
  const activeRef = useRef(null);
  const pendingJump = useRef(null);

  useEffect(() => {
    const mq = window.matchMedia(WIDE_QUERY);
    const update = () => setWide(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const sizes = useMemo(() => distinct(categories.map((c) => c.size_label)), [categories]);
  const types = useMemo(() => distinct(categories.map((c) => c.type_label)), [categories]);
  // Only offer combinations that exist (e.g. Weekly → A4, A6).
  const sizeEnabled = (s) => categories.some((c) => c.size_label === s && (!type || c.type_label === type));
  const typeEnabled = (t) => categories.some((c) => c.type_label === t && (!size || c.size_label === size));

  const q = query.trim().toLowerCase();
  const filtering = Boolean(q || size || type);

  const groups = useMemo(
    () =>
      categories
        .filter((c) => (!size || c.size_label === size) && (!type || c.type_label === type))
        .map((c) => {
          const items = q
            ? (c.products || []).filter((p) => `${p.name} ${p.cover_style || ''}`.toLowerCase().includes(q))
            : c.products || [];
          return { ...c, items };
        })
        .filter((c) => !q || c.items.length > 0),
    [categories, size, type, q]
  );

  const matchCount = groups.reduce((n, c) => n + c.items.length, 0);
  const panelVisible = wide || panelOpen;

  // Bring the current design into view inside its category's own list. Re-runs
  // when the panel becomes visible, since a hidden list can't be measured.
  useEffect(() => {
    if (!panelVisible || filtering) return;
    const active = activeRef.current;
    const list = active?.closest('ul');
    scrollWithin(list, active, list ? list.clientHeight / 3 : 0);
  }, [panelVisible, filtering]);

  // After a chip click, scroll the panel to that category's header.
  useEffect(() => {
    const slug = pendingJump.current;
    if (!slug || !panelVisible) return;
    pendingJump.current = null;
    scrollWithin(listRef.current, groupRefs.current[slug]);
  });

  const toggle = (slug) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });

  const jumpTo = useCallback((slug) => {
    setQuery('');
    setSize('');
    setType('');
    setOpen((prev) => new Set(prev).add(slug));
    setPanelOpen(true);
    pendingJump.current = slug;
  }, []);

  const reset = () => {
    setQuery('');
    setSize('');
    setType('');
  };

  if (!categories.length) return null;

  const meta = `${total} ${unit} · ${categories.length} ${categories.length === 1 ? 'category' : 'categories'}`;

  return (
    <aside className={`${styles.finder} ${panelOpen ? styles.panelOpen : ''}`} aria-label={`Browse all ${section.name}`}>
      {wide ? (
        <div className={styles.head}>
          <div className={styles.headText}>
            <h2 className={styles.headTitle}>Browse {section.name}</h2>
            <span className={styles.headMeta}>{meta}</span>
          </div>
        </div>
      ) : (
        <button type="button" className={styles.head} onClick={() => setPanelOpen((v) => !v)} aria-expanded={panelOpen}>
          <span className={styles.headText}>
            <span className={styles.headTitle}>Browse all {section.name}</span>
            <span className={styles.headMeta}>{meta}</span>
          </span>
          <ChevronDown size={20} className={styles.headCaret} aria-hidden="true" />
        </button>
      )}

      {/* Category index — always visible on narrow screens */}
      {categories.length > 1 && (
        <div className={styles.index} aria-label={`${section.name} categories`}>
          {categories.map((c) => (
            <button
              key={c.slug}
              type="button"
              className={`${styles.indexChip} ${c.slug === currentCategory ? styles.indexCurrent : ''}`}
              onClick={() => jumpTo(c.slug)}
            >
              {c.name}
              <span className={styles.indexCount}>{c.product_count}</span>
            </button>
          ))}
        </div>
      )}

      <div className={styles.body}>
        <div className={styles.controls}>
          <label className={styles.search}>
            <Search size={16} aria-hidden="true" />
            <input
              type="text"
              inputMode="search"
              enterKeyHint="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${total} ${unit}…`}
              aria-label={`Search ${section.name}`}
            />
            {query && (
              <button type="button" onClick={() => setQuery('')} aria-label="Clear search" className={styles.clearQ}>
                <X size={14} />
              </button>
            )}
          </label>

          {sizes.length > 1 && (
            <div className={styles.facet} role="group" aria-label="Filter by size">
              <span className={styles.facetLabel}>Size</span>
              <div className={styles.pills}>
                <button type="button" className={`${styles.pill} ${!size ? styles.pillOn : ''}`} onClick={() => setSize('')} aria-pressed={!size}>All</button>
                {sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`${styles.pill} ${size === s ? styles.pillOn : ''}`}
                    onClick={() => setSize(size === s ? '' : s)}
                    aria-pressed={size === s}
                    disabled={!sizeEnabled(s) && size !== s}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {types.length > 1 && (
            <div className={styles.facet} role="group" aria-label="Filter by format">
              <span className={styles.facetLabel}>Format</span>
              <div className={styles.pills}>
                <button type="button" className={`${styles.pill} ${!type ? styles.pillOn : ''}`} onClick={() => setType('')} aria-pressed={!type}>All</button>
                {types.map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={`${styles.pill} ${type === t ? styles.pillOn : ''}`}
                    onClick={() => setType(type === t ? '' : t)}
                    aria-pressed={type === t}
                    disabled={!typeEnabled(t) && type !== t}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {filtering && (
            <div className={styles.status} aria-live="polite">
              <span>{matchCount} {matchCount === 1 ? unit.replace(/s$/, '') : unit} found</span>
              <button type="button" onClick={reset}>Reset</button>
            </div>
          )}
        </div>

        <div className={styles.list} ref={listRef}>
          {groups.length === 0 ? (
            <p className={styles.empty}>
              No {unit} match{q ? <> “{query.trim()}”</> : ' these filters'}.
            </p>
          ) : (
            <ul className={styles.groups}>
              {groups.map((c) => {
                // Filtering shows every matching group open; otherwise the visitor's choice.
                const isOpen = filtering || open.has(c.slug);
                const isCurrentCat = c.slug === currentCategory;
                return (
                  <li key={c.slug} className={styles.group} ref={(el) => { groupRefs.current[c.slug] = el; }}>
                    <button
                      type="button"
                      className={`${styles.groupHead} ${isCurrentCat ? styles.groupCurrent : ''}`}
                      onClick={() => toggle(c.slug)}
                      aria-expanded={isOpen}
                      disabled={filtering}
                    >
                      <ChevronRight size={16} className={`${styles.groupCaret} ${isOpen ? styles.groupCaretOpen : ''}`} aria-hidden="true" />
                      <span className={styles.groupName}>{c.name}</span>
                      <span className={styles.groupCount}>{q ? `${c.items.length}/${c.product_count}` : c.product_count}</span>
                    </button>

                    <ul className={styles.designs} hidden={!isOpen}>
                      {c.items.map((p) => {
                        const isCurrent = p.slug === currentSlug;
                        return (
                          <li key={p.id}>
                            <Link
                              href={`/product/${p.slug}`}
                              className={`${styles.design} ${isCurrent ? styles.designCurrent : ''}`}
                              aria-current={isCurrent ? 'page' : undefined}
                              ref={isCurrent ? activeRef : undefined}
                            >
                              <span className={styles.thumb}>
                                {p.thumbnail_url ? <img src={p.thumbnail_url} alt="" loading="lazy" /> : null}
                              </span>
                              <span className={styles.designName}>{p.name}</span>
                              {isCurrent && <span className={styles.viewing}>Viewing</span>}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <Link href={`/${section.slug}`} className={styles.viewAll}>
          View all {section.name} with filters <span aria-hidden="true">→</span>
        </Link>
      </div>
    </aside>
  );
}
