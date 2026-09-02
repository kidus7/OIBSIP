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
  }),
});

export const {
  useLoginMutation,
  useAdminLoginMutation,
  useRegisterMutation,
  useAdminRegisterMutation,
  useGetProfileQuery,
  useVerifyDriverMutation,
} = authApi;
