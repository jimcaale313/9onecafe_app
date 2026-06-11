import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import styles from './Customers.module.css';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ page, limit: 20, search }).toString();
      const { data } = await api.get(`/admin/customers?${q}`);
      setCustomers(data.data.customers);
      setTotal(data.data.total);
      setPages(data.data.pages);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetch(); }, [fetch]);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Customers</h1>
          <p className={styles.sub}>{total} registered customers</p>
        </div>
      </div>

      <input
        type="text"
        placeholder="Search by name or phone..."
        value={search}
        onChange={e => { setSearch(e.target.value); setPage(1); }}
        className={styles.search}
      />

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Current Stamps</th>
              <th>Total Stamps</th>
              <th>Joined</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className={styles.loadingCell}>Loading...</td></tr>
            ) : customers.map(c => (
              <tr key={c.id}>
                <td className={styles.nameCell}>
                  <div className={styles.avatar}>{c.name.charAt(0)}</div>
                  {c.name}
                </td>
                <td>{c.phone}</td>
                <td>
                  <span className={styles.stampBadge}>{c.currentStamps} / 6</span>
                </td>
                <td>{c.totalStamps}</td>
                <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                <td>
                  <button className={styles.viewBtn} onClick={() => navigate(`/customers/${c.id}`)}>
                    View
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
