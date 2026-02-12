import { createApi } from '@reduxjs/toolkit/query/react';
import axiosBaseQuery from '../api/baseQuery';
import type { PaginatedResponse, TaskItem } from '../interfaces/types';

export const taskApi = createApi({
  reducerPath: 'taskApi',
  baseQuery: axiosBaseQuery,
  tagTypes: ['Task'],
  endpoints: (builder) => ({
    getTasks: builder.query<PaginatedResponse<TaskItem>, {
      property?: string; page?: number; status?: string;
      task_type?: string; priority?: string;
    }>({
      query: (params) => ({ url: '/tasks/', params }),
      providesTags: ['Task'],
    }),
    getTask: builder.query<TaskItem, string>({
      query: (id) => ({ url: `/tasks/${id}/` }),
      providesTags: (_r, _e, id) => [{ type: 'Task', id }],
    }),
    createTask: builder.mutation<TaskItem, Partial<TaskItem>>({
      query: (data) => ({ url: '/tasks/', method: 'POST', data }),
      invalidatesTags: ['Task'],
    }),
    updateTask: builder.mutation<TaskItem, { id: string; data: Partial<TaskItem> }>({
      query: ({ id, data }) => ({ url: `/tasks/${id}/`, method: 'PATCH', data }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Task', id }],
    }),
    startTask: builder.mutation<TaskItem, string>({
      query: (id) => ({ url: `/tasks/${id}/start/`, method: 'POST' }),
      invalidatesTags: (_r, _e, id) => [{ type: 'Task', id }],
    }),
    completeTask: builder.mutation<TaskItem, { id: string; result?: string }>({
      query: ({ id, result }) => ({ url: `/tasks/${id}/complete/`, method: 'POST', data: { result } }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Task', id }],
    }),
  }),
});

export const {
  useGetTasksQuery, useGetTaskQuery,
  useCreateTaskMutation, useUpdateTaskMutation,
  useStartTaskMutation, useCompleteTaskMutation,
} = taskApi;
