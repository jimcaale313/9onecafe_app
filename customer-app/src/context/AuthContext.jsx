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

  async function register(name, phone, password) {
    const { data } = await api.post('/auth/register', { name, phone, password });
    localStorage.setItem('customerToken', data.data.accessToken);
    localStorage.setItem('customerUser', JSON.stringify(data.data.user));
    setUser(data.data.user);
  }

  async function login(phone, password) {
    const { data } = await api.post('/auth/login', { phone, password });
    localStorage.setItem('customerToken', data.data.accessToken);
    localStorage.setItem('customerUser', JSON.stringify(data.data.user));
    setUser(data.data.user);
  }

  async function forgotPassword(phone, newPassword) {
    await api.post('/auth/forgot-password', { phone, newPassword });
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
    <AuthContext.Provider value={{ user, login, register, logout, loading, refreshUser, forgotPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
