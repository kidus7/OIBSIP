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
      query: ({ orderId, id, status }) => {
        const targetId = orderId || id;
        return {
          url: `/orders/${targetId}/status`,
          method: 'PATCH',
          body: { status },
        };
      },
      invalidatesTags: ['Order'],
    }),
    assignDriver: builder.mutation({
      query: ({ orderId, id, driverId }) => {
        const targetId = orderId || id;
        return {
          url: `/orders/${targetId}/assign-driver`,
          method: 'PATCH',
          body: { driverId },
        };
      },
      invalidatesTags: ['Order', 'Driver'],
    }),
    respondToAssignment: builder.mutation({
      query: ({ orderId, id, accept }) => {
        const targetId = orderId || id;
        return {
          url: `/driver/orders/${targetId}/assignment-response`,
          method: 'PATCH',
          body: { accept },
        };
      },
      invalidatesTags: ['Order'],
    }),
    claimApproval: builder.mutation({
      query: ({ orderId, id, approved, driverId }) => {
        const targetId = orderId || id;
        return {
          url: `/orders/${targetId}/claim-approval`,
          method: 'PATCH',
          body: { approved, driverId },
        };
      },
      invalidatesTags: ['Order'],
    }),
    claimOrder: builder.mutation({
      query: (orderId) => {
        const targetId = typeof orderId === 'object' ? (orderId.orderId || orderId.id) : orderId;
        return {
          url: `/orders/${targetId}/claim`,
          method: 'PATCH',
        };
      },
      invalidatesTags: ['Order'],
    }),
    completeOrder: builder.mutation({
      query: ({ orderId, id, deliveryCode }) => {
        const targetId = orderId || id;
        return {
          url: `/orders/${targetId}/complete`,
          method: 'PATCH',
          body: { deliveryCode },
        };
      },
      invalidatesTags: ['Order'],
    }),
    updateOrderETA: builder.mutation({
      query: ({ orderId, id, ...etaData }) => {
        const targetId = orderId || id;
        return {
          url: `/orders/${targetId}/eta`,
          method: 'PATCH',
          body: etaData,
        };
      },
      invalidatesTags: ['Order'],
    }),
    getMyOrders: builder.query({
      query: () => '/orders/my-orders',
      providesTags: ['Order'],
    }),
    getAllOrders: builder.query({
      query: () => '/orders',
      providesTags: ['Order'],
    }),
    getOrderById: builder.query({
      query: (id) => `/orders/${id}`,
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
  }),
});

export const {
  useGetOrdersQuery,
  useCreateOrderMutation,
  useUpdateOrderStatusMutation,
  useAssignDriverMutation,
  useRespondToAssignmentMutation,
  useClaimApprovalMutation,
  useClaimOrderMutation,
  useCompleteOrderMutation,
  useUpdateOrderETAMutation,
  useGetMyOrdersQuery,
  useGetAllOrdersQuery,
  useGetOrderByIdQuery,
  useVerifyPaymentMutation,
} = orderApi;
