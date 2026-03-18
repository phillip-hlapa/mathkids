import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('mk_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('mk_token');
    const savedUser = localStorage.getItem('mk_user');
    const adminFlag = localStorage.getItem('mk_admin');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAdmin(adminFlag === 'true');
    }
    setLoading(false);
  }, []);

  const register = async (username, password) => {
    const { data } = await api.post('/auth/register', { username, password });
    localStorage.setItem('mk_token', data.token);
    localStorage.setItem('mk_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const login = async (username, password) => {
    const { data } = await api.post('/auth/login', { username, password });
    localStorage.setItem('mk_token', data.token);
    localStorage.setItem('mk_user', JSON.stringify(data.user));
    setUser(data.user);
    setIsAdmin(false);
    return data.user;
  };

  const adminLogin = async (password) => {
    const { data } = await api.post('/auth/admin-login', { password });
    localStorage.setItem('mk_token', data.token);
    localStorage.setItem('mk_admin', 'true');
    setIsAdmin(true);
    return true;
  };

  const logout = () => {
    localStorage.removeItem('mk_token');
    localStorage.removeItem('mk_user');
    localStorage.removeItem('mk_admin');
    setUser(null);
    setIsAdmin(false);
  };

  const updateUser = (updates) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem('mk_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, register, login, adminLogin, logout, updateUser, api }}>
      {children}
    </AuthContext.Provider>
  );
};
