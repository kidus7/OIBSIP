import { baseApi } from './baseApi';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User'],
    }),
    adminLogin: builder.mutation({
      query: (credentials) => ({
        url: '/auth/admin-login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User'],
    }),
    register: builder.mutation({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),
    adminRegister: builder.mutation({
      query: (adminData) => ({
        url: '/auth/admin-register',
        method: 'POST',
        body: adminData,
      }),
      invalidatesTags: ['User'],
    }),
    getProfile: builder.query({
      query: () => '/users/profile',
      providesTags: ['User'],
    }),
    verifyDriver: builder.mutation({
      query: (id) => ({
        url: `/admin/drivers/${id}/verify`,
        method: 'PATCH',
      }),
      invalidatesTags: ['User', 'Driver'],
    }),
    forgotPassword: builder.mutation({
      query: (email) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body: { email },
      }),
    }),
    resetPassword: builder.mutation({
      query: ({ id, token, password }) => ({
        url: `/auth/reset-password/${id}/${token}`,
        method: 'PUT',
        body: { password },
      }),
    }),
    updateProfile: builder.mutation({
      query: (profileData) => ({
        url: '/users/profile',
        method: 'PUT',
        body: profileData,
      }),
      invalidatesTags: ['User'],
    }),
    getDrivers: builder.query({
      query: () => '/users/drivers',
      providesTags: ['Driver'],
    }),
    createDriver: builder.mutation({
      query: (driverData) => ({
        url: '/users/create-driver',
        method: 'POST',
        body: driverData,
      }),
      invalidatesTags: ['Driver'],
    }),
    updateDriver: builder.mutation({
      query: ({ id, ...driverData }) => ({
        url: `/users/drivers/${id}`,
        method: 'PUT',
        body: driverData,
      }),
      invalidatesTags: ['Driver'],
    }),
    toggleDriverStatus: builder.mutation({
      query: (id) => ({
        url: `/users/drivers/${id}/status`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Driver'],
    }),
    deleteDriver: builder.mutation({
      query: (id) => ({
        url: `/users/drivers/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Driver'],
    }),
    updateDriverStatus: builder.mutation({
      query: (statusData) => ({
        url: '/users/driver/status',
        method: 'PATCH',
        body: statusData,
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useLoginMutation,
  useAdminLoginMutation,
  useRegisterMutation,
  useAdminRegisterMutation,
  useGetProfileQuery,
  useVerifyDriverMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useUpdateProfileMutation,
  useGetDriversQuery,
  useCreateDriverMutation,
  useUpdateDriverMutation,
  useToggleDriverStatusMutation,
  useDeleteDriverMutation,
  useUpdateDriverStatusMutation,
} = authApi;
