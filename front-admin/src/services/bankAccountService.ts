import { createApi } from '@reduxjs/toolkit/query/react';
import axiosBaseQuery from '../api/baseQuery';
import type { BankAccount } from '../interfaces/types';

export const bankAccountApi = createApi({
  reducerPath: 'bankAccountApi',
  baseQuery: axiosBaseQuery,
  tagTypes: ['BankAccount', 'OrgBankAccount'],
  endpoints: (builder) => ({
    // --- Organization-level ---
    getOrgBankAccounts: builder.query<BankAccount[], void>({
      query: () => ({ url: '/organization/bank-accounts/' }),
      providesTags: ['OrgBankAccount'],
    }),
    createOrgBankAccount: builder.mutation<BankAccount, Partial<BankAccount>>({
      query: (data) => ({
        url: '/organization/bank-accounts/',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['OrgBankAccount'],
    }),
    updateOrgBankAccount: builder.mutation<BankAccount, { id: string; data: Partial<BankAccount> }>({
      query: ({ id, data }) => ({
        url: `/organization/bank-accounts/${id}/`,
        method: 'PATCH',
        data,
      }),
      invalidatesTags: ['OrgBankAccount'],
    }),
    deleteOrgBankAccount: builder.mutation<void, string>({
      query: (id) => ({
        url: `/organization/bank-accounts/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['OrgBankAccount'],
    }),

    // --- Property-level ---
    getPropertyBankAccounts: builder.query<BankAccount[], string>({
      query: (propertyId) => ({ url: `/properties/${propertyId}/bank-accounts/` }),
      providesTags: ['BankAccount'],
    }),
    createPropertyBankAccount: builder.mutation<BankAccount, { propertyId: string; data: Partial<BankAccount> }>({
      query: ({ propertyId, data }) => ({
        url: `/properties/${propertyId}/bank-accounts/`,
        method: 'POST',
        data,
      }),
      invalidatesTags: ['BankAccount'],
    }),
    updatePropertyBankAccount: builder.mutation<BankAccount, { propertyId: string; id: string; data: Partial<BankAccount> }>({
      query: ({ propertyId, id, data }) => ({
        url: `/properties/${propertyId}/bank-accounts/${id}/`,
        method: 'PATCH',
        data,
      }),
      invalidatesTags: ['BankAccount'],
    }),
    deletePropertyBankAccount: builder.mutation<void, { propertyId: string; id: string }>({
      query: ({ propertyId, id }) => ({
        url: `/properties/${propertyId}/bank-accounts/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['BankAccount'],
    }),
  }),
});

export const {
  useGetOrgBankAccountsQuery,
  useCreateOrgBankAccountMutation,
  useUpdateOrgBankAccountMutation,
  useDeleteOrgBankAccountMutation,
  useGetPropertyBankAccountsQuery,
  useCreatePropertyBankAccountMutation,
  useUpdatePropertyBankAccountMutation,
  useDeletePropertyBankAccountMutation,
} = bankAccountApi;
