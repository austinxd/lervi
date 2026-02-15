import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ThemeProvider, CssBaseline, CircularProgress, Box } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import theme from './theme';
import { useAppDispatch } from './store/hooks';
import { initAuth } from './features/auth/authSlice';

import ProtectedRoute from './components/ProtectedRoute';
import RoleGuard from './components/RoleGuard';
import MainLayout from './components/Layout/MainLayout';
import LoginPage from './features/auth/LoginPage';
import DashboardPage from './features/dashboard/DashboardPage';

// Code-split heavy feature pages
const ReservationList = lazy(() => import('./features/reservations/ReservationList'));
const ReservationDetail = lazy(() => import('./features/reservations/ReservationDetail'));
const ReservationCreate = lazy(() => import('./features/reservations/ReservationCreate'));
const RoomList = lazy(() => import('./features/rooms/RoomList'));
const RoomForm = lazy(() => import('./features/rooms/RoomForm'));
const RoomTypeList = lazy(() => import('./features/rooms/RoomTypeList'));
const RoomTypeForm = lazy(() => import('./features/rooms/RoomTypeForm'));
const GuestList = lazy(() => import('./features/guests/GuestList'));
const GuestDetail = lazy(() => import('./features/guests/GuestDetail'));
const TaskList = lazy(() => import('./features/tasks/TaskList'));
const TaskForm = lazy(() => import('./features/tasks/TaskForm'));
const PricingLayout = lazy(() => import('./features/pricing/PricingLayout'));
const RuleList = lazy(() => import('./features/automations/RuleList'));
const RuleForm = lazy(() => import('./features/automations/RuleForm'));
const LogList = lazy(() => import('./features/automations/LogList'));
const UserList = lazy(() => import('./features/users/UserList'));
const UserForm = lazy(() => import('./features/users/UserForm'));
const InvoiceList = lazy(() => import('./features/billing/InvoiceList'));
const InvoiceDetail = lazy(() => import('./features/billing/InvoiceDetail'));
const BillingConfigPage = lazy(() => import('./features/billing/BillingConfigPage'));
const OrganizationSettings = lazy(() => import('./features/settings/OrganizationSettings'));
const PropertySettings = lazy(() => import('./features/settings/PropertySettings'));
const PropertyDetail = lazy(() => import('./features/settings/PropertyDetail'));

const LazyFallback = () => (
  <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
    <CircularProgress />
  </Box>
);

export default function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(initAuth());
  }, [dispatch]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/" element={<DashboardPage />} />
                {/* Reservations */}
                <Route path="/reservations" element={<Suspense fallback={<LazyFallback />}><ReservationList /></Suspense>} />
                <Route path="/reservations/new" element={<Suspense fallback={<LazyFallback />}><ReservationCreate /></Suspense>} />
                <Route path="/reservations/:id" element={<Suspense fallback={<LazyFallback />}><ReservationDetail /></Suspense>} />
                {/* Rooms */}
                <Route path="/rooms" element={<Suspense fallback={<LazyFallback />}><RoomList /></Suspense>} />
                <Route path="/rooms/new" element={<Suspense fallback={<LazyFallback />}><RoomForm /></Suspense>} />
                <Route path="/rooms/:id/edit" element={<Suspense fallback={<LazyFallback />}><RoomForm /></Suspense>} />
                {/* Room Types */}
                <Route path="/room-types" element={<Suspense fallback={<LazyFallback />}><RoomTypeList /></Suspense>} />
                <Route path="/room-types/new" element={<Suspense fallback={<LazyFallback />}><RoomTypeForm /></Suspense>} />
                <Route path="/room-types/:id/edit" element={<Suspense fallback={<LazyFallback />}><RoomTypeForm /></Suspense>} />
                {/* Guests */}
                <Route path="/guests" element={<Suspense fallback={<LazyFallback />}><GuestList /></Suspense>} />
                <Route path="/guests/:id" element={<Suspense fallback={<LazyFallback />}><GuestDetail /></Suspense>} />
                {/* Tasks */}
                <Route path="/tasks" element={<Suspense fallback={<LazyFallback />}><TaskList /></Suspense>} />
                <Route path="/tasks/new" element={<Suspense fallback={<LazyFallback />}><TaskForm /></Suspense>} />
                <Route path="/tasks/:id/edit" element={<Suspense fallback={<LazyFallback />}><TaskForm /></Suspense>} />
                {/* Pricing */}
                <Route path="/pricing/*" element={<RoleGuard minRole="owner"><Suspense fallback={<LazyFallback />}><PricingLayout /></Suspense></RoleGuard>} />
                {/* Automations */}
                <Route path="/automations" element={<RoleGuard minRole="manager"><Suspense fallback={<LazyFallback />}><RuleList /></Suspense></RoleGuard>} />
                <Route path="/automations/rules/new" element={<RoleGuard minRole="manager"><Suspense fallback={<LazyFallback />}><RuleForm /></Suspense></RoleGuard>} />
                <Route path="/automations/rules/:id/edit" element={<RoleGuard minRole="manager"><Suspense fallback={<LazyFallback />}><RuleForm /></Suspense></RoleGuard>} />
                <Route path="/automations/logs" element={<RoleGuard minRole="manager"><Suspense fallback={<LazyFallback />}><LogList /></Suspense></RoleGuard>} />
                {/* Billing */}
                <Route path="/billing" element={<RoleGuard minRole="owner"><Suspense fallback={<LazyFallback />}><InvoiceList /></Suspense></RoleGuard>} />
                <Route path="/billing/config" element={<RoleGuard minRole="owner"><Suspense fallback={<LazyFallback />}><BillingConfigPage /></Suspense></RoleGuard>} />
                <Route path="/billing/invoices/:id" element={<RoleGuard minRole="owner"><Suspense fallback={<LazyFallback />}><InvoiceDetail /></Suspense></RoleGuard>} />
                {/* Users */}
                <Route path="/users" element={<RoleGuard minRole="owner"><Suspense fallback={<LazyFallback />}><UserList /></Suspense></RoleGuard>} />
                <Route path="/users/new" element={<RoleGuard minRole="owner"><Suspense fallback={<LazyFallback />}><UserForm /></Suspense></RoleGuard>} />
                <Route path="/users/:id/edit" element={<RoleGuard minRole="owner"><Suspense fallback={<LazyFallback />}><UserForm /></Suspense></RoleGuard>} />
                {/* Settings */}
                <Route path="/settings" element={<RoleGuard minRole="manager"><Suspense fallback={<LazyFallback />}><OrganizationSettings /></Suspense></RoleGuard>} />
                <Route path="/settings/properties" element={<RoleGuard minRole="manager"><Suspense fallback={<LazyFallback />}><PropertySettings /></Suspense></RoleGuard>} />
                <Route path="/settings/properties/:id" element={<RoleGuard minRole="manager"><Suspense fallback={<LazyFallback />}><PropertyDetail /></Suspense></RoleGuard>} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </SnackbarProvider>
    </ThemeProvider>
  );
}
