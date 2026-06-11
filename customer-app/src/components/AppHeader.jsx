import { useAuth } from '../context/AuthContext';
import styles from './AppHeader.module.css';

export default function AppHeader() {
  const { user } = useAuth();
  const initial = user?.name?.charAt(0)?.toUpperCase() || '?';

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <div className={styles.avatar}>{initial}</div>
      </div>
      <div className={styles.logo}>
        <span className={styles.logoText}>9ONE Café</span>
      </div>
      <div className={styles.right}>
        <button className={styles.bell} aria-label="Notifications">🔔</button>
      </div>
    </header>
  );
}
