import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('smartnet_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('smartnet_token') || null);
  const [loading, setLoading] = useState(true);

  // Synchronize and refresh profile on app mount if token exists
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/profile');
          if (res.success && res.data) {
            setUser(res.data);
            localStorage.setItem('smartnet_user', JSON.stringify(res.data));
          }
        } catch (err) {
          console.warn('Session verification failed:', err.message);
          // Token invalid or expired
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.success && res.data) {
      const { token: authToken, user: authUser } = res.data;
      setToken(authToken);
      setUser(authUser);
      localStorage.setItem('smartnet_token', authToken);
      localStorage.setItem('smartnet_user', JSON.stringify(authUser));
      return res.data;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.success && res.data) {
      const { token: authToken, user: authUser } = res.data;
      setToken(authToken);
      setUser(authUser);
      localStorage.setItem('smartnet_token', authToken);
      localStorage.setItem('smartnet_user', JSON.stringify(authUser));
      return res.data;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const refreshProfile = async () => {
    if (!token) return null;
    try {
      const res = await api.get('/auth/profile');
      if (res.success && res.data) {
        setUser(res.data);
        localStorage.setItem('smartnet_user', JSON.stringify(res.data));
        return res.data;
      }
    } catch (err) {
      console.error('Failed to refresh user profile:', err);
    }
    return null;
  };

  const updateProfile = async (profileData) => {
    const res = await api.put('/auth/profile', profileData);
    if (res.success && res.data) {
      setUser(res.data);
      localStorage.setItem('smartnet_user', JSON.stringify(res.data));
      return res.data;
    }
    throw new Error(res.message || 'Failed to update profile');
  };

  const topUpData = async (amount = 10) => {
    const res = await api.post('/auth/topup', { amount });
    if (res.success) {
      await refreshProfile();
      return res;
    }
    throw new Error(res.message || 'Top-up failed');
  };

  const logout = () => {
    try {
      if (token) api.post('/auth/logout').catch(() => {});
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem('smartnet_token');
      localStorage.removeItem('smartnet_user');
    }
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    refreshProfile,
    updateProfile,
    topUpData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
