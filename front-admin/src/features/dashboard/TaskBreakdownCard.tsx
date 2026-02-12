import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Badge,
} from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { TASK_TYPE_LABELS } from '../../utils/statusLabels';

interface TaskBreakdownCardProps {
  pending: number;
  inProgress: number;
  completedToday: number;
  byType: Record<string, number>;
  urgent: number;
}

export default function TaskBreakdownCard({
  pending,
  inProgress,
  completedToday,
  byType,
  urgent,
}: TaskBreakdownCardProps) {
  const typeEntries = Object.entries(byType).filter(([, count]) => count > 0);

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <AssignmentIcon color="action" />
          <Typography variant="h6">Tareas</Typography>
          {urgent > 0 && (
            <Badge badgeContent={urgent} color="error" sx={{ ml: 1 }}>
              <Chip label="urgentes" size="small" color="error" variant="outlined" />
            </Badge>
          )}
        </Box>

        {/* Main counts */}
        <Box sx={{ display: 'flex', gap: 4, mb: 2 }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Pendientes
            </Typography>
            <Typography variant="h5" fontWeight={700} color="warning.main">
              {pending}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              En progreso
            </Typography>
            <Typography variant="h5" fontWeight={700} color="info.main">
              {inProgress}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Completadas hoy
            </Typography>
            <Typography variant="h5" fontWeight={700} color="success.main">
              {completedToday}
            </Typography>
          </Box>
        </Box>

        {/* By type chips */}
        {typeEntries.length > 0 && (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {typeEntries.map(([type, count]) => (
              <Chip
                key={type}
                label={`${TASK_TYPE_LABELS[type] ?? type}: ${count}`}
                size="small"
                variant="outlined"
              />
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
