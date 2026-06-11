import styles from './StampRow.module.css';

export default function StampRow({ current = 0, total = 6 }) {
  return (
    <div className={styles.row}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`${styles.stamp} ${i < current ? styles.filled : styles.empty}`}
          style={i < current ? { animationDelay: `${i * 0.06}s` } : {}}
        >
          <span className={styles.icon}>☕</span>
        </div>
      ))}
    </div>
  );
}
