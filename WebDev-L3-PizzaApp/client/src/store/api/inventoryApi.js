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
    updateItem: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/admin/inventory/${id}`,
        method: 'PUT',
        body: patch,
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
    deleteItem: builder.mutation({
      query: (id) => ({
        url: `/admin/inventory/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Inventory'],
    }),
  }),
});

export const {
  useGetInventoryQuery,
  useUpdateStockMutation,
  useUpdateItemMutation,
  useAddIngredientMutation,
  useDeleteItemMutation,
} = inventoryApi;
