'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function BannerCarousel({ banners }) {
  const list = (banners || []).filter((b) => b && b.image_url);
  const [index, setIndex] = useState(0);
  const n = list.length;

  const go = useCallback((i) => setIndex(((i % n) + n) % n), [n]);

  useEffect(() => {
    if (n <= 1) return undefined;
    const t = setInterval(() => setIndex((p) => (p + 1) % n), 5500);
    return () => clearInterval(t);
  }, [n]);

  if (n === 0) return null;

  const b = list[index];
  const inner = (
    <div className="banner-frame">
      {/* Blurred, dimmed copy of the banner fills the stage so smaller / off-ratio
          images still look full and edge-to-edge instead of sitting on flat bars. */}
      <div className="banner-bg" style={{ backgroundImage: `url("${b.image_url}")` }} aria-hidden="true" />
      <img src={b.image_url} alt={b.title || 'Goodwill Printers banner'} className="banner-img" />
    </div>
  );

  return (
    <section className="banner-carousel" aria-label="Featured banners">
      <div className="banner-stage">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            className="banner-slide"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: 'easeInOut' }}
          >
            {b.link ? <Link href={b.link} aria-label={b.title || 'View'}>{inner}</Link> : inner}
          </motion.div>
        </AnimatePresence>

        {n > 1 && (
          <>
            <button className="banner-arrow prev" onClick={() => go(index - 1)} aria-label="Previous banner"><ChevronLeft size={22} /></button>
            <button className="banner-arrow next" onClick={() => go(index + 1)} aria-label="Next banner"><ChevronRight size={22} /></button>
            <div className="banner-dots">
              {list.map((_, d) => (
                <button key={d} className={d === index ? 'active' : ''} onClick={() => go(d)} aria-label={`Go to banner ${d + 1}`} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
