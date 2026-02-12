import { createApi } from '@reduxjs/toolkit/query/react';
import axiosBaseQuery from '../api/baseQuery';
import type { PaginatedResponse, User, UserCreate } from '../interfaces/types';

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: axiosBaseQuery,
  tagTypes: ['User'],
  endpoints: (builder) => ({
    getUsers: builder.query<PaginatedResponse<User>, { page?: number; search?: string }>({
      query: (params) => ({ url: '/users/', params }),
      providesTags: ['User'],
    }),
    getUser: builder.query<User, string>({
      query: (id) => ({ url: `/users/${id}/` }),
      providesTags: (_r, _e, id) => [{ type: 'User', id }],
    }),
    createUser: builder.mutation<User, UserCreate>({
      query: (data) => ({ url: '/users/', method: 'POST', data }),
      invalidatesTags: ['User'],
    }),
    updateUser: builder.mutation<User, { id: string; data: Partial<User> }>({
      query: ({ id, data }) => ({ url: `/users/${id}/`, method: 'PATCH', data }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'User', id }],
    }),
  }),
});

export const {
  useGetUsersQuery, useGetUserQuery,
  useCreateUserMutation, useUpdateUserMutation,
} = userApi;
