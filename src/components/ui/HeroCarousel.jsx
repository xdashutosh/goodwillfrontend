'use client';
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import hero1 from '@/assets/hero1.png';
import hero2 from '@/assets/hero2.png';
import hero3 from '@/assets/hero3.png';

const SLIDES = [
  { src: hero1, alt: 'Goodwill Printers — Premium Diaries & Notebooks' },
  { src: hero2, alt: 'Goodwill Printers — Wide Range of Styles & Sizes' },
  { src: hero3, alt: 'Goodwill Printers — Corporate Gifting Solutions' },
];

export default function HeroCarousel() {
  const n = SLIDES.length;
  const [index, setIndex] = useState(0);

  const go = useCallback((i) => setIndex(((i % n) + n) % n), [n]);

  useEffect(() => {
    const t = setInterval(() => setIndex((p) => (p + 1) % n), 5500);
    return () => clearInterval(t);
  }, [n]);

  const slide = SLIDES[index];

  return (
    <section className="banner-carousel" aria-label="Hero banner">
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
            <div className="banner-frame">
              {/* Blurred backdrop fills any letterbox area with the image's own colours */}
              <div
                className="banner-bg"
                style={{ backgroundImage: `url(${slide.src.src})` }}
                aria-hidden="true"
              />
              <Image
                src={slide.src}
                alt={slide.alt}
                fill
                className="banner-img"
                style={{ objectFit: 'contain' }}
                priority={index === 0}
                sizes="100vw"
              />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Prev / Next arrows */}
        <button
          className="banner-arrow prev"
          onClick={() => go(index - 1)}
          aria-label="Previous slide"
        >
          <ChevronLeft size={22} />
        </button>
        <button
          className="banner-arrow next"
          onClick={() => go(index + 1)}
          aria-label="Next slide"
        >
          <ChevronRight size={22} />
        </button>

        {/* Dot indicators */}
        <div className="banner-dots">
          {SLIDES.map((_, d) => (
            <button
              key={d}
              className={d === index ? 'active' : ''}
              onClick={() => go(d)}
              aria-label={`Go to slide ${d + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
