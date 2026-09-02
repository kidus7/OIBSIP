import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: fetchBaseQuery({
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
  }),
  tagTypes: ['User', 'Order', 'Inventory', 'Notification', 'Driver'],
  endpoints: () => ({}),
});
