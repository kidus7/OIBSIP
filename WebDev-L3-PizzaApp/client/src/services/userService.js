import API from './api';

export const userService = {
  updateProfile: async (profileData) => {
    const response = await API.put('/users/profile', profileData);
    return response.data;
  },
  createDriver: async (driverData) => {
    const response = await API.post('/users/create-driver', driverData);
    return response.data;
  },
  getDrivers: async () => {
    const response = await API.get('/users/drivers');
    return response.data;
  },
  updateDriver: async (id, driverData) => {
    const response = await API.put(`/users/drivers/${id}`, driverData);
    return response.data;
  },
  toggleDriverStatus: async (id) => {
    const response = await API.patch(`/users/drivers/${id}/status`);
    return response.data;
  },
  verifyDriver: async (id) => {
    const response = await API.patch(`/admin/drivers/${id}/verify`);
    return response.data;
  },
  deleteDriver: async (id) => {
    const response = await API.delete(`/users/drivers/${id}`);
    return response.data;
  }
};
