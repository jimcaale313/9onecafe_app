import { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import CustomerCard from '../components/CustomerCard';
import api from '../services/api';
import styles from './Scanner.module.css';

export default function Scanner() {
  const [customer, setCustomer] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(true);
  const scannerRef = useRef(null);
  const scannerInstanceRef = useRef(null);

  useEffect(() => {
    if (!scanning) return;
    const scanner = new Html5QrcodeScanner('qr-reader', { fps: 10, qrbox: 250 }, false);
    scannerInstanceRef.current = scanner;
    scanner.render(
      async qrCode => {
        scanner.clear().catch(() => {});
        setScanning(false);
        setError('');
        setLoading(true);
        try {
          const { data } = await api.post('/stamps/scan', { qrCode });
          setCustomer(data.data);
        } catch (err) {
          setError(err.response?.data?.error || 'Customer not found');
        } finally {
          setLoading(false);
        }
      },
      () => {}
    );
    return () => { scanner.clear().catch(() => {}); };
  }, [scanning]);

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

  function reset() {
    setCustomer(null);
    setError('');
    setScanning(true);
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>QR Scanner</h1>
        <p className={styles.sub}>Scan customer QR code to manage stamps</p>
      </div>

      {scanning && (
        <div className={styles.scannerWrap}>
          <div id="qr-reader" ref={scannerRef} />
          {loading && <p className={styles.loadingText}>Looking up customer...</p>}
          {error && <p className={styles.errorText}>{error}</p>}
        </div>
      )}

      {customer && (
        <div className={styles.resultWrap}>
          <CustomerCard
            customer={customer}
            onAddStamp={addStamp}
            onRedeem={redeem}
            loading={loading}
          />
          {error && <p className={styles.errorText}>{error}</p>}
          <button className={styles.resetBtn} onClick={reset}>← Scan Another Customer</button>
        </div>
      )}
    </div>
  );
}
