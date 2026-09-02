import { createSlice } from '@reduxjs/toolkit';

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

const getInitialToken = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  const remaining = getRemainingTokenTime(token);
  if (remaining <= 0) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    return null;
  }
  return token;
};

const getInitialUser = () => {
  const token = getInitialToken();
  if (!token) return null;
  try {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    return null;
  }
};

const initialState = {
  user: getInitialUser(),
  token: getInitialToken(),
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      if (token) {
        localStorage.setItem('token', token);
      }
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
        if (user.role) {
          localStorage.setItem('role', user.role);
        }
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
