import { createSlice } from '@reduxjs/toolkit';

const getStoredNotifications = () => {
  try {
    const saved = localStorage.getItem('pizza_notifications');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const initialState = {
  notifications: getStoredNotifications(),
};

export const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action) => {
      const newNotification = {
        id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        type: action.payload.type || 'info',
        title: action.payload.title,
        message: action.payload.message,
        role: action.payload.role || 'all',
        read: false,
        timestamp: new Date().toISOString(),
        ...action.payload,
      };
      state.notifications.unshift(newNotification);
      localStorage.setItem('pizza_notifications', JSON.stringify(state.notifications));
    },
    markAsRead: (state, action) => {
      const id = action.payload;
      state.notifications = state.notifications.map(n =>
        n.id === id ? { ...n, read: true } : n
      );
      localStorage.setItem('pizza_notifications', JSON.stringify(state.notifications));
    },
    markAllAsRead: (state) => {
      state.notifications = state.notifications.map(n => ({ ...n, read: true }));
      localStorage.setItem('pizza_notifications', JSON.stringify(state.notifications));
    },
    clearAllNotifications: (state) => {
      state.notifications = [];
      localStorage.setItem('pizza_notifications', JSON.stringify(state.notifications));
    },
  },
});

export const {
  addNotification,
  markAsRead,
  markAllAsRead,
  clearAllNotifications,
} = notificationSlice.actions;

export default notificationSlice.reducer;
