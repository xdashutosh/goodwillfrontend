'use client';
import { Navigation } from 'lucide-react';
import styles from './location.module.css';

/**
 * "Get directions" + explicit app choices for the office/factory.
 * The main button opens the visitor's own maps app where possible:
 *   Android → geo: link (the system "Open with" chooser: Google Maps, Waze, …)
 *   iPhone/iPad → Apple Maps
 *   desktop → Google Maps directions in a new tab (also the no-JS fallback)
 */
export default function Directions({ location, compact = false }) {
  const openInApp = (e) => {
    const ua = navigator.userAgent || '';
    const iOS = /iPhone|iPad|iPod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    if (/Android/i.test(ua)) {
      e.preventDefault();
      window.location.href = location.geoUri;
    } else if (iOS) {
      e.preventDefault();
      window.location.href = location.links.apple;
    }
  };

  return (
    <div className={`${styles.directions} ${compact ? styles.compact : ''}`}>
      <a
        href={location.links.google}
        target="_blank"
        rel="noopener noreferrer"
        onClick={openInApp}
        className={styles.go}
      >
        <Navigation size={compact ? 16 : 18} aria-hidden="true" /> Get directions
      </a>
      <p className={styles.apps}>
        <span>Open in</span>
        <a href={location.links.google} target="_blank" rel="noopener noreferrer">Google Maps</a>
        <a href={location.links.apple} target="_blank" rel="noopener noreferrer">Apple Maps</a>
        <a href={location.links.waze} target="_blank" rel="noopener noreferrer">Waze</a>
      </p>
    </div>
  );
}
