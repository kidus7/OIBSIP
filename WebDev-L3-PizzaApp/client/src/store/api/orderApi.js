import { baseApi } from './baseApi';
import { io } from 'socket.io-client';

export const orderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOrders: builder.query({
      query: (endpoint = '/orders') => endpoint,
      providesTags: ['Order'],
      async onCacheEntryAdded(arg, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
        const socketUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SOCKET_URL) || 'http://localhost:4000';
        const socket = io(socketUrl);

        try {
          await cacheDataLoaded;

          socket.on('connect', () => {
            socket.emit('join_role', 'admin');
            socket.emit('join_role', 'driver');
            socket.emit('join_role', 'client');
          });

          const handleOrderUpdate = (updatedOrder) => {
            if (!updatedOrder) return;
            updateCachedData((draft) => {
              if (Array.isArray(draft)) {
                const index = draft.findIndex(o => o._id === updatedOrder._id || o.orderId === updatedOrder.orderId);
                if (index !== -1) {
                  draft[index] = { ...draft[index], ...updatedOrder };
                } else {
                  draft.unshift(updatedOrder);
                }
              } else if (draft && Array.isArray(draft.data)) {
                const index = draft.data.findIndex(o => o._id === updatedOrder._id || o.orderId === updatedOrder.orderId);
                if (index !== -1) {
                  draft.data[index] = { ...draft.data[index], ...updatedOrder };
                } else {
                  draft.data.unshift(updatedOrder);
                }
              } else if (draft && (draft._id === updatedOrder._id || draft.orderId === updatedOrder.orderId)) {
                Object.assign(draft, updatedOrder);
              }
            });
          };

          socket.on('order:created', handleOrderUpdate);
          socket.on('order_updated', handleOrderUpdate);
          socket.on('order:ready_for_delivery', handleOrderUpdate);

        } catch {
          // no-op if cache entry removed before loaded
        }

        await cacheEntryRemoved;
        socket.disconnect();
      },
    }),
    createOrder: builder.mutation({
      query: (orderData) => ({
        url: '/orders',
        method: 'POST',
        body: orderData,
      }),
      invalidatesTags: ['Order'],
    }),
    updateOrderStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/admin/orders/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['Order'],
    }),
    assignDriver: builder.mutation({
      query: ({ id, driverId }) => ({
        url: `/admin/orders/${id}/assign`,
        method: 'PATCH',
        body: { driverId },
      }),
      invalidatesTags: ['Order', 'Driver'],
    }),
    respondToAssignment: builder.mutation({
      query: ({ id, accept }) => ({
        url: `/driver/orders/${id}/respond-assignment`,
        method: 'PATCH',
        body: { accept },
      }),
      invalidatesTags: ['Order'],
    }),
    verifyDeliveryOTP: builder.mutation({
      query: ({ id, deliveryCode }) => ({
        url: `/driver/orders/${id}/verify`,
        method: 'PUT',
        body: { deliveryCode },
      }),
      invalidatesTags: ['Order'],
    }),
    getMyOrders: builder.query({
      query: () => '/orders/my-orders',
      providesTags: ['Order'],
    }),
    getAllOrders: builder.query({
      query: () => '/orders/admin/all',
      providesTags: ['Order'],
    }),
    verifyPayment: builder.mutation({
      query: (data) => ({
        url: '/orders/verify-payment',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Order'],
    }),
    createRazorpayOrder: builder.mutation({
      query: (data) => ({
        url: '/orders/create-razorpay-order',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Order'],
    }),
    updateOrderETA: builder.mutation({
      query: ({ id, ...etaData }) => ({
        url: `/orders/${id}/eta`,
        method: 'PUT',
        body: etaData,
      }),
      invalidatesTags: ['Order'],
    }),
    claimOrder: builder.mutation({
      query: (id) => ({
        url: `/orders/${id}/claim`,
        method: 'PUT',
      }),
      invalidatesTags: ['Order'],
    }),
  }),
});

export const {
  useGetOrdersQuery,
  useCreateOrderMutation,
  useUpdateOrderStatusMutation,
  useAssignDriverMutation,
  useRespondToAssignmentMutation,
  useVerifyDeliveryOTPMutation,
  useGetMyOrdersQuery,
  useGetAllOrdersQuery,
  useVerifyPaymentMutation,
  useCreateRazorpayOrderMutation,
  useUpdateOrderETAMutation,
  useClaimOrderMutation,
} = orderApi;
