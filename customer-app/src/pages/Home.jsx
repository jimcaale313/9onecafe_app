import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AppHeader from '../components/AppHeader';
import LoyaltyCard from '../components/LoyaltyCard';
import BottomNav from '../components/BottomNav';
import styles from './Home.module.css';

const categories = [
  { icon: '☕', label: 'Coffee' },
  { icon: '🍵', label: 'Tea' },
  { icon: '🧊', label: 'Cold' },
  { icon: '🍔', label: 'Food' },
  { icon: '🎂', label: 'Desserts' },
  { icon: '🧋', label: 'Matcha' },
  { icon: '🍹', label: 'Mojitos' },
  { icon: '🥤', label: 'Smoothies' },
];

export default function Home() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(user);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    refreshUser().then(setProfile).catch(() => {});
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning,' : hour < 17 ? 'Good afternoon,' : 'Good evening,';
  const name = profile?.name || user?.name || 'Guest';
  const stamps = profile?.currentStamps ?? user?.currentStamps ?? 0;
  const totalStamps = profile?.totalStamps ?? user?.totalStamps ?? 0;

  return (
    <div className={styles.page}>
      <AppHeader />
      <div className={styles.content}>

        <div className={styles.greetRow}>
          <p className={styles.greeting}>{greeting}</p>
          <p className={styles.name}>{name}</p>
        </div>

        {/* Loyalty Card */}
        <LoyaltyCard
          name={name}
          currentStamps={stamps}
          totalStamps={totalStamps}
          onClick={() => navigate('/qr')}
        />

        {/* Categories */}
        <div className={`${styles.section} ${styles.catSection}`}>
          <h3 className={styles.sectionTitle}>Categories</h3>
          <div className={styles.catRow}>
            {categories.map((c, i) => (
              <button
                key={c.label}
                className={`${styles.catItem} ${i === activeIdx ? styles.catActive : ''}`}
                onClick={() => { setActiveIdx(i); navigate('/menu'); }}
              >
                <span className={`${styles.catIcon} ${i === activeIdx ? styles.catIconActive : ''}`}>{c.icon}</span>
                <span className={styles.catLabel}>{c.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Featured */}
        <div className={`${styles.section} ${styles.featuredSection}`}>
          <h3 className={styles.sectionTitle}>Featured Selection</h3>
          <div className={styles.featuredCard} onClick={() => navigate('/menu')}>
            <div className={styles.featuredImg}>
              <span className={styles.featuredEmoji}>☕</span>
            </div>
            <span className={styles.mustTry}>Must Try</span>
            <div className={styles.featuredInfo}>
              <p className={styles.featuredName}>Spanish Latte</p>
              <p className={styles.featuredPrice}>$2.50</p>
            </div>
          </div>
        </div>

      </div>
      <BottomNav />
    </div>
  );
}
