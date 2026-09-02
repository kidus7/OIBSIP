import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { logout } from '../slices/authSlice';
import toast from 'react-hot-toast';

const baseQuery = fetchBaseQuery({
  baseUrl: (typeof process !== 'undefined' && process.env?.REACT_APP_API_URL) || 
           (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || 
           '/api/v1',
  prepareHeaders: (headers, { getState }) => {
    const state = getState();
    const token = (state.auth && state.auth.token) || localStorage.getItem('token');
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    api.dispatch(logout());

    const state = api.getState();
    const role = state?.auth?.user?.role || localStorage.getItem('role');
    const pathname = window.location.pathname;
    const isAdmin = role === 'admin' || pathname.startsWith('/admin');

    toast.error("Session expired. Please log in again.");

    window.location.href = isAdmin ? '/admin-login' : '/login';
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User', 'Order', 'Inventory', 'Notification', 'Driver'],
  endpoints: () => ({}),
});
