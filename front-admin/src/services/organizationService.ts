import { createApi } from '@reduxjs/toolkit/query/react';
import axiosBaseQuery from '../api/baseQuery';
import type { Organization, PaginatedResponse, Property } from '../interfaces/types';

export const organizationApi = createApi({
  reducerPath: 'organizationApi',
  baseQuery: axiosBaseQuery,
  tagTypes: ['Organization', 'Property'],
  endpoints: (builder) => ({
    getOrganization: builder.query<Organization, void>({
      query: () => ({ url: '/organization/' }),
      providesTags: ['Organization'],
    }),
    updateOrganization: builder.mutation<Organization, Partial<Organization>>({
      query: (data) => ({ url: '/organization/', method: 'PATCH', data }),
      invalidatesTags: ['Organization'],
    }),
    getProperties: builder.query<PaginatedResponse<Property>, { page?: number }>({
      query: (params) => ({ url: '/properties/', params }),
      providesTags: ['Property'],
    }),
    getProperty: builder.query<Property, string>({
      query: (id) => ({ url: `/properties/${id}/` }),
      providesTags: (_r, _e, id) => [{ type: 'Property', id }],
    }),
    createProperty: builder.mutation<Property, Partial<Property>>({
      query: (data) => ({ url: '/properties/', method: 'POST', data }),
      invalidatesTags: ['Property'],
    }),
    updateProperty: builder.mutation<Property, { id: string; data: Partial<Property> }>({
      query: ({ id, data }) => ({ url: `/properties/${id}/`, method: 'PATCH', data }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Property', id }, 'Property'],
    }),
    uploadPropertyLogo: builder.mutation<Property, { id: string; file: File }>({
      query: ({ id, file }) => {
        const formData = new FormData();
        formData.append('logo', file);
        return {
          url: `/properties/${id}/`,
          method: 'PATCH',
          data: formData,
          headers: { 'Content-Type': 'multipart/form-data' },
        };
      },
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Property', id }, 'Property'],
    }),
  }),
});

export const {
  useGetOrganizationQuery, useUpdateOrganizationMutation,
  useGetPropertiesQuery, useGetPropertyQuery,
  useCreatePropertyMutation, useUpdatePropertyMutation,
  useUploadPropertyLogoMutation,
} = organizationApi;
