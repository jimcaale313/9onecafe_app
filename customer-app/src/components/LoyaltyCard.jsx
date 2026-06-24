import CoffeeCup from './CoffeeCup';
import styles from './LoyaltyCard.module.css';

export default function LoyaltyCard({
  name = 'Guest',
  currentStamps = 0,
  totalStamps = 0,
  total = 6,
  qrImage = '',
  loading = false,
  onClick,
}) {
  const rewards = Math.floor((totalStamps || 0) / total);

  return (
    <div
      className={`${styles.card} ${onClick ? styles.clickable : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
    >
      {/* ambient glows */}
      <span className={styles.glowA} />
      <span className={styles.glowB} />

      {/* top: logo + stamp count */}
      <div className={styles.top}>
        <div className={styles.logo}>
          <span className={styles.logoNum}>9ONE</span>
          <span className={styles.logoCafe}>CAFÉ</span>
        </div>
        <div className={styles.stampCount}>
          <span className={styles.stampLabel}>STAMPS</span>
          <span className={styles.stampValue}>{currentStamps}/{total}</span>
        </div>
      </div>

      {/* cups row */}
      <div className={styles.cups}>
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`${styles.cup} ${i % 2 === 1 ? styles.cupLow : ''}`}
          >
            <CoffeeCup filled={i < currentStamps} delay={i * 0.06} />
          </div>
        ))}
      </div>

      {/* name + rewards */}
      <div className={styles.meta}>
        <div>
          <p className={styles.metaLabel}>FULL NAME</p>
          <p className={styles.metaName}>{name}</p>
        </div>
        <div className={styles.metaRight}>
          <p className={styles.metaLabel}>REWARDS</p>
          <p className={styles.metaRewards}>{rewards}</p>
        </div>
      </div>

      {/* QR */}
      {qrImage || loading ? (
        <div className={styles.qrWrap}>
          {loading ? (
            <div className={styles.qrLoader} />
          ) : (
            <img src={qrImage} alt="Your loyalty QR code" className={styles.qrImg} />
          )}
        </div>
      ) : (
        <div className={styles.qrHint}>Tap to show your QR code</div>
      )}
    </div>
  );
}
