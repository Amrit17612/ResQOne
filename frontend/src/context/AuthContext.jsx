import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('resqone_token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.get('/auth/me');
        if (data.success) {
          setUser(data.user);
        }
      } catch (err) {
        localStorage.removeItem('resqone_token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    if (data.success) {
      localStorage.setItem('resqone_token', data.token);
      setUser(data.user);
      return data.user;
    }
  };

  const loginWithToken = (userData, token) => {
    if (token) {
      localStorage.setItem('resqone_token', token);
    }
    if (userData) {
      setUser(userData);
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {}
    localStorage.removeItem('resqone_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, loginWithToken, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

