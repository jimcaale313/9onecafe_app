import StampGrid from './StampGrid';
import styles from './CustomerCard.module.css';

export default function CustomerCard({ customer, onAddStamp, onRedeem, loading }) {
  if (!customer) return null;
  const { name, currentStamps, totalStamps, createdAt, canRedeem, stampsNeeded } = customer;
  const initial = name?.charAt(0)?.toUpperCase() || '?';
  const memberSince = new Date(createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.sessionLabel}>ACTIVE SESSION</span>
        <span className={styles.verified}>✓ VERIFIED</span>
      </div>

      <div className={styles.profile}>
        <div className={styles.avatar}>{initial}</div>
        <div>
          <h2 className={styles.name}>{name}</h2>
          <p className={styles.since}>Member since {memberSince}</p>
        </div>
      </div>

      <div className={styles.loyaltySection}>
        <div className={styles.loyaltyHeader}>
          <div>
            <p className={styles.loyaltyLabel}>Loyalty Progress</p>
            <p className={styles.stampCount}>{currentStamps} / 6 Stamps</p>
          </div>
          <span className={styles.trophy}>🏆</span>
        </div>
        <StampGrid current={currentStamps} total={6} />
      </div>

      <button
        className={styles.addBtn}
        onClick={onAddStamp}
        disabled={loading}
      >
        {loading ? 'Processing...' : '+ Add Stamp'}
      </button>

      <button
        className={`${styles.redeemBtn} ${canRedeem ? styles.redeemActive : ''}`}
        onClick={onRedeem}
        disabled={!canRedeem || loading}
      >
        Redeem Free Coffee
      </button>

      {!canRedeem && (
        <p className={styles.hint}>{stampsNeeded} more stamp{stampsNeeded !== 1 ? 's' : ''} needed for redemption</p>
      )}

      <div className={styles.totalRow}>
        <span>Total lifetime stamps</span>
        <strong>{totalStamps}</strong>
      </div>
    </div>
  );
}
