'use client';
import { useState, useMemo, useEffect, useRef, useCallback } from 'react';

export default function ProductGallery({ images, productName }) {
  const safeImages = useMemo(() => images || [], [images]);

  // Images whose file failed to load (e.g. missing from storage) are dropped from
  // the gallery instead of showing as broken thumbnails.
  const [failed, setFailed] = useState(() => new Set());
  // Before giving up on an image, fall back to its other files: the plain JPEG
  // when the WebP fails, the full image when the thumbnail fails.
  const [noWebp, setNoWebp] = useState(() => new Set());
  const [thumbFallback, setThumbFallback] = useState(() => new Set());
  const add = (setter, id) => setter((prev) => (prev.has(String(id)) ? prev : new Set(prev).add(String(id))));
  const markFailed = useCallback((id) => add(setFailed, id), []);
  const onMainError = useCallback(
    (img) => (img.webp_url && !noWebp.has(String(img.id)) ? add(setNoWebp, img.id) : markFailed(img.id)),
    [noWebp, markFailed]
  );
  const onThumbError = useCallback(
    (img) => (img.image_url && !thumbFallback.has(String(img.id)) ? add(setThumbFallback, img.id) : markFailed(img.id)),
    [thumbFallback, markFailed]
  );
  const galleryRef = useRef(null);

  // Sort so the primary image comes first, then by sort_order
  const sortedImages = useMemo(() => {
    return [...safeImages]
      .filter((img) => !failed.has(String(img.id)))
      .sort((a, b) => {
        if (a.is_primary && !b.is_primary) return -1;
        if (!a.is_primary && b.is_primary) return 1;
        return (a.sort_order || 0) - (b.sort_order || 0);
      });
  }, [safeImages, failed]);

  // An image that errored before hydration never fires React's onError — catch those after mount.
  useEffect(() => {
    galleryRef.current?.querySelectorAll('img[data-img-id]').forEach((el) => {
      if (!el.complete || el.naturalWidth !== 0) return;
      const img = safeImages.find((i) => String(i.id) === el.dataset.imgId);
      if (!img) return;
      if (el.dataset.kind === 'thumb') onThumbError(img);
      else onMainError(img);
    });
    // Only the state right after hydration matters here; later errors go through onError.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Distinct colour variants (only images that declare a colour)
  const colors = useMemo(() => {
    const map = new Map();
    for (const img of sortedImages) {
      if (img.color && !map.has(img.color)) {
        map.set(img.color, img.color_hex || null);
      }
    }
    return Array.from(map, ([name, hex]) => ({ name, hex }));
  }, [sortedImages]);

  const [activeColor, setActiveColor] = useState(null); // null = show all
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoom, setZoom] = useState({ active: false, x: 50, y: 50 });

  // All hooks are declared above this point — safe to early-return now.
  if (sortedImages.length === 0) {
    return (
      <div className="no-image-placeholder glass-card">
        <span>No Image Available</span>
      </div>
    );
  }

  // A colour shows its own photos plus the untagged ones (e.g. the inside-page
  // shots), which apply to every colour.
  const displayed = activeColor
    ? sortedImages.filter((img) => img.color === activeColor || !img.color)
    : sortedImages;

  const safeIndex = Math.min(activeIndex, displayed.length - 1);
  const current = displayed[safeIndex] || sortedImages[0];

  const selectColor = (color) => {
    setActiveColor(color);
    setActiveIndex(0);
  };

  // Zoom follows a mouse only — on touch screens a tap would otherwise leave the
  // image stuck at 2x.
  const handleMove = (e) => {
    if (e.pointerType !== 'mouse') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoom({ active: true, x, y });
  };

  return (
    <div className="gallery-container" ref={galleryRef}>
      {/* Main Image with hover-to-zoom */}
      <div
        className="main-image-wrap glass-card"
        onPointerEnter={(e) => e.pointerType === 'mouse' && setZoom((z) => ({ ...z, active: true }))}
        onPointerLeave={() => setZoom({ active: false, x: 50, y: 50 })}
        onPointerMove={handleMove}
      >
        <picture>
          {current.webp_url && !noWebp.has(String(current.id)) && <source srcSet={current.webp_url} type="image/webp" />}
          <img
            src={current.image_url}
            alt={current.alt_text || productName}
            data-img-id={current.id}
            data-kind="main"
            onError={() => onMainError(current)}
            className="main-image"
            style={{
              transform: zoom.active ? 'scale(2)' : 'scale(1)',
              transformOrigin: `${zoom.x}% ${zoom.y}%`,
            }}
          />
        </picture>
        <span className="zoom-hint">Hover to zoom</span>
      </div>

      {/* Colour variants */}
      {colors.length > 0 && (
        <div className="color-swatches" role="group" aria-label="Colour variants">
          <button
            type="button"
            className={`swatch-all ${activeColor === null ? 'active' : ''}`}
            onClick={() => selectColor(null)}
          >
            All
          </button>
          {colors.map((c) => (
            <button
              key={c.name}
              type="button"
              title={c.name}
              aria-label={c.name}
              className={`swatch ${activeColor === c.name ? 'active' : ''}`}
              style={c.hex ? { backgroundColor: c.hex } : undefined}
              onClick={() => selectColor(c.name)}
            >
              {!c.hex && c.name}
            </button>
          ))}
        </div>
      )}

      {/* Thumbnails */}
      {displayed.length > 1 && (
        <div className="thumbnails">
          {displayed.map((img, idx) => (
            <button
              key={img.id}
              className={`thumb-btn ${idx === safeIndex ? 'active' : ''}`}
              onClick={() => setActiveIndex(idx)}
              aria-label={`View image ${idx + 1}`}
            >
              <img
                src={thumbFallback.has(String(img.id)) ? img.image_url : img.thumbnail_url || img.image_url}
                alt={`Thumbnail ${idx + 1}`}
                loading="lazy"
                data-img-id={img.id}
                data-kind="thumb"
                onError={() => onThumbError(img)}
              />
            </button>
          ))}
        </div>
      )}

      <style jsx>{`
        .gallery-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          /* Keep the gallery a sensible size in the single-column (mobile/tablet) layout */
          max-width: 480px;
        }

        .no-image-placeholder {
          aspect-ratio: 1 / 1;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--muted);
          font-size: var(--fs-md);
        }

        .main-image-wrap {
          position: relative;
          aspect-ratio: 1 / 1;
          overflow: hidden;
          background: #f4f7fc;
          cursor: zoom-in;
        }

        .main-image {
          /* Absolutely fill the box inset by a fixed margin, then contain the whole
             image inside that area. Guarantees equal breathing room on all four
             sides so the product never touches or sits behind the rounded border. */
          position: absolute;
          top: 1.25rem;
          left: 1.25rem;
          width: calc(100% - 2.5rem);
          height: calc(100% - 2.5rem);
          object-fit: contain;
          transition: transform 0.15s ease-out;
          will-change: transform;
        }

        .zoom-hint {
          position: absolute;
          bottom: 0.75rem;
          right: 0.75rem;
          font-size: var(--fs-xs);
          font-weight: 600;
          line-height: 1.4;
          color: #ffffff;
          background: rgba(22, 35, 92, 0.88);
          padding: 0.25rem 0.7rem;
          border-radius: 999px;
          pointer-events: none;
        }

        /* Touch screens can't hover — no hint, no zoom cursor */
        @media (hover: none) {
          .zoom-hint {
            display: none;
          }
          .main-image-wrap {
            cursor: default;
          }
        }

        .color-swatches {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          align-items: center;
        }

        .swatch,
        .swatch-all {
          min-width: 32px;
          height: 32px;
          padding: 0 0.5rem;
          border-radius: 999px;
          border: 2px solid var(--border);
          background: #ffffff;
          color: var(--text);
          font-family: var(--font-inter);
          font-size: var(--fs-xs);
          font-weight: 600;
          line-height: 1;
          cursor: pointer;
          transition: var(--transition);
        }

        .swatch {
          width: 32px;
        }

        /* A colour without a hex shows its name as text — let the pill fit it. */
        .swatch:not([style]) {
          width: auto;
        }

        .swatch.active,
        .swatch-all.active {
          border-color: var(--gold-accent);
          box-shadow: 0 0 0 2px rgba(201, 168, 76, 0.3);
        }

        .thumbnails {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
          gap: 1rem;
        }

        .thumb-btn {
          aspect-ratio: 1;
          padding: 0;
          background: #eef2f8;
          border: 2px solid var(--border);
          border-radius: 8px;
          overflow: hidden;
          cursor: pointer;
          transition: var(--transition);
        }

        .thumb-btn img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 4px;
          opacity: 0.7;
          transition: var(--transition);
        }

        .thumb-btn:hover img {
          opacity: 1;
        }

        .thumb-btn.active {
          border-color: var(--gold-accent);
        }

        .thumb-btn.active img {
          opacity: 1;
        }
      `}</style>
    </div>
  );
}
