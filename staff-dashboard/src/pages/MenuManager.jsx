import { useState, useEffect } from 'react';
import api from '../services/api';
import styles from './MenuManager.module.css';

export default function MenuManager() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ name: '', category: '', productCategory: '', price: '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  async function load() {
    const { data } = await api.get('/menu');
    const flat = [];
    for (const pc of Object.values(data.data)) {
      for (const cat of Object.values(pc)) flat.push(...cat);
    }
    setItems(flat);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function addItem(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/admin/menu', { ...form, price: parseFloat(form.price) });
      setMsg('Item added!');
      setForm({ name: '', category: '', productCategory: '', price: '' });
      load();
    } catch (err) {
      setMsg(err.response?.data?.error || 'Error');
    } finally {
      setSaving(false);
    }
  }

  async function removeItem(id) {
    if (!window.confirm('Remove this item from the menu?')) return;
    await api.delete(`/admin/menu/${id}`);
    load();
  }

  const filtered = items.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Menu Manager</h1>
        <p className={styles.sub}>{items.length} items in menu</p>
      </div>

      <div className={styles.layout}>
        <div className={styles.listSection}>
          <input
            placeholder="Search menu..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={styles.search}
          />
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead><tr><th>Name</th><th>Category</th><th>Price</th><th></th></tr></thead>
              <tbody>
                {loading
                  ? <tr><td colSpan={4} className={styles.center}>Loading...</td></tr>
                  : filtered.map(item => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td><span className={styles.catBadge}>{item.category}</span></td>
                      <td className={styles.price}>${parseFloat(item.price).toFixed(2)}</td>
                      <td>
                        <button className={styles.removeBtn} onClick={() => removeItem(item.id)}>Remove</button>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>

        <div className={styles.addSection}>
          <h2 className={styles.formTitle}>Add New Item</h2>
          <form onSubmit={addItem} className={styles.form}>
            <Field label="Item Name" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} required />
            <Field label="Category" value={form.category} onChange={v => setForm(f => ({ ...f, category: v }))} placeholder="e.g. Coffee, Burgers" required />
            <Field label="Product Category" value={form.productCategory} onChange={v => setForm(f => ({ ...f, productCategory: v }))} placeholder="e.g. Hot Beverages, Food" required />
            <Field label="Price (USD)" type="number" step="0.01" min="0" value={form.price} onChange={v => setForm(f => ({ ...f, price: v }))} required />
            {msg && <p className={styles.msg}>{msg}</p>}
            <button type="submit" className={styles.addBtn} disabled={saving}>
              {saving ? 'Adding...' : '+ Add Item'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, ...props }) {
  return (
    <div className={styles.field}>
      <label>{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} {...props} className={styles.input} />
    </div>
  );
}
