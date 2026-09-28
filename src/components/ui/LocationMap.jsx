import styles from './location.module.css';

/**
 * Embedded Google Map pinned on the office/factory (lazy-loaded, so it costs
 * nothing until it scrolls into view). `location` comes from officeLocation().
 */
export default function LocationMap({ location, className = '' }) {
  return (
    <div className={`${styles.map} ${className}`}>
      <iframe
        src={location.embedUrl}
        title={`Map showing ${location.name}`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
      <a href={location.viewUrl} target="_blank" rel="noopener noreferrer" className={styles.enlarge}>
        View larger map
      </a>
    </div>
  );
}
