import { NavLink } from 'react-router-dom';
import styles from './BottomNav.module.css';

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

function ChefHat() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" {...stroke}>
      <path d="M7 13.5a4 4 0 0 1-1-7.86A4.2 4.2 0 0 1 12 3.6a4.2 4.2 0 0 1 6 2.04 4 4 0 0 1-1 7.86" />
      <path d="M7 13.5h10v4.2a1.3 1.3 0 0 1-1.3 1.3H8.3A1.3 1.3 0 0 1 7 17.7z" />
    </svg>
  );
}
function Cloche() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" {...stroke}>
      <path d="M3.5 18h17" />
      <path d="M5 18a7 7 0 0 1 14 0" />
      <path d="M12 8V6.4" />
      <circle cx="12" cy="5.4" r="1" />
    </svg>
  );
}
function Scan() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" {...stroke}>
      <path d="M4 8V6.5A2.5 2.5 0 0 1 6.5 4H8" />
      <path d="M16 4h1.5A2.5 2.5 0 0 1 20 6.5V8" />
      <path d="M20 16v1.5a2.5 2.5 0 0 1-2.5 2.5H16" />
      <path d="M8 20H6.5A2.5 2.5 0 0 1 4 17.5V16" />
      <path d="M4 12h16" />
    </svg>
  );
}
function Clock() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" {...stroke}>
      <circle cx="12" cy="12" r="8.2" />
      <path d="M12 7.6V12l3 1.8" />
    </svg>
  );
}
function Star() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" {...stroke}>
      <path d="M12 4.2l2.34 4.74 5.23.76-3.78 3.69.89 5.21L12 16.34 7.32 18.8l.89-5.21L4.43 9.7l5.23-.76z" />
    </svg>
  );
}

const tabs = [
  { to: '/menu', label: 'Menu', Icon: Cloche },
  { to: '/qr', label: 'Scan', Icon: Scan },
  { to: '/history', label: 'History', Icon: Clock },
  { to: '/feedback', label: 'Feedback', Icon: Star },
];

export default function BottomNav() {
  return (
    <nav className={styles.nav}>
      {/* chef-hat home badge */}
      <NavLink
        to="/home"
        className={({ isActive }) => `${styles.homeBadge} ${isActive ? styles.homeActive : ''}`}
        aria-label="Home"
      >
        <ChefHat />
      </NavLink>

      <div className={styles.items}>
        {tabs.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `${styles.tab} ${isActive ? styles.active : ''}`}
          >
            <Icon />
            <span className={styles.label}>{label}</span>
            <span className={styles.dash} />
          </NavLink>
        ))}
      </div>

      {/* wooden handle end cap */}
      <span className={styles.handle} aria-hidden="true" />
    </nav>
  );
}
