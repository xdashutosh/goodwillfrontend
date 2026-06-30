'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import styles from './sectionCategoryTags.module.css';

// A single-line row of category "pills" shown at the top of a section page.
// Clicking a tag sets the `category` URL param that the ProductCatalog below
// reads, so the collection filters in place without leaving the section page.
export default function SectionCategoryTags({ basePath, categories = [] }) {
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('category') || '';

  // Preserve any other active filters (size, type, sort, etc.) when switching category.
  const buildHref = (categorySlug) => {
    const params = new URLSearchParams(searchParams.toString());
    if (categorySlug) params.set('category', categorySlug);
    else params.delete('category');
    params.delete('page'); // reset paging when the category changes
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  if (!categories.length) return null;

  return (
    <div className={styles.tagRow}>
      <Link
        href={buildHref('')}
        className={`${styles.tag} ${!activeCategory ? styles.active : ''}`}
      >
        All
      </Link>
      {categories.map((cat) => (
        <Link
          key={cat.id ?? cat.slug}
          href={buildHref(cat.slug)}
          className={`${styles.tag} ${activeCategory === cat.slug ? styles.active : ''}`}
        >
          {cat.name}
        </Link>
      ))}
    </div>
  );
}
