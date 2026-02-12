import { createApi } from '@reduxjs/toolkit/query/react';
import axiosBaseQuery from '../api/baseQuery';
import type { PaginatedResponse, Room } from '../interfaces/types';

export const roomApi = createApi({
  reducerPath: 'roomApi',
  baseQuery: axiosBaseQuery,
  tagTypes: ['Room'],
  endpoints: (builder) => ({
    getRooms: builder.query<PaginatedResponse<Room>, { property?: string; page?: number; status?: string }>({
      query: (params) => ({ url: '/rooms/', params }),
      providesTags: ['Room'],
    }),
    getRoom: builder.query<Room, string>({
      query: (id) => ({ url: `/rooms/${id}/` }),
      providesTags: (_r, _e, id) => [{ type: 'Room', id }],
    }),
    createRoom: builder.mutation<Room, Partial<Room>>({
      query: (data) => ({ url: '/rooms/', method: 'POST', data }),
      invalidatesTags: ['Room'],
    }),
    updateRoom: builder.mutation<Room, { id: string; data: Partial<Room> }>({
      query: ({ id, data }) => ({ url: `/rooms/${id}/`, method: 'PATCH', data }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Room', id }],
    }),
    changeRoomStatus: builder.mutation<Room, { id: string; new_status: string }>({
      query: ({ id, new_status }) => ({
        url: `/rooms/${id}/change-status/`,
        method: 'POST',
        data: { new_status },
      }),
      invalidatesTags: ['Room'],
    }),
    changeRoomBedConfig: builder.mutation<Room, { id: string; bed_configuration_id: string }>({
      query: ({ id, bed_configuration_id }) => ({
        url: `/rooms/${id}/change-bed-config/`,
        method: 'POST',
        data: { bed_configuration_id },
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Room', id }],
    }),
  }),
});

export const {
  useGetRoomsQuery, useGetRoomQuery,
  useCreateRoomMutation, useUpdateRoomMutation,
  useChangeRoomStatusMutation, useChangeRoomBedConfigMutation,
} = roomApi;
