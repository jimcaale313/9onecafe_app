import { NavLink } from 'react-router-dom';
import styles from './BottomNav.module.css';

const tabs = [
  { to: '/home', label: 'Home', icon: '🏠' },
  { to: '/menu', label: 'Menu', icon: '🍽️' },
  { to: '/qr', label: 'Scan', icon: '📷' },
  { to: '/history', label: 'History', icon: '🕐' },
  { to: '/feedback', label: 'Feedback', icon: '⭐' },
];

export default function BottomNav() {
  return (
    <nav className={styles.nav}>
      {tabs.map(tab => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className={({ isActive }) => `${styles.tab} ${isActive ? styles.active : ''}`}
        >
          <span className={styles.icon}>{tab.icon}</span>
          <span className={styles.label}>{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
