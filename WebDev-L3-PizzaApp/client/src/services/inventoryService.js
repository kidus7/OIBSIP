import API from './api';

export const inventoryService = {
  getInventory: async () => {
    const response = await API.get('/inventory');
    return response.data;
  },
  addItem: async (itemData) => {
    const response = await API.post('/inventory', itemData);
    return response.data;
  },
  updateItem: async (id, itemData) => {
    const response = await API.put(`/inventory/${id}`, itemData);
    return response.data;
  },
  deleteItem: async (id) => {
    const response = await API.delete(`/inventory/${id}`);
    return response.data;
  }
};
