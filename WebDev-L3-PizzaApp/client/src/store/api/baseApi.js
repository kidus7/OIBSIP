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

  if (result.error) {
    const isDev = (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') ||
                  (typeof import.meta !== 'undefined' && import.meta.env?.DEV);

    if (isDev) {
      console.error('RTK Query Error:', result.error);
    }

    const status = result.error.status;

    if (status === 401) {
      api.dispatch(logout());

      const state = api.getState();
      const role = state?.auth?.user?.role || localStorage.getItem('role');
      const pathname = window.location.pathname;
      const isAdmin = role === 'admin' || pathname.startsWith('/admin');

      toast.error("Session expired. Please log in again.");

      window.location.href = isAdmin ? '/admin-login' : '/login';
    } else if (status === 403) {
      toast.error("You do not have permission to perform this action.");
    } else if (status === 404) {
      toast.error("Requested resource not found.");
    } else if (status >= 500) {
      if (isDev && (result.error.data?.message || result.error.data?.error)) {
        toast.error(result.error.data?.message || result.error.data?.error);
      } else {
        toast.error("An unexpected error occurred. Please try again later.");
      }
    } else if (result.error.data?.message) {
      toast.error(result.error.data.message);
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User', 'Order', 'Inventory', 'Notification', 'Driver'],
  endpoints: () => ({}),
});
