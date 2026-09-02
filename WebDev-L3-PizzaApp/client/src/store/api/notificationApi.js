import { baseApi } from './baseApi';
import { markAsRead, clearAllNotifications } from '../slices/notificationSlice';

export const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query({
      queryFn: async (_, { getState }) => {
        const notifications = getState().notifications.notifications || [];
        return { data: notifications };
      },
      providesTags: ['Notification'],
    }),
    markNotificationRead: builder.mutation({
      queryFn: async (id, { dispatch }) => {
        dispatch(markAsRead(id));
        return { data: { success: true } };
      },
      invalidatesTags: ['Notification'],
    }),
    clearNotifications: builder.mutation({
      queryFn: async (_, { dispatch }) => {
        dispatch(clearAllNotifications());
        return { data: { success: true } };
      },
      invalidatesTags: ['Notification'],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useClearNotificationsMutation,
} = notificationApi;
