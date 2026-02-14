import {
  Box,
  Grid,
  Typography,
  CircularProgress,
} from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import HotelIcon from '@mui/icons-material/Hotel';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { useAppSelector } from '../../store/hooks';
import { useGetTodayQuery, useGetOccupancyQuery } from '../../services/dashboardService';
import { formatCurrency } from '../../utils/formatters';
import SummaryCard from './SummaryCard';
import OccupancyChart from './OccupancyChart';
import RevenueSection from './RevenueSection';
import WebFunnelSection from './WebFunnelSection';
import AlertsBanner from './AlertsBanner';
import RoomReadinessCard from './RoomReadinessCard';
import RoomTypePopularityChart from './RoomTypePopularityChart';
import TaskBreakdownCard from './TaskBreakdownCard';

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
  const alerts = todayData?.alerts ?? [];
  const roomTypeOccupancy = todayData?.room_type_occupancy ?? [];

  const roomsReadyLabel = rooms ? `${rooms.ready}/${rooms.total}` : '0';

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Dashboard
      </Typography>

      {/* Alerts */}
      <AlertsBanner alerts={alerts} />

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
            title="Hab. listas"
            value={roomsReadyLabel}
            icon={<CleaningServicesIcon />}
            color="#00897B"
          />
        </Grid>
      </Grid>

      {/* Occupancy chart + Room readiness */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <OccupancyChart data={occupancyData?.daily ?? []} />
        </Grid>
        <Grid item xs={12} md={4}>
          {rooms ? (
            <RoomReadinessCard
              total={rooms.total}
              byStatus={rooms.by_status}
              ready={rooms.ready}
              notReady={rooms.not_ready}
            />
          ) : (
            <RoomReadinessCard total={0} byStatus={{}} ready={0} notReady={0} />
          )}
        </Grid>
      </Grid>

      {/* Room type popularity + Task breakdown */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={7}>
          <RoomTypePopularityChart data={roomTypeOccupancy} />
        </Grid>
        <Grid item xs={12} md={5}>
          {tasks && (
            <TaskBreakdownCard
              pending={tasks.pending}
              inProgress={tasks.in_progress}
              completedToday={tasks.completed_today}
              byType={tasks.by_type}
              urgent={tasks.urgent}
            />
          )}
        </Grid>
      </Grid>

      {/* Revenue section (owners only) */}
      {isOwner && (
        <>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <SummaryCard
                title="Revenue hoy"
                value={formatCurrency(revenueToday)}
                icon={<AttachMoneyIcon />}
                color="#9C27B0"
              />
            </Grid>
          </Grid>
          <RevenueSection />
          <Box sx={{ mt: 3 }}>
            <WebFunnelSection />
          </Box>
        </>
      )}
    </Box>
  );
}
