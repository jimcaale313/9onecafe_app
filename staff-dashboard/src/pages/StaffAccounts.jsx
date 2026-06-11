import { useState, useEffect } from 'react';
import api from '../services/api';
import styles from './StaffAccounts.module.css';

export default function StaffAccounts() {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', username: '', password: '', role: 'staff' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  async function load() {
    const { data } = await api.get('/admin/staff');
    setStaffList(data.data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function create(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/admin/staff', form);
      setMsg('Staff account created!');
      setForm({ name: '', username: '', password: '', role: 'staff' });
      load();
    } catch (err) {
      setMsg(err.response?.data?.error || 'Error');
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(id, isActive) {
    await api.patch(`/admin/staff/${id}`, { isActive: !isActive });
    load();
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Staff Accounts</h1>
        <p className={styles.sub}>{staffList.length} accounts</p>
      </div>

      <div className={styles.layout}>
        <div className={styles.listSection}>
          {loading ? <p>Loading...</p> : staffList.map(s => (
            <div key={s.id} className={styles.staffCard}>
              <div className={styles.staffAvatar}>{s.name.charAt(0)}</div>
              <div className={styles.staffInfo}>
                <p className={styles.staffName}>{s.name}</p>
                <p className={styles.staffMeta}>@{s.username} · <span className={styles.roleTag}>{s.role}</span></p>
              </div>
              <div className={styles.staffActions}>
                <span className={`${styles.statusDot} ${s.isActive ? styles.active : styles.inactive}`} />
                <button
                  className={`${styles.toggleBtn} ${s.isActive ? styles.deactivate : styles.activate}`}
                  onClick={() => toggleActive(s.id, s.isActive)}
                >
                  {s.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.formSection}>
          <h2 className={styles.formTitle}>Create New Account</h2>
          <form onSubmit={create} className={styles.form}>
            <Field label="Full Name" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} required />
            <Field label="Username" value={form.username} onChange={v => setForm(f => ({ ...f, username: v }))} required />
            <Field label="Password" type="password" value={form.password} onChange={v => setForm(f => ({ ...f, password: v }))} required />
            <div className={styles.field}>
              <label>Role</label>
              <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} className={styles.input}>
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            {msg && <p className={styles.msg}>{msg}</p>}
            <button type="submit" className={styles.createBtn} disabled={saving}>
              {saving ? 'Creating...' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', ...props }) {
  return (
    <div className={styles.field}>
      <label>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} {...props} className={styles.input} />
    </div>
  );
}
