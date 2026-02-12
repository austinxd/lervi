import {
  Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  Toolbar, Typography, Divider, useMediaQuery, useTheme,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import EventNoteIcon from '@mui/icons-material/EventNote';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import CategoryIcon from '@mui/icons-material/Category';
import PeopleIcon from '@mui/icons-material/People';
import TaskIcon from '@mui/icons-material/Task';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import { hasMinRole } from '../../utils/roles';
import type { UserRole } from '../../interfaces/types';

const DRAWER_WIDTH = 240;

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  minRole?: UserRole;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/', icon: <DashboardIcon /> },
  { label: 'Reservaciones', path: '/reservations', icon: <EventNoteIcon /> },
  { label: 'Habitaciones', path: '/rooms', icon: <MeetingRoomIcon /> },
  { label: 'Tipos de Hab.', path: '/room-types', icon: <CategoryIcon /> },
  { label: 'Huéspedes', path: '/guests', icon: <PeopleIcon /> },
  { label: 'Tareas', path: '/tasks', icon: <TaskIcon /> },
  { label: 'Pricing', path: '/pricing', icon: <AttachMoneyIcon />, minRole: 'owner' },
  { label: 'Automatizaciones', path: '/automations', icon: <AutoFixHighIcon />, minRole: 'manager' },
  { label: 'Usuarios', path: '/users', icon: <PersonIcon />, minRole: 'owner' },
  { label: 'Configuración', path: '/settings', icon: <SettingsIcon />, minRole: 'manager' },
];

interface Props {
  mobileOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ mobileOpen, onClose }: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAppSelector((s) => s.auth.user);

  const filteredItems = NAV_ITEMS.filter(
    (item) => !item.minRole || hasMinRole(user?.role, item.minRole),
  );

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const drawer = (
    <>
      <Toolbar>
        <Typography variant="h6" fontWeight={700} color="primary">
          Austin OS
        </Typography>
      </Toolbar>
      <Divider />
      <List sx={{ px: 1 }}>
        {filteredItems.map((item) => (
          <ListItemButton
            key={item.path}
            selected={isActive(item.path)}
            onClick={() => { navigate(item.path); if (isMobile) onClose(); }}
            sx={{ borderRadius: 1, mb: 0.5 }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
    </>
  );

  return (
    <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={onClose}
          ModalProps={{ keepMounted: true }}
          sx={{ '& .MuiDrawer-paper': { width: DRAWER_WIDTH } }}
        >
          {drawer}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{ '& .MuiDrawer-paper': { width: DRAWER_WIDTH, borderRight: '1px solid #E0E0E0' } }}
          open
        >
          {drawer}
        </Drawer>
      )}
    </Box>
  );
}
