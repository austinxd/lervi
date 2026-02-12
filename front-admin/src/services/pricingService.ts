import { createApi } from '@reduxjs/toolkit/query/react';
import axiosBaseQuery from '../api/baseQuery';
import type {
  DayOfWeekPricing, PaginatedResponse,
  PriceCalculationRequest, PriceCalculationResponse,
  Promotion, RatePlan, Season,
} from '../interfaces/types';

export const pricingApi = createApi({
  reducerPath: 'pricingApi',
  baseQuery: axiosBaseQuery,
  tagTypes: ['Season', 'DayOfWeek', 'RatePlan', 'Promotion'],
  endpoints: (builder) => ({
    // Seasons
    getSeasons: builder.query<PaginatedResponse<Season>, { property?: string; page?: number }>({
      query: (params) => ({ url: '/pricing/seasons/', params }),
      providesTags: ['Season'],
    }),
    createSeason: builder.mutation<Season, Partial<Season>>({
      query: (data) => ({ url: '/pricing/seasons/', method: 'POST', data }),
      invalidatesTags: ['Season'],
    }),
    updateSeason: builder.mutation<Season, { id: string; data: Partial<Season> }>({
      query: ({ id, data }) => ({ url: `/pricing/seasons/${id}/`, method: 'PATCH', data }),
      invalidatesTags: ['Season'],
    }),
    deleteSeason: builder.mutation<void, string>({
      query: (id) => ({ url: `/pricing/seasons/${id}/`, method: 'DELETE' }),
      invalidatesTags: ['Season'],
    }),
    // Day of week
    getDayOfWeekPricing: builder.query<PaginatedResponse<DayOfWeekPricing>, { property?: string }>({
      query: (params) => ({ url: '/pricing/day-of-week/', params }),
      providesTags: ['DayOfWeek'],
    }),
    createDayOfWeekPricing: builder.mutation<DayOfWeekPricing, Partial<DayOfWeekPricing>>({
      query: (data) => ({ url: '/pricing/day-of-week/', method: 'POST', data }),
      invalidatesTags: ['DayOfWeek'],
    }),
    updateDayOfWeekPricing: builder.mutation<DayOfWeekPricing, { id: string; data: Partial<DayOfWeekPricing> }>({
      query: ({ id, data }) => ({ url: `/pricing/day-of-week/${id}/`, method: 'PATCH', data }),
      invalidatesTags: ['DayOfWeek'],
    }),
    deleteDayOfWeekPricing: builder.mutation<void, string>({
      query: (id) => ({ url: `/pricing/day-of-week/${id}/`, method: 'DELETE' }),
      invalidatesTags: ['DayOfWeek'],
    }),
    // Rate plans
    getRatePlans: builder.query<PaginatedResponse<RatePlan>, { property?: string; page?: number }>({
      query: (params) => ({ url: '/pricing/rate-plans/', params }),
      providesTags: ['RatePlan'],
    }),
    createRatePlan: builder.mutation<RatePlan, Partial<RatePlan>>({
      query: (data) => ({ url: '/pricing/rate-plans/', method: 'POST', data }),
      invalidatesTags: ['RatePlan'],
    }),
    updateRatePlan: builder.mutation<RatePlan, { id: string; data: Partial<RatePlan> }>({
      query: ({ id, data }) => ({ url: `/pricing/rate-plans/${id}/`, method: 'PATCH', data }),
      invalidatesTags: ['RatePlan'],
    }),
    deleteRatePlan: builder.mutation<void, string>({
      query: (id) => ({ url: `/pricing/rate-plans/${id}/`, method: 'DELETE' }),
      invalidatesTags: ['RatePlan'],
    }),
    // Promotions
    getPromotions: builder.query<PaginatedResponse<Promotion>, { property?: string; page?: number }>({
      query: (params) => ({ url: '/pricing/promotions/', params }),
      providesTags: ['Promotion'],
    }),
    createPromotion: builder.mutation<Promotion, Partial<Promotion>>({
      query: (data) => ({ url: '/pricing/promotions/', method: 'POST', data }),
      invalidatesTags: ['Promotion'],
    }),
    updatePromotion: builder.mutation<Promotion, { id: string; data: Partial<Promotion> }>({
      query: ({ id, data }) => ({ url: `/pricing/promotions/${id}/`, method: 'PATCH', data }),
      invalidatesTags: ['Promotion'],
    }),
    deletePromotion: builder.mutation<void, string>({
      query: (id) => ({ url: `/pricing/promotions/${id}/`, method: 'DELETE' }),
      invalidatesTags: ['Promotion'],
    }),
    // Price calculator
    calculatePrice: builder.mutation<PriceCalculationResponse, PriceCalculationRequest>({
      query: (data) => ({ url: '/pricing/calculate/', method: 'POST', data }),
    }),
  }),
});

export const {
  useGetSeasonsQuery, useCreateSeasonMutation, useUpdateSeasonMutation, useDeleteSeasonMutation,
  useGetDayOfWeekPricingQuery, useCreateDayOfWeekPricingMutation, useUpdateDayOfWeekPricingMutation, useDeleteDayOfWeekPricingMutation,
  useGetRatePlansQuery, useCreateRatePlanMutation, useUpdateRatePlanMutation, useDeleteRatePlanMutation,
  useGetPromotionsQuery, useCreatePromotionMutation, useUpdatePromotionMutation, useDeletePromotionMutation,
  useCalculatePriceMutation,
} = pricingApi;
