import { createApi } from '@reduxjs/toolkit/query/react';
import axiosBaseQuery from '../api/baseQuery';
import type { User } from '../interfaces/types';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: axiosBaseQuery,
  endpoints: (builder) => ({
    getMe: builder.query<User, void>({
      query: () => ({ url: '/users/me/' }),
    }),
  }),
});

export const { useGetMeQuery } = authApi;
