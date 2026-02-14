import { Paper, Typography } from '@mui/material';
import type { DashboardAlert } from '../../interfaces/types';

interface StatusBarProps {
  alerts: DashboardAlert[];
  inHouse: number;
  urgentTasks: number;
  pendingReservations: number;
}

export default function StatusBar({ alerts, inHouse, urgentTasks, pendingReservations }: StatusBarProps) {
  const hasError = alerts.some((a) => a.severity === 'error');
  const hasWarning = alerts.some((a) => a.severity === 'warning');

  let bgcolor: string;
  let statusLabel: string;

  if (hasError) {
    bgcolor = '#D32F2F';
    statusLabel = 'Atención requerida';
  } else if (hasWarning) {
    bgcolor = '#ED6C02';
    statusLabel = 'Requiere atención';
  } else {
    bgcolor = '#2E7D32';
    statusLabel = 'Operación estable';
  }

  const parts = [
    statusLabel,
    `${inHouse} huésped${inHouse !== 1 ? 'es' : ''} hospedado${inHouse !== 1 ? 's' : ''}`,
    urgentTasks > 0 ? `${urgentTasks} tarea${urgentTasks !== 1 ? 's' : ''} urgente${urgentTasks !== 1 ? 's' : ''}` : null,
    pendingReservations > 0 ? `${pendingReservations} reserva${pendingReservations !== 1 ? 's' : ''} pendiente${pendingReservations !== 1 ? 's' : ''}` : null,
  ].filter(Boolean);

  return (
    <Paper sx={{ bgcolor, color: '#fff', px: 3, py: 1.5, mb: 3, borderRadius: 2 }} elevation={0}>
      <Typography variant="body1" fontWeight={600}>
        {parts.join(' \u2022 ')}
      </Typography>
    </Paper>
  );
}
