'use client';
import { motion } from 'motion/react';

const EASE = [0.22, 1, 0.36, 1];

/**
 * Scroll-reveal wrapper — fades + slides its children in once they enter view.
 * Usage: <Reveal delay={0.1}>...</Reveal>
 */
export default function Reveal({ children, delay = 0, y = 26, className, style }) {
  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
