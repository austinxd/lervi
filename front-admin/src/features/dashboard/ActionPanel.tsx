import { Paper, List, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useNavigate } from 'react-router-dom';

interface ActionPanelProps {
  incompleteReservations: number;
  urgentTasks: number;
  roomsNotReady: number;
}

interface ActionItem {
  label: string;
  path: string;
}

export default function ActionPanel({ incompleteReservations, urgentTasks, roomsNotReady }: ActionPanelProps) {
  const navigate = useNavigate();

  const items: ActionItem[] = [];

  if (incompleteReservations > 0) {
    items.push({
      label: `${incompleteReservations} reserva${incompleteReservations !== 1 ? 's' : ''} sin confirmar`,
      path: '/reservations',
    });
  }
  if (urgentTasks > 0) {
    items.push({
      label: `${urgentTasks} tarea${urgentTasks !== 1 ? 's' : ''} urgente${urgentTasks !== 1 ? 's' : ''}`,
      path: '/tasks',
    });
  }
  if (roomsNotReady > 0) {
    items.push({
      label: `${roomsNotReady} habitación${roomsNotReady !== 1 ? 'es' : ''} por preparar`,
      path: '/rooms',
    });
  }

  if (items.length === 0) return null;

  return (
    <Paper sx={{ mb: 3 }} variant="outlined">
      <Typography variant="subtitle2" sx={{ px: 2, pt: 1.5, pb: 0.5, color: 'text.secondary' }}>
        Acciones pendientes
      </Typography>
      <List disablePadding dense>
        {items.map((item) => (
          <ListItemButton key={item.path} onClick={() => navigate(item.path)}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <WarningAmberIcon color="warning" fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={item.label} />
            <ChevronRightIcon fontSize="small" color="action" />
          </ListItemButton>
        ))}
      </List>
    </Paper>
  );
}
