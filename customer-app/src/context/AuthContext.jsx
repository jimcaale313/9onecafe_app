import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('customerUser');
    if (saved) setUser(JSON.parse(saved));
    setLoading(false);
  }, []);

  async function register(name, phone) {
    const { data } = await api.post('/auth/register', { name, phone });
    localStorage.setItem('customerToken', data.data.accessToken);
    localStorage.setItem('customerUser', JSON.stringify(data.data.user));
    setUser(data.data.user);
  }

  async function login(phone) {
    const { data } = await api.post('/auth/login', { phone });
    localStorage.setItem('customerToken', data.data.accessToken);
    localStorage.setItem('customerUser', JSON.stringify(data.data.user));
    setUser(data.data.user);
  }

  function logout() {
    localStorage.removeItem('customerToken');
    localStorage.removeItem('customerUser');
    setUser(null);
  }

  async function refreshUser() {
    const { data } = await api.get('/customer/me');
    const updated = { ...user, ...data.data };
    localStorage.setItem('customerUser', JSON.stringify(updated));
    setUser(updated);
    return updated;
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
