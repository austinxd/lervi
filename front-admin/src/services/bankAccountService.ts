import { createApi } from '@reduxjs/toolkit/query/react';
import axiosBaseQuery from '../api/baseQuery';
import type { BankAccount } from '../interfaces/types';

export const bankAccountApi = createApi({
  reducerPath: 'bankAccountApi',
  baseQuery: axiosBaseQuery,
  tagTypes: ['BankAccount'],
  endpoints: (builder) => ({
    getBankAccounts: builder.query<BankAccount[], string>({
      query: (propertyId) => ({ url: `/properties/${propertyId}/bank-accounts/` }),
      providesTags: ['BankAccount'],
    }),
    createBankAccount: builder.mutation<BankAccount, { propertyId: string; data: Partial<BankAccount> }>({
      query: ({ propertyId, data }) => ({
        url: `/properties/${propertyId}/bank-accounts/`,
        method: 'POST',
        data,
      }),
      invalidatesTags: ['BankAccount'],
    }),
    updateBankAccount: builder.mutation<BankAccount, { propertyId: string; id: string; data: Partial<BankAccount> }>({
      query: ({ propertyId, id, data }) => ({
        url: `/properties/${propertyId}/bank-accounts/${id}/`,
        method: 'PATCH',
        data,
      }),
      invalidatesTags: ['BankAccount'],
    }),
    deleteBankAccount: builder.mutation<void, { propertyId: string; id: string }>({
      query: ({ propertyId, id }) => ({
        url: `/properties/${propertyId}/bank-accounts/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['BankAccount'],
    }),
  }),
});

export const {
  useGetBankAccountsQuery,
  useCreateBankAccountMutation,
  useUpdateBankAccountMutation,
  useDeleteBankAccountMutation,
} = bankAccountApi;
