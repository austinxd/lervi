import { createApi } from '@reduxjs/toolkit/query/react';
import axiosBaseQuery from '../api/baseQuery';
import type {
  BillingConfig,
  InvoiceDetail,
  InvoiceListItem,
  PaginatedResponse,
  PropertyBillingConfig,
} from '../interfaces/types';

export const billingApi = createApi({
  reducerPath: 'billingApi',
  baseQuery: axiosBaseQuery,
  tagTypes: ['BillingConfig', 'Invoice'],
  endpoints: (builder) => ({
    // Organization billing config
    getBillingConfig: builder.query<BillingConfig, void>({
      query: () => ({ url: '/billing/config/' }),
      providesTags: ['BillingConfig'],
    }),
    updateBillingConfig: builder.mutation<BillingConfig, Partial<BillingConfig> & { api_key?: string }>({
      query: (data) => ({ url: '/billing/config/', method: 'PATCH', data }),
      invalidatesTags: ['BillingConfig'],
    }),

    // Property billing config
    getPropertyBillingConfig: builder.query<PropertyBillingConfig, string>({
      query: (propertyId) => ({ url: `/billing/properties/${propertyId}/config/` }),
      providesTags: (_r, _e, id) => [{ type: 'BillingConfig', id }],
    }),
    updatePropertyBillingConfig: builder.mutation<
      PropertyBillingConfig,
      { propertyId: string; data: Partial<PropertyBillingConfig> & { api_key?: string } }
    >({
      query: ({ propertyId, data }) => ({
        url: `/billing/properties/${propertyId}/config/`,
        method: 'PATCH',
        data,
      }),
      invalidatesTags: (_r, _e, { propertyId }) => [{ type: 'BillingConfig', id: propertyId }, 'BillingConfig'],
    }),

    // Invoices
    getInvoices: builder.query<
      PaginatedResponse<InvoiceListItem>,
      { property?: string; status?: string; document_type?: string; search?: string; page?: number }
    >({
      query: (params) => ({ url: '/billing/invoices/', params }),
      providesTags: ['Invoice'],
    }),
    getInvoice: builder.query<InvoiceDetail, string>({
      query: (id) => ({ url: `/billing/invoices/${id}/` }),
      providesTags: (_r, _e, id) => [{ type: 'Invoice', id }],
    }),
    createInvoice: builder.mutation<InvoiceDetail, { reservation_id: string; document_type: string }>({
      query: (data) => ({ url: '/billing/invoices/', method: 'POST', data }),
      invalidatesTags: ['Invoice'],
    }),
    emitInvoice: builder.mutation<InvoiceDetail, string>({
      query: (id) => ({ url: `/billing/invoices/${id}/emit/`, method: 'POST' }),
      invalidatesTags: (_r, _e, id) => [{ type: 'Invoice', id }, 'Invoice'],
    }),
    voidInvoice: builder.mutation<InvoiceDetail, string>({
      query: (id) => ({ url: `/billing/invoices/${id}/void/`, method: 'POST' }),
      invalidatesTags: (_r, _e, id) => [{ type: 'Invoice', id }, 'Invoice'],
    }),
  }),
});

export const {
  useGetBillingConfigQuery,
  useUpdateBillingConfigMutation,
  useGetPropertyBillingConfigQuery,
  useUpdatePropertyBillingConfigMutation,
  useGetInvoicesQuery,
  useGetInvoiceQuery,
  useCreateInvoiceMutation,
  useEmitInvoiceMutation,
  useVoidInvoiceMutation,
} = billingApi;
