import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import { authApi } from '../services/authService';
import { automationApi } from '../services/automationService';
import { bankAccountApi } from '../services/bankAccountService';
import { dashboardApi } from '../services/dashboardService';
import { guestApi } from '../services/guestService';
import { organizationApi } from '../services/organizationService';
import { pricingApi } from '../services/pricingService';
import { reservationApi } from '../services/reservationService';
import { roomApi } from '../services/roomService';
import { roomTypeApi } from '../services/roomTypeService';
import { taskApi } from '../services/taskService';
import { userApi } from '../services/userService';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [bankAccountApi.reducerPath]: bankAccountApi.reducer,
    [dashboardApi.reducerPath]: dashboardApi.reducer,
    [reservationApi.reducerPath]: reservationApi.reducer,
    [roomApi.reducerPath]: roomApi.reducer,
    [roomTypeApi.reducerPath]: roomTypeApi.reducer,
    [guestApi.reducerPath]: guestApi.reducer,
    [taskApi.reducerPath]: taskApi.reducer,
    [pricingApi.reducerPath]: pricingApi.reducer,
    [automationApi.reducerPath]: automationApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [organizationApi.reducerPath]: organizationApi.reducer,
  },
  middleware: (getDefault) =>
    getDefault().concat(
      authApi.middleware,
      bankAccountApi.middleware,
      dashboardApi.middleware,
      reservationApi.middleware,
      roomApi.middleware,
      roomTypeApi.middleware,
      guestApi.middleware,
      taskApi.middleware,
      pricingApi.middleware,
      automationApi.middleware,
      userApi.middleware,
      organizationApi.middleware,
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
