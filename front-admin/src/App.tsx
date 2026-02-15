import { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import theme from './theme';
import { useAppDispatch } from './store/hooks';
import { initAuth } from './features/auth/authSlice';

import ProtectedRoute from './components/ProtectedRoute';
import RoleGuard from './components/RoleGuard';
import MainLayout from './components/Layout/MainLayout';
import LoginPage from './features/auth/LoginPage';
import DashboardPage from './features/dashboard/DashboardPage';
import ReservationList from './features/reservations/ReservationList';
import ReservationDetail from './features/reservations/ReservationDetail';
import ReservationCreate from './features/reservations/ReservationCreate';
import RoomList from './features/rooms/RoomList';
import RoomForm from './features/rooms/RoomForm';
import RoomTypeList from './features/rooms/RoomTypeList';
import RoomTypeForm from './features/rooms/RoomTypeForm';
import GuestList from './features/guests/GuestList';
import GuestDetail from './features/guests/GuestDetail';
import TaskList from './features/tasks/TaskList';
import TaskForm from './features/tasks/TaskForm';
import PricingLayout from './features/pricing/PricingLayout';
import RuleList from './features/automations/RuleList';
import RuleForm from './features/automations/RuleForm';
import LogList from './features/automations/LogList';
import UserList from './features/users/UserList';
import UserForm from './features/users/UserForm';
import InvoiceList from './features/billing/InvoiceList';
import InvoiceDetail from './features/billing/InvoiceDetail';
import BillingConfigPage from './features/billing/BillingConfigPage';
import OrganizationSettings from './features/settings/OrganizationSettings';
import PropertySettings from './features/settings/PropertySettings';
import PropertyDetail from './features/settings/PropertyDetail';

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
                <Route path="/reservations" element={<ReservationList />} />
                <Route path="/reservations/new" element={<ReservationCreate />} />
                <Route path="/reservations/:id" element={<ReservationDetail />} />
                {/* Rooms */}
                <Route path="/rooms" element={<RoomList />} />
                <Route path="/rooms/new" element={<RoomForm />} />
                <Route path="/rooms/:id/edit" element={<RoomForm />} />
                {/* Room Types */}
                <Route path="/room-types" element={<RoomTypeList />} />
                <Route path="/room-types/new" element={<RoomTypeForm />} />
                <Route path="/room-types/:id/edit" element={<RoomTypeForm />} />
                {/* Guests */}
                <Route path="/guests" element={<GuestList />} />
                <Route path="/guests/:id" element={<GuestDetail />} />
                {/* Tasks */}
                <Route path="/tasks" element={<TaskList />} />
                <Route path="/tasks/new" element={<TaskForm />} />
                <Route path="/tasks/:id/edit" element={<TaskForm />} />
                {/* Pricing */}
                <Route path="/pricing/*" element={<RoleGuard minRole="owner"><PricingLayout /></RoleGuard>} />
                {/* Automations */}
                <Route path="/automations" element={<RoleGuard minRole="manager"><RuleList /></RoleGuard>} />
                <Route path="/automations/rules/new" element={<RoleGuard minRole="manager"><RuleForm /></RoleGuard>} />
                <Route path="/automations/rules/:id/edit" element={<RoleGuard minRole="manager"><RuleForm /></RoleGuard>} />
                <Route path="/automations/logs" element={<RoleGuard minRole="manager"><LogList /></RoleGuard>} />
                {/* Billing */}
                <Route path="/billing" element={<RoleGuard minRole="owner"><InvoiceList /></RoleGuard>} />
                <Route path="/billing/config" element={<RoleGuard minRole="owner"><BillingConfigPage /></RoleGuard>} />
                <Route path="/billing/invoices/:id" element={<RoleGuard minRole="owner"><InvoiceDetail /></RoleGuard>} />
                {/* Users */}
                <Route path="/users" element={<RoleGuard minRole="owner"><UserList /></RoleGuard>} />
                <Route path="/users/new" element={<RoleGuard minRole="owner"><UserForm /></RoleGuard>} />
                <Route path="/users/:id/edit" element={<RoleGuard minRole="owner"><UserForm /></RoleGuard>} />
                {/* Settings */}
                <Route path="/settings" element={<RoleGuard minRole="manager"><OrganizationSettings /></RoleGuard>} />
                <Route path="/settings/properties" element={<RoleGuard minRole="manager"><PropertySettings /></RoleGuard>} />
                <Route path="/settings/properties/:id" element={<RoleGuard minRole="manager"><PropertyDetail /></RoleGuard>} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </SnackbarProvider>
    </ThemeProvider>
  );
}
