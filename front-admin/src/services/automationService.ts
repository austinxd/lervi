import { createApi } from '@reduxjs/toolkit/query/react';
import axiosBaseQuery from '../api/baseQuery';
import type { AutomationLog, AutomationRule, PaginatedResponse } from '../interfaces/types';

export const automationApi = createApi({
  reducerPath: 'automationApi',
  baseQuery: axiosBaseQuery,
  tagTypes: ['AutomationRule', 'AutomationLog'],
  endpoints: (builder) => ({
    getRules: builder.query<PaginatedResponse<AutomationRule>, { page?: number }>({
      query: (params) => ({ url: '/automations/rules/', params }),
      providesTags: ['AutomationRule'],
    }),
    getRule: builder.query<AutomationRule, string>({
      query: (id) => ({ url: `/automations/rules/${id}/` }),
      providesTags: (_r, _e, id) => [{ type: 'AutomationRule', id }],
    }),
    createRule: builder.mutation<AutomationRule, Partial<AutomationRule>>({
      query: (data) => ({ url: '/automations/rules/', method: 'POST', data }),
      invalidatesTags: ['AutomationRule'],
    }),
    updateRule: builder.mutation<AutomationRule, { id: string; data: Partial<AutomationRule> }>({
      query: ({ id, data }) => ({ url: `/automations/rules/${id}/`, method: 'PATCH', data }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'AutomationRule', id }],
    }),
    deleteRule: builder.mutation<void, string>({
      query: (id) => ({ url: `/automations/rules/${id}/`, method: 'DELETE' }),
      invalidatesTags: ['AutomationRule'],
    }),
    getLogs: builder.query<PaginatedResponse<AutomationLog>, { page?: number; rule?: string }>({
      query: (params) => ({ url: '/automations/logs/', params }),
      providesTags: ['AutomationLog'],
    }),
  }),
});

export const {
  useGetRulesQuery, useGetRuleQuery,
  useCreateRuleMutation, useUpdateRuleMutation, useDeleteRuleMutation,
  useGetLogsQuery,
} = automationApi;
