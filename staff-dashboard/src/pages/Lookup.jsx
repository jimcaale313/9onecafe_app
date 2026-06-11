import { useState } from 'react';
import CustomerCard from '../components/CustomerCard';
import api from '../services/api';
import styles from './Lookup.module.css';

export default function Lookup() {
  const [phone, setPhone] = useState('');
  const [customer, setCustomer] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function search(e) {
    e.preventDefault();
    setError('');
    setCustomer(null);
    setLoading(true);
    try {
      const { data } = await api.get(`/stamps/lookup?phone=${encodeURIComponent(phone)}`);
      setCustomer(data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Customer not found');
    } finally {
      setLoading(false);
    }
  }

  async function addStamp() {
    setLoading(true);
    try {
      const { data } = await api.post('/stamps/add', { userId: customer.id });
      setCustomer(data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add stamp');
    } finally {
      setLoading(false);
    }
  }

  async function redeem() {
    if (!window.confirm('Redeem free coffee for this customer?')) return;
    setLoading(true);
    try {
      const { data } = await api.post('/stamps/redeem', { userId: customer.id });
      setCustomer(data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to redeem');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Manual Lookup</h1>
        <p className={styles.sub}>Search by phone number for customers without smartphones</p>
      </div>

      <form onSubmit={search} className={styles.form}>
        <input
          type="tel"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          placeholder="Enter customer phone number"
          className={styles.input}
          required
          autoFocus
        />
        <button type="submit" className={styles.btn} disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && <p className={styles.error}>{error}</p>}

      {customer && (
        <div className={styles.result}>
          <CustomerCard
            customer={customer}
            onAddStamp={addStamp}
            onRedeem={redeem}
            loading={loading}
          />
        </div>
      )}
    </div>
  );
}
