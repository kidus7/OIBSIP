import React, { createContext, useState, useEffect } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setThemeState] = useState(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed?.preferences?.theme) return parsed.preferences.theme;
      } catch {}
    }
    return localStorage.getItem('theme') || 'dark';
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        if (parsedUser?.preferences?.theme) {
          setThemeState(parsedUser.preferences.theme);
        }
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('role');
      }
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    if (user?.preferences?.theme) {
      setThemeState(user.preferences.theme);
    }
  }, [user?.preferences?.theme]);

  useEffect(() => {
    const root = document.documentElement;
    const isDark = 
      theme === 'dark' || 
      (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const setTheme = (newTheme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('role', userData.role);
    if (userData?.preferences?.theme) {
      setThemeState(userData.preferences.theme);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    if (userData.role) {
      localStorage.setItem('role', userData.role);
    }
    if (userData?.preferences?.theme) {
      setThemeState(userData.preferences.theme);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, loading, theme, setTheme }}>
      {children}
    </AuthContext.Provider>
  );
};
