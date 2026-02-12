import { Stack, Alert } from '@mui/material';
import type { DashboardAlert } from '../../interfaces/types';

interface AlertsBannerProps {
  alerts: DashboardAlert[];
}

export default function AlertsBanner({ alerts }: AlertsBannerProps) {
  if (alerts.length === 0) return null;

  return (
    <Stack spacing={1} sx={{ mb: 3 }}>
      {alerts.map((alert) => (
        <Alert key={alert.type} severity={alert.severity} variant="outlined">
          {alert.message}
        </Alert>
      ))}
    </Stack>
  );
}
