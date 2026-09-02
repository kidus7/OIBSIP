import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from './api/baseApi';

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    auth: (state = { token: localStorage.getItem('token') || null }, action) => {
      switch (action.type) {
        case 'auth/setToken':
          return { ...state, token: action.payload };
        default:
          return state;
      }
    }
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});

export default store;
