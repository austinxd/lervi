import { createApi } from '@reduxjs/toolkit/query/react';
import axiosBaseQuery from '../api/baseQuery';
import type { Guest, GuestNote, PaginatedResponse } from '../interfaces/types';

export const guestApi = createApi({
  reducerPath: 'guestApi',
  baseQuery: axiosBaseQuery,
  tagTypes: ['Guest'],
  endpoints: (builder) => ({
    getGuests: builder.query<PaginatedResponse<Guest>, { page?: number; search?: string; is_vip?: boolean }>({
      query: (params) => ({ url: '/guests/', params }),
      providesTags: ['Guest'],
    }),
    getGuest: builder.query<Guest, string>({
      query: (id) => ({ url: `/guests/${id}/` }),
      providesTags: (_r, _e, id) => [{ type: 'Guest', id }],
    }),
    createGuest: builder.mutation<Guest, Partial<Guest>>({
      query: (data) => ({ url: '/guests/', method: 'POST', data }),
      invalidatesTags: ['Guest'],
    }),
    updateGuest: builder.mutation<Guest, { id: string; data: Partial<Guest> }>({
      query: ({ id, data }) => ({ url: `/guests/${id}/`, method: 'PATCH', data }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Guest', id }],
    }),
    addGuestNote: builder.mutation<GuestNote, { guestId: string; content: string }>({
      query: ({ guestId, content }) => ({ url: `/guests/${guestId}/notes/`, method: 'POST', data: { content } }),
      invalidatesTags: (_r, _e, { guestId }) => [{ type: 'Guest', id: guestId }],
    }),
    deleteGuest: builder.mutation<void, string>({
      query: (id) => ({ url: `/guests/${id}/`, method: 'DELETE' }),
      invalidatesTags: ['Guest'],
    }),
  }),
});

export const {
  useGetGuestsQuery, useGetGuestQuery,
  useCreateGuestMutation, useUpdateGuestMutation,
  useAddGuestNoteMutation, useDeleteGuestMutation,
} = guestApi;
