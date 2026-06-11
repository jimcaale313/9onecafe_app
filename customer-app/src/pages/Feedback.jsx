import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AppHeader from '../components/AppHeader';
import BottomNav from '../components/BottomNav';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import styles from './Feedback.module.css';

const MAX_CHARS = 500;

export default function Feedback() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState([]);
  const [form, setForm] = useState({
    customerName: user?.name || '',
    visitDate: new Date().toISOString().slice(0, 10),
    menuItemsOrdered: [],
    rating: 0,
    feedbackText: '',
  });
  const [itemSearch, setItemSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    api.get('/menu').then(({ data }) => {
      const flat = [];
      for (const pc of Object.values(data.data))
        for (const cat of Object.values(pc)) flat.push(...cat.map(i => i.name));
      setMenuItems(flat);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowDropdown(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filtered = menuItems.filter(n =>
    n.toLowerCase().includes(itemSearch.toLowerCase()) &&
    !form.menuItemsOrdered.includes(n)
  ).slice(0, 8);

  function addItem(name) {
    setForm(f => ({ ...f, menuItemsOrdered: [...f.menuItemsOrdered, name] }));
    setItemSearch('');
    setShowDropdown(false);
  }

  function removeItem(name) {
    setForm(f => ({ ...f, menuItemsOrdered: f.menuItemsOrdered.filter(n => n !== name) }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.rating) { setError('Please select a star rating.'); return; }
    if (!form.menuItemsOrdered.length) { setError('Please select at least one item you ordered.'); return; }
    setError('');
    setSubmitting(true);
    try {
      await api.post('/feedback', { ...form, userId: user?.id });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className={styles.page}>
        <AppHeader />
        <div className={styles.successWrap}>
          <div className={styles.successIcon}>✓</div>
          <h2 className={styles.successTitle}>Thank you, {form.customerName}! 🎉</h2>
          <p className={styles.successSub}>Your feedback helps us serve you better.</p>
          <button className={styles.backBtn} onClick={() => navigate('/home')}>Back to Home</button>
        </div>
        <BottomNav />
      </div>
    );
  }

  const activeRating = hoverRating || form.rating;

  return (
    <div className={styles.page}>
      <AppHeader />
      <div className={styles.content}>
        <h2 className={styles.title}>Share Your Experience</h2>
        <p className={styles.subtitle}>We'd love to hear what you think</p>

        <form onSubmit={handleSubmit} className={styles.form}>

          {/* Name */}
          <div className={styles.field}>
            <label className={styles.label}>Your Name</label>
            <input
              className={styles.input}
              type="text"
              placeholder="Enter your name"
              value={form.customerName}
              onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))}
              required
            />
          </div>

          {/* Date */}
          <div className={styles.field}>
            <label className={styles.label}>Date of Visit</label>
            <input
              className={styles.input}
              type="date"
              value={form.visitDate}
              onChange={e => setForm(f => ({ ...f, visitDate: e.target.value }))}
              required
            />
          </div>

          {/* Menu Items */}
          <div className={styles.field}>
            <label className={styles.label}>What did you order?</label>
            <div className={styles.itemTags}>
              {form.menuItemsOrdered.map(name => (
                <span key={name} className={styles.tag}>
                  {name}
                  <button type="button" className={styles.tagRemove} onClick={() => removeItem(name)}>×</button>
                </span>
              ))}
            </div>
            <div className={styles.dropdownWrap} ref={dropdownRef}>
              <input
                className={styles.input}
                type="text"
                placeholder="Search menu items..."
                value={itemSearch}
                onChange={e => { setItemSearch(e.target.value); setShowDropdown(true); }}
                onFocus={() => setShowDropdown(true)}
              />
              {showDropdown && filtered.length > 0 && (
                <div className={styles.dropdown}>
                  {filtered.map(name => (
                    <button key={name} type="button" className={styles.dropdownItem} onClick={() => addItem(name)}>
                      {name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Star Rating */}
          <div className={styles.field}>
            <label className={styles.label}>Your Rating</label>
            <div className={styles.starsWrap}>
              <div className={styles.stars}>
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    type="button"
                    className={`${styles.star} ${n <= activeRating ? styles.starFilled : ''}`}
                    onMouseEnter={() => setHoverRating(n)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setForm(f => ({ ...f, rating: n }))}
                  >
                    ★
                  </button>
                ))}
              </div>
              {form.rating > 0 && (
                <span className={styles.ratingText}>{form.rating} / 5</span>
              )}
            </div>
          </div>

          {/* Feedback Text */}
          <div className={styles.field}>
            <label className={styles.label}>Your Feedback</label>
            <div className={styles.textareaWrap}>
              <textarea
                className={styles.textarea}
                placeholder="Tell us about your experience — what did you love? What can we improve?"
                value={form.feedbackText}
                onChange={e => setForm(f => ({ ...f, feedbackText: e.target.value.slice(0, MAX_CHARS) }))}
                rows={5}
                required
              />
              <span className={`${styles.charCount} ${form.feedbackText.length >= MAX_CHARS ? styles.charLimit : ''}`}>
                {form.feedbackText.length} / {MAX_CHARS}
              </span>
            </div>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.submitBtn} disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Feedback'}
          </button>

        </form>
      </div>
      <BottomNav />
    </div>
  );
}
