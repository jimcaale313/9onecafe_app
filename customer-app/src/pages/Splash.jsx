import { useNavigate } from 'react-router-dom';
import styles from './Splash.module.css';

export default function Splash() {
  const navigate = useNavigate();

  return (
    <div className={styles.splash}>
      <div className={styles.top}>
        <p className={styles.est}>EST. 2024</p>
      </div>

      <div className={styles.center}>
        <h1 className={styles.logoNum}>9ONE</h1>
        <div className={styles.divider}>
          <span className={styles.dividerLine} />
          <span className={styles.dividerDot} />
          <span className={styles.dividerLine} />
        </div>
        <h2 className={styles.logoCafe}>CAFÉ</h2>
        <p className={styles.tagline}>
          A Curated Boutique Experience for the Discerning Coffee Connoisseur.
        </p>
      </div>

      <div className={styles.bottom}>
        <button className={styles.enterBtn} onClick={() => navigate('/login')}>
          Enter Experience
        </button>
        <p className={styles.premiumLabel}>Premium Access Only</p>
        <div className={styles.dots}>
          <span /><span /><span />
        </div>
      </div>
    </div>
  );
}
