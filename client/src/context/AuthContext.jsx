import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authApi } from '../services/api.js';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!localStorage.getItem('excelflow_token'));

  useEffect(() => {
    if (!localStorage.getItem('excelflow_token')) return;
    authApi.profile().then((d) => setUser(d.user)).catch(() => localStorage.removeItem('excelflow_token')).finally(() => setLoading(false));
  }, []);

  const finish = useCallback((d) => { localStorage.setItem('excelflow_token', d.token); setUser(d.user); }, []);
  const login = async (body) => finish(await authApi.login(body));
  const register = async (body) => finish(await authApi.register(body));
  const logout = () => { localStorage.removeItem('excelflow_token'); setUser(null); };

  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>;
}
