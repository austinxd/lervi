import { createApi } from '@reduxjs/toolkit/query/react';
import axiosBaseQuery from '../api/baseQuery';
import type { PaginatedResponse, Payment, ReservationCreate, ReservationDetail, ReservationList } from '../interfaces/types';

export const reservationApi = createApi({
  reducerPath: 'reservationApi',
  baseQuery: axiosBaseQuery,
  tagTypes: ['Reservation', 'Room', 'Dashboard'],
  endpoints: (builder) => ({
    getReservations: builder.query<PaginatedResponse<ReservationList>, {
      property?: string; page?: number; search?: string;
      operational_status?: string; financial_status?: string; origin_type?: string;
    }>({
      query: (params) => ({ url: '/reservations/', params }),
      providesTags: ['Reservation'],
    }),
    getReservation: builder.query<ReservationDetail, string>({
      query: (id) => ({ url: `/reservations/${id}/` }),
      providesTags: (_r, _e, id) => [{ type: 'Reservation', id }],
    }),
    createReservation: builder.mutation<ReservationDetail, ReservationCreate>({
      query: (data) => ({ url: '/reservations/', method: 'POST', data }),
      invalidatesTags: ['Reservation', 'Dashboard'],
    }),
    updateReservation: builder.mutation<ReservationDetail, { id: string; data: Partial<ReservationCreate> }>({
      query: ({ id, data }) => ({ url: `/reservations/${id}/`, method: 'PATCH', data }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Reservation', id }, 'Dashboard'],
    }),
    confirmReservation: builder.mutation<ReservationDetail, string>({
      query: (id) => ({ url: `/reservations/${id}/confirm/`, method: 'POST' }),
      invalidatesTags: (_r, _e, id) => [{ type: 'Reservation', id }, 'Dashboard'],
    }),
    checkInReservation: builder.mutation<ReservationDetail, { id: string; room_id?: string }>({
      query: ({ id, ...data }) => ({ url: `/reservations/${id}/check-in/`, method: 'POST', data }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Reservation', id }, 'Room', 'Dashboard'],
    }),
    checkOutReservation: builder.mutation<ReservationDetail, string>({
      query: (id) => ({ url: `/reservations/${id}/check-out/`, method: 'POST' }),
      invalidatesTags: (_r, _e, id) => [{ type: 'Reservation', id }, 'Room', 'Dashboard'],
    }),
    cancelReservation: builder.mutation<ReservationDetail, string>({
      query: (id) => ({ url: `/reservations/${id}/cancel/`, method: 'POST' }),
      invalidatesTags: (_r, _e, id) => [{ type: 'Reservation', id }, 'Dashboard'],
    }),
    noShowReservation: builder.mutation<ReservationDetail, string>({
      query: (id) => ({ url: `/reservations/${id}/no-show/`, method: 'POST' }),
      invalidatesTags: (_r, _e, id) => [{ type: 'Reservation', id }, 'Room', 'Dashboard'],
    }),
    addPayment: builder.mutation<Payment, { reservationId: string; data: { amount: string; method: string; status?: string; notes?: string } }>({
      query: ({ reservationId, data }) => ({ url: `/reservations/${reservationId}/payments/`, method: 'POST', data }),
      invalidatesTags: (_r, _e, { reservationId }) => [{ type: 'Reservation', id: reservationId }, 'Dashboard'],
    }),
    confirmPayment: builder.mutation<ReservationDetail, { reservationId: string; paymentId: string; amount: string; notes?: string }>({
      query: ({ reservationId, paymentId, amount, notes }) => ({
        url: `/reservations/${reservationId}/payments/${paymentId}/confirm/`,
        method: 'POST',
        data: { amount, notes },
      }),
      invalidatesTags: (_r, _e, { reservationId }) => [{ type: 'Reservation', id: reservationId }, 'Dashboard'],
    }),
    refundPayment: builder.mutation<ReservationDetail, { reservationId: string; paymentId: string; amount: string; notes?: string }>({
      query: ({ reservationId, paymentId, amount, notes }) => ({
        url: `/reservations/${reservationId}/payments/${paymentId}/refund/`,
        method: 'POST',
        data: { amount, notes },
      }),
      invalidatesTags: (_r, _e, { reservationId }) => [{ type: 'Reservation', id: reservationId }, 'Dashboard'],
    }),
    uploadVoucher: builder.mutation<ReservationDetail, { reservationId: string; file: File }>({
      query: ({ reservationId, file }) => {
        const formData = new FormData();
        formData.append('voucher', file);
        return {
          url: `/reservations/${reservationId}/upload-voucher/`,
          method: 'POST',
          data: formData,
          headers: { 'Content-Type': 'multipart/form-data' },
        };
      },
      invalidatesTags: (_r, _e, { reservationId }) => [{ type: 'Reservation', id: reservationId }, 'Dashboard'],
    }),
    deleteReservation: builder.mutation<void, string>({
      query: (id) => ({ url: `/reservations/${id}/`, method: 'DELETE' }),
      invalidatesTags: ['Reservation', 'Dashboard'],
    }),
  }),
});

export const {
  useGetReservationsQuery, useGetReservationQuery,
  useCreateReservationMutation, useUpdateReservationMutation,
  useConfirmReservationMutation, useCheckInReservationMutation,
  useCheckOutReservationMutation, useCancelReservationMutation,
  useNoShowReservationMutation,
  useAddPaymentMutation, useConfirmPaymentMutation, useRefundPaymentMutation,
  useUploadVoucherMutation, useDeleteReservationMutation,
} = reservationApi;
