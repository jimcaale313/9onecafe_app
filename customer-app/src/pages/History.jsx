import { useEffect, useState } from 'react';
import AppHeader from '../components/AppHeader';
import BottomNav from '../components/BottomNav';
import api from '../services/api';
import styles from './History.module.css';

export default function History() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/customer/history').then(({ data }) => setEvents(data.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className={styles.page}>
      <AppHeader />
      <div className={styles.content}>
        <h2 className={styles.title}>Stamp History</h2>

        {loading && <p className={styles.loading}>Loading your history...</p>}

        {!loading && events.length === 0 && (
          <div className={styles.empty}>
            <p className={styles.emptyIcon}>☕</p>
            <p className={styles.emptyText}>No stamps yet. Buy a coffee to get started!</p>
          </div>
        )}

        <div className={styles.list}>
          {events.map((e, i) => {
            const isRedeem = e.eventType === 'redeemed';
            return (
              <div
                key={e.id}
                className={styles.event}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className={`${styles.eventIcon} ${isRedeem ? styles.redeemIcon : ''}`}>
                  {isRedeem ? '🎁' : '☕'}
                </div>
                <div className={styles.eventInfo}>
                  <p className={styles.eventType}>
                    {isRedeem ? 'Free Coffee Redeemed' : 'Stamp Added'}
                  </p>
                  <p className={styles.eventMeta}>
                    {e.stampsBefore} → {e.stampsAfter} stamps · by {e.staffName}
                  </p>
                </div>
                <p className={styles.eventDate}>
                  {new Date(e.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </div>
            );
          })}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
