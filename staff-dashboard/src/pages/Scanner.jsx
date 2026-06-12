import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import CustomerCard from '../components/CustomerCard';
import api from '../services/api';
import styles from './Scanner.module.css';

export default function Scanner() {
  const [customer, setCustomer] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(true);
  const qrRef = useRef(null);

  useEffect(() => {
    if (!scanning) return;

    let active = true;
    const qr = new Html5Qrcode('qr-reader');
    qrRef.current = qr;

    async function start() {
      const config = { fps: 10, qrbox: { width: 280, height: 280 } };
      try {
        await qr.start(
          { facingMode: { exact: 'environment' } },
          config,
          handleScan,
          () => {}
        );
      } catch {
        try {
          await qr.start(
            { facingMode: 'environment' },
            config,
            handleScan,
            () => {}
          );
        } catch {
          try {
            const cameras = await Html5Qrcode.getCameras();
            const back =
              cameras.find(c => /back|rear|environment/i.test(c.label)) ||
              cameras[cameras.length - 1];
            if (back) {
              await qr.start(back.id, config, handleScan, () => {});
            } else {
              setError('No camera available');
            }
          } catch {
            setError('Camera access denied. Please allow camera permissions.');
          }
        }
      }
    }

    async function handleScan(qrCode) {
      if (!active) return;
      active = false;
      try { await qr.stop(); } catch {}
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
    }

    start();

    return () => {
      active = false;
      qr.stop().catch(() => {}).then(() => qr.clear().catch(() => {}));
    };
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
          <div id="qr-reader" />
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
