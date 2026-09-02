import axios from 'axios';
import toast from 'react-hot-toast';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

API.interceptors.response.use((response) => {
  return response;
}, (error) => {
  if (error.response?.status === 401) {
    const role = localStorage.getItem('role');
    const pathname = window.location.pathname;
    const isAdmin = role === 'admin' || pathname.startsWith('/admin');

    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');

    toast.error('Session expired. Please log in again.');

    setTimeout(() => {
      window.location.href = isAdmin ? '/admin-login' : '/login';
    }, 500);
  }
  return Promise.reject(error);
});

export default API;
