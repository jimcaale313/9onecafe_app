import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Login.module.css';

export default function Login() {
  const { login, register, user } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ name: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) {
    navigate('/home', { replace: true });
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'register') {
        await register(form.name, form.phone);
      } else {
        await login(form.phone);
      }
      navigate('/home', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.logo}>
        <span className={styles.logoNum}>9ONE</span>
        <span className={styles.logoCafe}>CAFÉ</span>
        <span className={styles.logoDot} />
      </div>

      <div className={styles.tabs}>
        <button className={`${styles.tab} ${mode === 'login' ? styles.active : ''}`} onClick={() => setMode('login')}>Sign In</button>
        <button className={`${styles.tab} ${mode === 'register' ? styles.active : ''}`} onClick={() => setMode('register')}>Register</button>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {mode === 'register' && (
          <div className={styles.field}>
            <label>Full Name</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Your name"
              required
            />
          </div>
        )}
        <div className={styles.field}>
          <label>Phone Number</label>
          <input
            type="tel"
            value={form.phone}
            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            placeholder="+252xxxxxxxxx"
            required
          />
        </div>
        {error && <p className={styles.error}>{error}</p>}
        <button type="submit" className={styles.btn} disabled={loading}>
          {loading ? '...' : mode === 'register' ? 'Create Account' : 'Sign In'}
        </button>
      </form>

      <button className={styles.switchMode} onClick={() => setMode(m => m === 'login' ? 'register' : 'login')}>
        {mode === 'login' ? "Don't have an account? Register" : 'Already registered? Sign in'}
      </button>
    </div>
  );
}
