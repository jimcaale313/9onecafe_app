import styles from './StampGrid.module.css';

export default function StampGrid({ current = 0, total = 6 }) {
  return (
    <div className={styles.grid}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`${styles.tile} ${i < current ? styles.filled : styles.empty}`}
          style={i < current ? { animationDelay: `${i * 0.07}s` } : {}}
        >
          <span className={styles.icon}>☕</span>
        </div>
      ))}
    </div>
  );
}
