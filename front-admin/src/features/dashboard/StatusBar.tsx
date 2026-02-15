import { Paper, Typography } from '@mui/material';
import type { DashboardAlert } from '../../interfaces/types';

interface StatusBarProps {
  alerts: DashboardAlert[];
}

export default function StatusBar({ alerts }: StatusBarProps) {
  const hasError = alerts.some((a) => a.severity === 'error');
  const hasWarning = alerts.some((a) => a.severity === 'warning');

  let bgcolor: string;
  let statusLabel: string;

  if (hasError) {
    bgcolor = '#D32F2F';
    statusLabel = 'Atencion requerida';
  } else if (hasWarning) {
    bgcolor = '#ED6C02';
    statusLabel = 'Requiere atencion';
  } else {
    bgcolor = '#2E7D32';
    statusLabel = 'Operacion estable';
  }

  const parts = [
    statusLabel,
    ...alerts.map((a) => a.message),
  ];

  return (
    <Paper sx={{ bgcolor, color: '#fff', px: 3, py: 1.5, mb: 3, borderRadius: 2 }} elevation={0}>
      <Typography variant="body1" fontWeight={600}>
        {parts.join(' \u2022 ')}
      </Typography>
    </Paper>
  );
}
