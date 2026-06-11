import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Sidebar.module.css';

const staffLinks = [
  { to: '/scanner', label: 'QR Scanner', icon: '📷' },
  { to: '/lookup', label: 'Manual Lookup', icon: '🔍' },
];

const adminLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/customers', label: 'Customers', icon: '👥' },
  { to: '/menu-manager', label: 'Menu Manager', icon: '🍽️' },
  { to: '/staff-accounts', label: 'Staff Accounts', icon: '👤' },
  { to: '/feedback-manager', label: 'Feedback Manager', icon: '⭐' },
];

export default function Sidebar() {
  const { staff, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const links = staff?.role === 'admin' ? [...adminLinks, ...staffLinks] : staffLinks;

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <span className={styles.logoNum}>9ONE</span>
        <span className={styles.logoCafe}>CAFÉ</span>
        <span className={styles.role}>{staff?.role?.toUpperCase()}</span>
      </div>

      <nav className={styles.nav}>
        {links.map(l => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
          >
            <span>{l.icon}</span>
            <span>{l.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className={styles.bottom}>
        <div className={styles.staffInfo}>
          <div className={styles.staffAvatar}>{staff?.name?.charAt(0)}</div>
          <div>
            <p className={styles.staffName}>{staff?.name}</p>
            <p className={styles.staffUsername}>@{staff?.username}</p>
          </div>
        </div>
        <button className={styles.logoutBtn} onClick={handleLogout}>Logout</button>
      </div>
    </aside>
  );
}
