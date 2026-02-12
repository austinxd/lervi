import { createApi } from '@reduxjs/toolkit/query/react';
import axiosBaseQuery from '../api/baseQuery';
import type { DashboardToday, OccupancyData, RevenueData } from '../interfaces/types';

export const dashboardApi = createApi({
  reducerPath: 'dashboardApi',
  baseQuery: axiosBaseQuery,
  tagTypes: ['Dashboard'],
  endpoints: (builder) => ({
    getToday: builder.query<DashboardToday, { property?: string }>({
      query: ({ property }) => ({
        url: '/dashboard/today/',
        params: property ? { property } : undefined,
      }),
      providesTags: ['Dashboard'],
    }),
    getOccupancy: builder.query<OccupancyData, { property?: string; days?: number }>({
      query: ({ property, days = 7 }) => ({
        url: '/dashboard/occupancy/',
        params: { ...(property && { property }), days },
      }),
      providesTags: ['Dashboard'],
    }),
    getRevenue: builder.query<RevenueData, { property?: string; period?: string }>({
      query: ({ property, period = 'month' }) => ({
        url: '/dashboard/revenue/',
        params: { ...(property && { property }), period },
      }),
      providesTags: ['Dashboard'],
    }),
  }),
});

export const { useGetTodayQuery, useGetOccupancyQuery, useGetRevenueQuery } = dashboardApi;
