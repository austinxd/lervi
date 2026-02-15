import { useState } from 'react';
import { Box, Toolbar } from '@mui/material';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/reservations': 'Reservaciones',
  '/rooms': 'Habitaciones',
  '/room-types': 'Tipos de Habitación',
  '/guests': 'Huéspedes',
  '/tasks': 'Tareas',
  '/pricing': 'Pricing',
  '/billing/config': 'Configuracion de Facturacion',
  '/billing': 'Facturacion',
  '/automations': 'Automatizaciones',
  '/users': 'Usuarios',
  '/settings': 'Configuración',
};

function getTitle(pathname: string): string {
  for (const [path, title] of Object.entries(TITLES)) {
    if (path === '/' && pathname === '/') return title;
    if (path !== '/' && pathname.startsWith(path)) return title;
  }
  return 'Lervi';
}

export default function MainLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Topbar onMenuToggle={() => setMobileOpen(!mobileOpen)} title={getTitle(location.pathname)} />
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <Box component="main" sx={{ flexGrow: 1, p: 3, bgcolor: 'background.default' }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
