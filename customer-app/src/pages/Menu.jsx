import { useEffect, useState } from 'react';
import AppHeader from '../components/AppHeader';
import BottomNav from '../components/BottomNav';
import api from '../services/api';
import styles from './Menu.module.css';

const CATEGORY_EMOJI = {
  Coffee: '☕', 'Hot Tea': '🍵', Matcha: '🧋', Signature: '✨',
  Frappes: '🥤', Mojitos: '🍹', Smoothies: '🌿', 'Fresh Juice': '🍓',
  'Iced Tea': '🌺', Milkshakes: '🥛', Breakfast: '🍳', Burgers: '🍔',
  Pizza: '🍕', Pasta: '🍝', 'Main Course': '🍛', Salads: '🥗',
  Sandwiches: '🌯', Soups: '🍜', Sides: '🍟', Desserts: '🎂',
};

function ItemImage({ src, category }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return <span className={styles.cardEmoji}>{CATEGORY_EMOJI[category] || '🍽️'}</span>;
  }
  return (
    <img
      src={src}
      alt=""
      className={styles.cardImage}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

export default function Menu() {
  const [grouped, setGrouped] = useState({});
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/menu').then(({ data }) => {
      setGrouped(data.data);
      const firstPc = Object.keys(data.data)[0];
      const firstCat = firstPc ? Object.keys(data.data[firstPc])[0] : '';
      setActiveCategory(firstCat);
    }).finally(() => setLoading(false));
  }, []);

  const allCategories = Object.values(grouped).flatMap(pc => Object.keys(pc));
  const allItems = Object.values(grouped).flatMap(pc => Object.values(pc).flat());

  const displayItems = search
    ? allItems.filter(i => i.name.toLowerCase().includes(search.toLowerCase()))
    : Object.values(grouped).flatMap(pc => pc[activeCategory] || []);

  return (
    <div className={styles.page}>
      <AppHeader />
      <div className={styles.content}>
        <input
          type="text"
          placeholder="Search our signature menu..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className={styles.search}
        />

        {!search && (
          <div className={styles.tabs}>
            {allCategories.map(cat => (
              <button
                key={cat}
                className={`${styles.tab} ${cat === activeCategory ? styles.activeTab : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <p className={styles.loading}>Loading menu...</p>
        ) : (
          <div className={styles.grid}>
            {displayItems.map((item, i) => (
              <div
                key={item.id}
                className={styles.card}
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                <div className={styles.cardImg}>
                  <ItemImage src={item.imageUrl} category={item.category} />
                </div>
                <div className={styles.cardBody}>
                  <p className={styles.itemName}>{item.name}</p>
                  <div className={styles.cardFooter}>
                    <p className={styles.itemPrice}>${parseFloat(item.price).toFixed(2)}</p>
                    <button className={styles.addBtn}>+</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
