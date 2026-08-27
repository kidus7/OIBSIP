import API from './api';

export const authService = {
  register: async (userData) => {
    const response = await API.post('/auth/register', userData);
    return response.data;
  },
  login: async (credentials) => {
    const response = await API.post('/auth/login', credentials);
    return response.data;
  },
  adminLogin: async (credentials) => {
    const response = await API.post('/auth/admin-login', credentials);
    return response.data;
  },
  adminRegister: async (adminData) => {
    const response = await API.post('/auth/admin-register', adminData);
    return response.data;
  },
  forgotPassword: async (email) => {
    const response = await API.post('/auth/forgot-password', { email });
    return response.data;
  },
  resetPassword: async (id, token, password) => {
    const response = await API.put(`/auth/reset-password/${id}/${token}`, { password });
    return response.data;
  }
};
