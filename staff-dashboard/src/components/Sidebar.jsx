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

export default function Sidebar({ open = false, onClose = () => {} }) {
  const { staff, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const links = staff?.role === 'admin' ? [...adminLinks, ...staffLinks] : staffLinks;

  return (
    <>
      {open && <div className={styles.backdrop} onClick={onClose} />}

      <aside className={`${styles.sidebar} ${open ? styles.open : ''}`}>
        <div className={styles.logo}>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close menu">×</button>
          <span className={styles.logoNum}>9ONE</span>
          <span className={styles.logoCafe}>CAFÉ</span>
          <span className={styles.role}>{staff?.role?.toUpperCase()}</span>
        </div>

        <nav className={styles.nav}>
          {links.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              onClick={onClose}
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
    </>
  );
}
