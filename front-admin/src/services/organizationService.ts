import { createApi } from '@reduxjs/toolkit/query/react';
import axiosBaseQuery from '../api/baseQuery';
import type { Organization, PaginatedResponse, Property, PropertyPhoto } from '../interfaces/types';

export const organizationApi = createApi({
  reducerPath: 'organizationApi',
  baseQuery: axiosBaseQuery,
  tagTypes: ['Organization', 'Property', 'PropertyPhoto'],
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
    uploadPropertyHero: builder.mutation<Property, { id: string; file: File }>({
      query: ({ id, file }) => {
        const formData = new FormData();
        formData.append('hero_image', file);
        return {
          url: `/properties/${id}/`,
          method: 'PATCH',
          data: formData,
          headers: { 'Content-Type': 'multipart/form-data' },
        };
      },
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Property', id }, 'Property'],
    }),
    getPropertyPhotos: builder.query<PropertyPhoto[], string>({
      query: (id) => ({ url: `/properties/${id}/photos/` }),
      providesTags: (_r, _e, id) => [{ type: 'PropertyPhoto', id }],
    }),
    addPropertyPhoto: builder.mutation<PropertyPhoto, { id: string; file: File; caption?: string }>({
      query: ({ id, file, caption }) => {
        const formData = new FormData();
        formData.append('image', file);
        if (caption) formData.append('caption', caption);
        return {
          url: `/properties/${id}/photos/`,
          method: 'POST',
          data: formData,
          headers: { 'Content-Type': 'multipart/form-data' },
        };
      },
      invalidatesTags: (_r, _e, { id }) => [{ type: 'PropertyPhoto', id }],
    }),
    deletePropertyPhoto: builder.mutation<void, { propertyId: string; photoId: string }>({
      query: ({ propertyId, photoId }) => ({
        url: `/properties/${propertyId}/photos/${photoId}/`,
        method: 'DELETE',
      }),
      invalidatesTags: (_r, _e, { propertyId }) => [{ type: 'PropertyPhoto', id: propertyId }],
    }),
  }),
});

export const {
  useGetOrganizationQuery, useUpdateOrganizationMutation,
  useGetPropertiesQuery, useGetPropertyQuery,
  useCreatePropertyMutation, useUpdatePropertyMutation,
  useUploadPropertyLogoMutation, useUploadPropertyHeroMutation,
  useGetPropertyPhotosQuery, useAddPropertyPhotoMutation,
  useDeletePropertyPhotoMutation,
} = organizationApi;
