import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api, { setAuthHeader, clearAuthHeader } from '../api/client';
import { getToken, getStoredUser, storeAuth, clearAuth } from '../utils/authStorage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => getStoredUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    setAuthHeader(token);
    // Validate the stored token against the server
    api
      .get('/auth/me')
      .then(({ data }) => {
        setUser(data);
        storeAuth(token, data);
      })
      .catch(() => {
        clearAuth();
        clearAuthHeader();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handleExpired = () => {
      setUser(null);
      clearAuthHeader();
    };
    window.addEventListener('auth:expired', handleExpired);
    return () => window.removeEventListener('auth:expired', handleExpired);
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    storeAuth(data.token, data.user);
    setAuthHeader(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    storeAuth(data.token, data.user);
    setAuthHeader(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    clearAuthHeader();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const token = getToken();
    if (!token) return null;
    const { data } = await api.get('/auth/me');
    setUser(data);
    storeAuth(token, data);
    return data;
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside an AuthProvider');
  return context;
};
