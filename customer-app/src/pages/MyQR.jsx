import { useEffect, useState } from 'react';
import AppHeader from '../components/AppHeader';
import BottomNav from '../components/BottomNav';
import LoyaltyCard from '../components/LoyaltyCard';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import styles from './MyQR.module.css';

export default function MyQR() {
  const { user } = useAuth();
  const [qrImage, setQrImage] = useState('');
  const [stamps, setStamps] = useState(user?.currentStamps ?? 0);
  const [totalStamps, setTotalStamps] = useState(user?.totalStamps ?? 0);
  const [name, setName] = useState(user?.name ?? 'Guest');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/customer/qr'),
      api.get('/customer/me'),
    ]).then(([qrRes, meRes]) => {
      setQrImage(qrRes.data.data.qrImage);
      setStamps(meRes.data.data.currentStamps);
      setTotalStamps(meRes.data.data.totalStamps);
      setName(meRes.data.data.name);
    }).finally(() => setLoading(false));
  }, []);

  const canRedeem = stamps >= 6;

  return (
    <div className={styles.page}>
      <AppHeader />
      <div className={styles.content}>
        <h2 className={styles.title}>My Loyalty Card</h2>
        <p className={styles.subtitle}>Show this to staff when you buy a coffee</p>

        <LoyaltyCard
          name={name}
          currentStamps={stamps}
          totalStamps={totalStamps}
          qrImage={qrImage}
          loading={loading}
        />

        <button
          className={`${styles.redeemBtn} ${canRedeem ? styles.redeemActive : ''}`}
          disabled={!canRedeem}
        >
          {canRedeem ? '🎉 Redeem Free Coffee' : `${6 - stamps} more to a free coffee`}
        </button>

        <div className={styles.quote}>
          <p>🌿 &ldquo;Life is too short for bad coffee.&rdquo;</p>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
