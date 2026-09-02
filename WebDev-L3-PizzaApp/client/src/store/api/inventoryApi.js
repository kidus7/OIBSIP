import { baseApi } from './baseApi';

export const inventoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getInventory: builder.query({
      query: () => '/admin/inventory',
      providesTags: ['Inventory'],
    }),
    updateStock: builder.mutation({
      query: ({ id, stock }) => ({
        url: `/admin/inventory/${id}`,
        method: 'PATCH',
        body: { stock },
      }),
      invalidatesTags: ['Inventory'],
    }),
    addIngredient: builder.mutation({
      query: (data) => ({
        url: '/admin/inventory',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Inventory'],
    }),
  }),
});

export const {
  useGetInventoryQuery,
  useUpdateStockMutation,
  useAddIngredientMutation,
} = inventoryApi;
