import { createApi } from '@reduxjs/toolkit/query/react';
import axiosBaseQuery from '../api/baseQuery';
import type { BedConfiguration, PaginatedResponse, RoomType, RoomTypePhoto } from '../interfaces/types';

export const roomTypeApi = createApi({
  reducerPath: 'roomTypeApi',
  baseQuery: axiosBaseQuery,
  tagTypes: ['RoomType'],
  endpoints: (builder) => ({
    getRoomTypes: builder.query<PaginatedResponse<RoomType>, { property?: string; page?: number }>({
      query: (params) => ({ url: '/room-types/', params }),
      providesTags: ['RoomType'],
    }),
    getRoomType: builder.query<RoomType, string>({
      query: (id) => ({ url: `/room-types/${id}/` }),
      providesTags: (_r, _e, id) => [{ type: 'RoomType', id }],
    }),
    createRoomType: builder.mutation<RoomType, Partial<RoomType>>({
      query: (data) => ({ url: '/room-types/', method: 'POST', data }),
      invalidatesTags: ['RoomType'],
    }),
    updateRoomType: builder.mutation<RoomType, { id: string; data: Partial<RoomType> }>({
      query: ({ id, data }) => ({ url: `/room-types/${id}/`, method: 'PATCH', data }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'RoomType', id }],
    }),
    // Bed configurations
    addBedConfig: builder.mutation<BedConfiguration, { roomTypeId: string; data: Partial<BedConfiguration> }>({
      query: ({ roomTypeId, data }) => ({ url: `/room-types/${roomTypeId}/bed-configs/`, method: 'POST', data }),
      invalidatesTags: (_r, _e, { roomTypeId }) => [{ type: 'RoomType', id: roomTypeId }],
    }),
    updateBedConfig: builder.mutation<BedConfiguration, { roomTypeId: string; configId: string; data: Partial<BedConfiguration> }>({
      query: ({ roomTypeId, configId, data }) => ({ url: `/room-types/${roomTypeId}/bed-configs/${configId}/`, method: 'PATCH', data }),
      invalidatesTags: (_r, _e, { roomTypeId }) => [{ type: 'RoomType', id: roomTypeId }],
    }),
    deleteBedConfig: builder.mutation<void, { roomTypeId: string; configId: string }>({
      query: ({ roomTypeId, configId }) => ({ url: `/room-types/${roomTypeId}/bed-configs/${configId}/`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, { roomTypeId }) => [{ type: 'RoomType', id: roomTypeId }],
    }),
    // Photos (multipart/form-data for file upload)
    addPhoto: builder.mutation<RoomTypePhoto, { roomTypeId: string; data: FormData }>({
      query: ({ roomTypeId, data }) => ({
        url: `/room-types/${roomTypeId}/photos/`,
        method: 'POST',
        data,
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
      invalidatesTags: (_r, _e, { roomTypeId }) => [{ type: 'RoomType', id: roomTypeId }],
    }),
    updatePhoto: builder.mutation<RoomTypePhoto, { roomTypeId: string; photoId: string; data: FormData }>({
      query: ({ roomTypeId, photoId, data }) => ({
        url: `/room-types/${roomTypeId}/photos/${photoId}/`,
        method: 'PATCH',
        data,
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
      invalidatesTags: (_r, _e, { roomTypeId }) => [{ type: 'RoomType', id: roomTypeId }],
    }),
    deletePhoto: builder.mutation<void, { roomTypeId: string; photoId: string }>({
      query: ({ roomTypeId, photoId }) => ({ url: `/room-types/${roomTypeId}/photos/${photoId}/`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, { roomTypeId }) => [{ type: 'RoomType', id: roomTypeId }],
    }),
  }),
});

export const {
  useGetRoomTypesQuery, useGetRoomTypeQuery,
  useCreateRoomTypeMutation, useUpdateRoomTypeMutation,
  useAddBedConfigMutation, useUpdateBedConfigMutation, useDeleteBedConfigMutation,
  useAddPhotoMutation, useUpdatePhotoMutation, useDeletePhotoMutation,
} = roomTypeApi;
