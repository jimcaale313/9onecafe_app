import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import api from '../services/api';
import styles from './AdminDashboard.module.css';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/admin/dashboard'),
      api.get('/admin/reports?days=30'),
    ]).then(([s, r]) => {
      setStats(s.data.data);
      setReport(r.data.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className={styles.loading}>Loading dashboard...</div>;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Dashboard</h1>
        <p className={styles.sub}>Overview of loyalty activity</p>
      </div>

      <div className={styles.statGrid}>
        <StatCard label="Total Customers" value={stats?.totalCustomers ?? '—'} icon="👥" delay={0} />
        <StatCard label="Stamps Today" value={stats?.stampsToday ?? '—'} icon="☕" delay={0.08} />
        <StatCard label="Redemptions This Month" value={stats?.redemptionsMonth ?? '—'} icon="🎁" delay={0.16} />
      </div>

      <div className={styles.chartCard}>
        <h2 className={styles.chartTitle}>Stamp Activity — Last 30 Days</h2>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={report} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="stamps" name="Stamps Added" fill="#5B7E3C" radius={[4, 4, 0, 0]} />
            <Bar dataKey="redemptions" name="Redemptions" fill="#F5C518" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, delay = 0 }) {
  return (
    <div className={styles.statCard} style={{ animationDelay: `${delay}s` }}>
      <span className={styles.statIcon}>{icon}</span>
      <p className={styles.statValue}>{value}</p>
      <p className={styles.statLabel}>{label}</p>
    </div>
  );
}
