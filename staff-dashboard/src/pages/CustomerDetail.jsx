import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import StampGrid from '../components/StampGrid';
import styles from './CustomerDetail.module.css';

export default function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adjustStamps, setAdjustStamps] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.get(`/admin/customers/${id}`).then(({ data }) => setCustomer(data.data)).finally(() => setLoading(false));
  }, [id]);

  async function saveStamps(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch(`/admin/customers/${id}/stamps`, { currentStamps: parseInt(adjustStamps) });
      const { data } = await api.get(`/admin/customers/${id}`);
      setCustomer(data.data);
      setMsg('Stamps updated.');
      setAdjustStamps('');
    } catch (err) {
      setMsg(err.response?.data?.error || 'Failed to update');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (!customer) return <div className={styles.loading}>Customer not found.</div>;

  return (
    <div className={styles.page}>
      <button className={styles.back} onClick={() => navigate('/customers')}>← Back to Customers</button>

      <div className={styles.profileCard}>
        <div className={styles.avatar}>{customer.name.charAt(0)}</div>
        <div>
          <h1 className={styles.name}>{customer.name}</h1>
          <p className={styles.phone}>{customer.phone}</p>
          <p className={styles.joined}>Member since {new Date(customer.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
        </div>
      </div>

      <div className={styles.grid2}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Loyalty Status</h2>
          <p className={styles.stampBig}>{customer.currentStamps} / 6 stamps</p>
          <StampGrid current={customer.currentStamps} total={6} />
          <p className={styles.total}>Total lifetime stamps: <strong>{customer.totalStamps}</strong></p>

          <form onSubmit={saveStamps} className={styles.adjustForm}>
            <label>Manually set current stamps (0–6):</label>
            <div className={styles.adjustRow}>
              <input
                type="number" min="0" max="6" required
                value={adjustStamps}
                onChange={e => setAdjustStamps(e.target.value)}
                className={styles.adjustInput}
              />
              <button type="submit" disabled={saving} className={styles.adjustBtn}>
                {saving ? 'Saving...' : 'Update'}
              </button>
            </div>
            {msg && <p className={styles.msg}>{msg}</p>}
          </form>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Stamp History</h2>
          <div className={styles.history}>
            {customer.stampEvents?.length === 0 && <p className={styles.empty}>No events yet.</p>}
            {customer.stampEvents?.map(e => (
              <div key={e.id} className={styles.event}>
                <div>
                  <p className={styles.eventType}>{e.eventType === 'stamp_added' ? '☕ Stamp Added' : '🎁 Redeemed'}</p>
                  <p className={styles.eventMeta}>{e.stamps_before ?? e.stampsBefore} → {e.stamps_after ?? e.stampsAfter} stamps · by {e.staff?.name}</p>
                </div>
                <p className={styles.eventDate}>{new Date(e.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
