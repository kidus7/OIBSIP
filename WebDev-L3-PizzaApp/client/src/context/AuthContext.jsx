import React, { createContext, useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

export const AuthContext = createContext();

export const getRemainingTokenTime = (token) => {
  if (!token) return 0;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return 0;
    const payload = JSON.parse(atob(parts[1]));
    if (!payload.exp) return 0;
    return payload.exp * 1000 - Date.now();
  } catch (error) {
    return 0;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef(null);

  const [theme, setThemeState] = useState(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed?.preferences?.theme) return parsed.preferences.theme;
      } catch {}
    }
    return localStorage.getItem('theme') || 'light';
  });

  const logout = (message) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    const role = localStorage.getItem('role') || user?.role;
    const pathname = window.location.pathname;
    const isAdmin = role === 'admin' || pathname.startsWith('/admin');

    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');

    if (message) {
      toast.error(message);
    }

    window.location.href = isAdmin ? '/admin-login' : '/login';
  };

  const setupExpirationTimer = (token) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    const timeUntilExpiry = getRemainingTokenTime(token);
    if (timeUntilExpiry <= 0) {
      logout('Your session has expired.');
      return;
    }

    timerRef.current = setTimeout(() => {
      logout('Your session has expired.');
    }, timeUntilExpiry);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      try {
        const timeUntilExpiry = getRemainingTokenTime(token);
        if (timeUntilExpiry <= 0) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('role');
          toast.error('Your session has expired.');
        } else {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          if (parsedUser?.preferences?.theme) {
            setThemeState(parsedUser.preferences.theme);
          }
          setupExpirationTimer(token);
        }
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('role');
      }
    }

    setLoading(false);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
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
    document.body.className = "bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-200";
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
    setupExpirationTimer(token);
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
