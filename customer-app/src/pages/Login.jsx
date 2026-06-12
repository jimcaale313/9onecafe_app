import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Login.module.css';

export default function Login() {
  const { login, register, forgotPassword, user } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'forgot'
  const [form, setForm] = useState({ name: '', phone: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) {
    navigate('/home', { replace: true });
    return null;
  }

  function switchMode(next) {
    setMode(next);
    setError('');
    setInfo('');
    setForm(f => ({ ...f, password: '', confirmPassword: '' }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setInfo('');

    if (mode === 'register' || mode === 'forgot') {
      if (form.password.length < 4) {
        setError('Password must be at least 4 characters.');
        return;
      }
      if (form.password !== form.confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === 'register') {
        await register(form.name, form.phone, form.password);
        navigate('/home', { replace: true });
      } else if (mode === 'login') {
        await login(form.phone, form.password);
        navigate('/home', { replace: true });
      } else if (mode === 'forgot') {
        await forgotPassword(form.phone, form.password);
        setInfo('Password reset! Please sign in with your new password.');
        setTimeout(() => switchMode('login'), 1500);
      }
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

      {mode !== 'forgot' && (
        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tab} ${mode === 'login' ? styles.active : ''}`}
            onClick={() => switchMode('login')}
          >Sign In</button>
          <button
            type="button"
            className={`${styles.tab} ${mode === 'register' ? styles.active : ''}`}
            onClick={() => switchMode('register')}
          >Register</button>
        </div>
      )}

      {mode === 'forgot' && (
        <div className={styles.forgotHeader}>
          <h2 className={styles.forgotTitle}>Reset Password</h2>
          <p className={styles.forgotSub}>Enter your phone and a new password</p>
        </div>
      )}

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

        <div className={styles.field}>
          <label>{mode === 'forgot' ? 'New Password' : 'Password'}</label>
          <div className={styles.passwordWrap}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              placeholder={mode === 'login' ? 'Your password' : 'At least 4 characters'}
              required
            />
            <button
              type="button"
              className={styles.eyeBtn}
              onClick={() => setShowPassword(s => !s)}
              tabIndex={-1}
            >
              {showPassword ? '🙈' : '👁'}
            </button>
          </div>
        </div>

        {(mode === 'register' || mode === 'forgot') && (
          <div className={styles.field}>
            <label>Confirm Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={form.confirmPassword}
              onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
              placeholder="Re-enter password"
              required
            />
          </div>
        )}

        {mode === 'login' && (
          <button type="button" className={styles.forgotLink} onClick={() => switchMode('forgot')}>
            Forgot password?
          </button>
        )}

        {error && <p className={styles.error}>{error}</p>}
        {info && <p className={styles.info}>{info}</p>}

        <button type="submit" className={styles.btn} disabled={loading}>
          {loading ? '...' : mode === 'register' ? 'Create Account' : mode === 'forgot' ? 'Reset Password' : 'Sign In'}
        </button>
      </form>

      {mode === 'forgot' ? (
        <button className={styles.switchMode} onClick={() => switchMode('login')}>
          ← Back to Sign In
        </button>
      ) : (
        <button className={styles.switchMode} onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}>
          {mode === 'login' ? "Don't have an account? Register" : 'Already registered? Sign in'}
        </button>
      )}
    </div>
  );
}
