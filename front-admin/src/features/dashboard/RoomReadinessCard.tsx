import {
  Card,
  CardContent,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import StatusChip from '../../components/StatusChip';
import { ROOM_STATUS } from '../../utils/statusLabels';

interface RoomReadinessCardProps {
  total: number;
  byStatus: Record<string, number>;
  ready: number;
  notReady: number;
}

const STATUS_COLORS: Record<string, string> = {
  available: '#4CAF50',
  occupied: '#1976D2',
  dirty: '#FF9800',
  cleaning: '#03A9F4',
  inspection: '#9C27B0',
  blocked: '#F44336',
  maintenance: '#9E9E9E',
};

export default function RoomReadinessCard({ total, byStatus, ready, notReady }: RoomReadinessCardProps) {
  const statusEntries = Object.entries(byStatus).filter(([, count]) => count > 0);

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Estado de habitaciones
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          Total: {total} habitaciones
        </Typography>

        {/* Stacked bar */}
        {total > 0 && (
          <Box sx={{ display: 'flex', height: 12, borderRadius: 1, overflow: 'hidden', mb: 2 }}>
            {statusEntries.map(([status, count]) => (
              <Box
                key={status}
                sx={{
                  width: `${(count / total) * 100}%`,
                  backgroundColor: STATUS_COLORS[status] ?? '#9E9E9E',
                  minWidth: count > 0 ? 4 : 0,
                }}
              />
            ))}
          </Box>
        )}

        {/* Ready / Not ready metrics */}
        <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Listas
            </Typography>
            <Typography variant="h4" fontWeight={700} sx={{ color: '#4CAF50' }}>
              {ready}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Pendientes
            </Typography>
            <Typography variant="h4" fontWeight={700} sx={{ color: '#FF9800' }}>
              {notReady}
            </Typography>
          </Box>
        </Box>

        {/* Detailed status list */}
        <List dense disablePadding>
          {statusEntries.map(([status, count]) => (
            <ListItem key={status} disableGutters sx={{ py: 0.5 }}>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <StatusChip statusMap={ROOM_STATUS} value={status} />
                    <Typography variant="body2" fontWeight={600}>
                      {count}
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}
