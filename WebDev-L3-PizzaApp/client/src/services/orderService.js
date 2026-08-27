import API from './api';

export const orderService = {
  createOrder: async (orderData) => {
    const response = await API.post('/orders', orderData);
    return response.data;
  },
  verifyPayment: async (paymentData) => {
    const response = await API.post('/orders/verify-payment', paymentData);
    return response.data;
  },
  getMyOrders: async () => {
    const response = await API.get('/orders/my-orders');
    return response.data;
  },
  getAllOrders: async () => {
    const response = await API.get('/orders/admin/all');
    return response.data;
  },
  updateOrderStatus: async (id, status) => {
    const response = await API.put(`/orders/${id}/status`, { status });
    return response.data;
  },
  updateOrderETA: async (id, etaData) => {
    const response = await API.put(`/orders/${id}/eta`, etaData);
    return response.data;
  }
};
