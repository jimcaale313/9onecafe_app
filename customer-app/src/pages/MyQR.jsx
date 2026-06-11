import { useEffect, useState } from 'react';
import AppHeader from '../components/AppHeader';
import BottomNav from '../components/BottomNav';
import StampRow from '../components/StampRow';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import styles from './MyQR.module.css';

export default function MyQR() {
  const { user } = useAuth();
  const [qrImage, setQrImage] = useState('');
  const [stamps, setStamps] = useState(user?.currentStamps ?? 0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/customer/qr'),
      api.get('/customer/me'),
    ]).then(([qrRes, meRes]) => {
      setQrImage(qrRes.data.data.qrImage);
      setStamps(meRes.data.data.currentStamps);
    }).finally(() => setLoading(false));
  }, []);

  const canRedeem = stamps >= 6;

  return (
    <div className={styles.page}>
      <AppHeader />
      <div className={styles.content}>
        <h2 className={styles.title}>My QR Code</h2>

        <div className={styles.qrCard}>
          <div className={styles.qrInner}>
            <span className={`${styles.corner} ${styles.tl}`} />
            <span className={`${styles.corner} ${styles.tr}`} />
            <span className={`${styles.corner} ${styles.bl}`} />
            <span className={`${styles.corner} ${styles.br}`} />
            {loading ? (
              <div className={styles.qrPlaceholder}>
                <div className={styles.qrLoader} />
                <span>Generating...</span>
              </div>
            ) : (
              <img src={qrImage} alt="Your QR Code" className={styles.qrImg} />
            )}
          </div>
          <p className={styles.qrHint}>Show this to staff when you buy a coffee</p>
        </div>

        <div className={styles.loyaltySection}>
          <div className={styles.loyaltyHeader}>
            <p className={styles.loyaltyLabel}>Loyalty Card</p>
            <p className={styles.loyaltyStat}>You have {stamps}/6 stamps</p>
          </div>
          <StampRow current={stamps} total={6} />
          <button className={`${styles.redeemBtn} ${canRedeem ? styles.redeemActive : ''}`} disabled={!canRedeem}>
            Redeem Reward
          </button>
        </div>

        <div className={styles.quote}>
          <p>🌿 &ldquo;Life is too short for bad coffee.&rdquo;</p>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
