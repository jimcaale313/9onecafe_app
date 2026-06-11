import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import styles from './FeedbackManager.module.css';

function Stars({ rating }) {
  return (
    <span className={styles.stars}>
      {[1,2,3,4,5].map(n => (
        <span key={n} style={{ color: n <= rating ? '#F5C518' : '#D1D5DB', fontSize: 16 }}>★</span>
      ))}
    </span>
  );
}

export default function FeedbackManager() {
  const [stats, setStats] = useState(null);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [filterRating, setFilterRating] = useState('');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  const fetchStats = () =>
    api.get('/feedback/admin/stats').then(({ data }) => setStats(data.data)).catch(() => {});

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({
        page,
        ...(filterRating ? { rating: filterRating } : {}),
        ...(filterFrom ? { from: filterFrom } : {}),
        ...(filterTo ? { to: filterTo } : {}),
      }).toString();
      const { data } = await api.get(`/feedback/admin?${q}`);
      setItems(data.data.items);
      setTotal(data.data.total);
      setPages(data.data.pages);
    } finally { setLoading(false); }
  }, [page, filterRating, filterFrom, filterTo]);

  useEffect(() => { fetchStats(); }, []);
  useEffect(() => { fetchItems(); }, [fetchItems]);

  async function handleDelete(id) {
    if (!window.confirm('Delete this review?')) return;
    setDeleting(id);
    try {
      await api.delete(`/feedback/admin/${id}`);
      fetchItems();
      fetchStats();
    } finally { setDeleting(null); }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Feedback Manager</h1>
        <p className={styles.sub}>{total} reviews</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className={styles.statsRow}>
          <div className={styles.avgCard}>
            <span className={styles.avgStar}>⭐</span>
            <div>
              <p className={styles.avgNum}>{stats.averageRating.toFixed(1)}</p>
              <p className={styles.avgLabel}>Average Rating · {stats.totalReviews} reviews</p>
            </div>
          </div>
          <div className={styles.breakdown}>
            {stats.breakdown.map(b => (
              <div key={b.stars} className={styles.barRow}>
                <span className={styles.barLabel}>{b.stars}★</span>
                <div className={styles.barTrack}>
                  <div
                    className={styles.barFill}
                    style={{ width: stats.totalReviews ? `${(b.count / stats.totalReviews) * 100}%` : '0%' }}
                  />
                </div>
                <span className={styles.barCount}>{b.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className={styles.filters}>
        <select
          value={filterRating}
          onChange={e => { setFilterRating(e.target.value); setPage(1); }}
          className={styles.filterSelect}
        >
          <option value="">All Ratings</option>
          {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Stars</option>)}
        </select>
        <input type="date" value={filterFrom} onChange={e => { setFilterFrom(e.target.value); setPage(1); }} className={styles.filterInput} placeholder="From" />
        <input type="date" value={filterTo} onChange={e => { setFilterTo(e.target.value); setPage(1); }} className={styles.filterInput} placeholder="To" />
        {(filterRating || filterFrom || filterTo) && (
          <button className={styles.clearBtn} onClick={() => { setFilterRating(''); setFilterFrom(''); setFilterTo(''); setPage(1); }}>
            Clear Filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Visit Date</th>
              <th>Items Ordered</th>
              <th>Rating</th>
              <th>Feedback</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className={styles.center}>Loading...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={6} className={styles.center}>No feedback yet.</td></tr>
            ) : items.map(f => (
              <tr key={f.id}>
                <td>
                  <div className={styles.customerCell}>
                    <div className={styles.avatar}>{f.customerName.charAt(0)}</div>
                    <div>
                      <p className={styles.customerName}>{f.customerName}</p>
                      <p className={styles.submittedAt}>{new Date(f.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </td>
                <td className={styles.dateCell}>{new Date(f.visitDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                <td>
                  <div className={styles.itemTags}>
                    {f.menuItemsOrdered.slice(0, 3).map(n => (
                      <span key={n} className={styles.itemTag}>{n}</span>
                    ))}
                    {f.menuItemsOrdered.length > 3 && (
                      <span className={styles.moreTag}>+{f.menuItemsOrdered.length - 3}</span>
                    )}
                  </div>
                </td>
                <td><Stars rating={f.rating} /></td>
                <td className={styles.feedbackCell}>{f.feedbackText}</td>
                <td>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => handleDelete(f.id)}
                    disabled={deleting === f.id}
                  >
                    {deleting === f.id ? '...' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className={styles.pagination}>
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className={styles.pageBtn}>← Prev</button>
          <span>Page {page} of {pages}</span>
          <button disabled={page >= pages} onClick={() => setPage(p => p + 1)} className={styles.pageBtn}>Next →</button>
        </div>
      )}
    </div>
  );
}
