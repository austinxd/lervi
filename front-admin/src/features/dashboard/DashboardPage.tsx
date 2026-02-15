import { useState } from 'react';
import {
  Box,
  Grid,
  Tab,
  Tabs,
  Typography,
  CircularProgress,
} from '@mui/material';
import { useAppSelector } from '../../store/hooks';
import { useGetTodayQuery, useGetOccupancyQuery } from '../../services/dashboardService';
import { formatCurrency } from '../../utils/formatters';
import StatusBar from './StatusBar';
import KpiHeroCards from './KpiHeroCards';
import ActionPanel from './ActionPanel';
import OccupancyChart from './OccupancyChart';
import RevenueSection from './RevenueSection';
import WebFunnelSection from './WebFunnelSection';
import RoomReadinessCard from './RoomReadinessCard';
import RoomTypePopularityChart from './RoomTypePopularityChart';
import TaskBreakdownCard from './TaskBreakdownCard';

export default function DashboardPage() {
  const user = useAppSelector((s) => s.auth.user);
  const activePropertyId = useAppSelector((s) => s.auth.activePropertyId);
  const isOwner = user?.role === 'owner' || user?.role === 'super_admin';
  const [tab, setTab] = useState(0);

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

  const pendingReservations = (reservations?.incomplete ?? 0) + (reservations?.pending ?? 0);

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Dashboard
      </Typography>

      {/* Tabs — only for owners */}
      {isOwner && (
        <Tabs
          value={tab}
          onChange={(_e, v) => setTab(v)}
          sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Operaciones" />
          <Tab label="Canal Web" />
        </Tabs>
      )}

      {/* Tab 0: Operaciones */}
      {tab === 0 && (
        <>
          {/* Status bar */}
          <StatusBar alerts={alerts} />

          {/* KPI hero cards */}
          <KpiHeroCards
            occupancyRate={occupancyData?.current?.occupancy_rate ?? 0}
            revenueToday={formatCurrency(revenueToday)}
            inHouse={reservations?.in_house ?? 0}
            checkInsToday={reservations?.check_ins_today ?? 0}
          />

          {/* Action panel */}
          <ActionPanel
            incompleteReservations={pendingReservations}
            urgentTasks={tasks?.urgent ?? 0}
            roomsNotReady={rooms?.not_ready ?? 0}
          />

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
          {isOwner && <RevenueSection />}
        </>
      )}

      {/* Tab 1: Canal Web */}
      {tab === 1 && isOwner && <WebFunnelSection />}
    </Box>
  );
}
