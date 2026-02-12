import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';
import client from '../../api/client';
import type { User } from '../../interfaces/types';

interface AuthState {
  user: User | null;
  activePropertyId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const initialState: AuthState = {
  user: null,
  activePropertyId: localStorage.getItem('activePropertyId'),
  isAuthenticated: false,
  isLoading: true,
};

export const initAuth = createAsyncThunk('auth/init', async (_, { rejectWithValue }) => {
  const token = Cookies.get('access_token');
  if (!token) return rejectWithValue('No token');
  const { data } = await client.get<User>('/users/me/');
  return data;
});

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }) => {
    const { data } = await client.post<{ access: string; refresh: string }>('/auth/login/', credentials);
    Cookies.set('access_token', data.access, { sameSite: 'Lax' });
    Cookies.set('refresh_token', data.refresh, { sameSite: 'Lax' });
    const { data: user } = await client.get<User>('/users/me/');
    return user;
  },
);

export const logout = createAsyncThunk('auth/logout', async () => {
  try {
    await client.post('/auth/logout/');
  } catch {
    // ignore
  }
  Cookies.remove('access_token');
  Cookies.remove('refresh_token');
  localStorage.removeItem('activePropertyId');
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setActiveProperty(state, action: PayloadAction<string>) {
      state.activePropertyId = action.payload;
      localStorage.setItem('activePropertyId', action.payload);
    },
  },
  extraReducers: (builder) => {
    // initAuth
    builder.addCase(initAuth.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(initAuth.fulfilled, (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.isLoading = false;
      if (!state.activePropertyId && action.payload.properties.length > 0) {
        state.activePropertyId = action.payload.properties[0];
        localStorage.setItem('activePropertyId', action.payload.properties[0]);
      }
    });
    builder.addCase(initAuth.rejected, (state) => {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.user = null;
    });
    // login
    builder.addCase(login.fulfilled, (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.isLoading = false;
      if (!state.activePropertyId && action.payload.properties.length > 0) {
        state.activePropertyId = action.payload.properties[0];
        localStorage.setItem('activePropertyId', action.payload.properties[0]);
      }
    });
    // logout
    builder.addCase(logout.fulfilled, (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.activePropertyId = null;
    });
  },
});

export const { setActiveProperty } = authSlice.actions;
export default authSlice.reducer;
