import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('staffUser');
    if (saved) setStaff(JSON.parse(saved));
    setLoading(false);
  }, []);

  async function login(username, password) {
    const { data } = await api.post('/staff/login', { username, password });
    localStorage.setItem('staffToken', data.data.accessToken);
    localStorage.setItem('staffRefreshToken', data.data.refreshToken);
    localStorage.setItem('staffUser', JSON.stringify(data.data.staff));
    setStaff(data.data.staff);
  }

  function logout() {
    localStorage.removeItem('staffToken');
    localStorage.removeItem('staffRefreshToken');
    localStorage.removeItem('staffUser');
    setStaff(null);
  }

  return (
    <AuthContext.Provider value={{ staff, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
