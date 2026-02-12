import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import HotelIcon from '@mui/icons-material/Hotel';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { useAppSelector } from '../../store/hooks';
import { useGetTodayQuery, useGetOccupancyQuery } from '../../services/dashboardService';
import { formatCurrency } from '../../utils/formatters';
import { ROOM_STATUS } from '../../utils/statusLabels';
import StatusChip from '../../components/StatusChip';
import SummaryCard from './SummaryCard';
import OccupancyChart from './OccupancyChart';
import RevenueSection from './RevenueSection';

export default function DashboardPage() {
  const user = useAppSelector((s) => s.auth.user);
  const activePropertyId = useAppSelector((s) => s.auth.activePropertyId);
  const isOwner = user?.role === 'owner' || user?.role === 'super_admin';

  const {
    data: todayData,
    isLoading: todayLoading,
  } = useGetTodayQuery(
    { property: activePropertyId ?? undefined },
    { skip: !activePropertyId },
  );

  const {
    data: occupancyData,
    isLoading: occupancyLoading,
  } = useGetOccupancyQuery(
    { property: activePropertyId ?? undefined, days: 7 },
    { skip: !activePropertyId },
  );

  if (todayLoading || occupancyLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  const reservations = todayData?.reservations;
  const rooms = todayData?.rooms;
  const tasks = todayData?.tasks;
  const revenueToday = todayData?.revenue_today ?? '0';

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Dashboard
      </Typography>

      {/* Summary cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title="Check-ins hoy"
            value={reservations?.check_ins_today ?? 0}
            icon={<LoginIcon />}
            color="#2E7D32"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title="Check-outs hoy"
            value={reservations?.check_outs_today ?? 0}
            icon={<LogoutIcon />}
            color="#ED6C02"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title="In-house"
            value={reservations?.in_house ?? 0}
            icon={<HotelIcon />}
            color="#1976D2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title="Revenue hoy"
            value={formatCurrency(revenueToday)}
            icon={<AttachMoneyIcon />}
            color="#9C27B0"
          />
        </Grid>
      </Grid>

      {/* Occupancy chart + Room status */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <OccupancyChart data={occupancyData?.daily ?? []} />
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Estado de habitaciones
              </Typography>
              {rooms ? (
                <>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Total: {rooms.total} habitaciones
                  </Typography>
                  <List dense disablePadding>
                    {Object.entries(rooms.by_status).map(([status, count]) => (
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
                </>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Sin datos disponibles
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tasks summary */}
      {tasks && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <AssignmentIcon color="action" />
              <Typography variant="h6">Tareas</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 4 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Pendientes
                </Typography>
                <Typography variant="h5" fontWeight={700} color="warning.main">
                  {tasks.pending}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  En progreso
                </Typography>
                <Typography variant="h5" fontWeight={700} color="info.main">
                  {tasks.in_progress}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Completadas hoy
                </Typography>
                <Typography variant="h5" fontWeight={700} color="success.main">
                  {tasks.completed_today}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Revenue section (owners only) */}
      {isOwner && <RevenueSection />}
    </Box>
  );
}
