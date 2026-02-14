import { useState } from 'react';
import {
  Box,
  Typography,
  ButtonGroup,
  Button,
  CircularProgress,
  Alert,
  Grid,
} from '@mui/material';
import { useAppSelector } from '../../store/hooks';
import { useGetWebFunnelQuery } from '../../services/dashboardService';
import FunnelChart from './FunnelChart';
import KpiBridgeCards from './KpiBridgeCards';
import InsightsPanel from './InsightsPanel';

type Period = 'today' | '7d' | '30d';

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: 'today', label: 'Hoy' },
  { value: '7d', label: '7 dias' },
  { value: '30d', label: '30 dias' },
];

export default function WebFunnelSection() {
  const activePropertyId = useAppSelector((s) => s.auth.activePropertyId);
  const [period, setPeriod] = useState<Period>('7d');

  const { data, isLoading, isError } = useGetWebFunnelQuery({
    property: activePropertyId ?? undefined,
    period,
  });

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Embudo Web</Typography>
        <ButtonGroup size="small">
          {PERIOD_OPTIONS.map((opt) => (
            <Button
              key={opt.value}
              variant={period === opt.value ? 'contained' : 'outlined'}
              onClick={() => setPeriod(opt.value)}
            >
              {opt.label}
            </Button>
          ))}
        </ButtonGroup>
      </Box>

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {isError && (
        <Alert severity="error">Error al cargar datos del embudo web</Alert>
      )}

      {data && (
        <>
          {data.funnel.every((s) => s.sessions === 0) ? (
            <Alert severity="info" sx={{ mb: 2 }}>
              No hay eventos registrados en este periodo. Los datos apareceran cuando los visitantes interactuen con tu pagina de reservas.
            </Alert>
          ) : (
            <>
              <Box sx={{ mb: 3 }}>
                <KpiBridgeCards
                  totalReservations={data.kpi_bridge.total_reservations}
                  webReservations={data.kpi_bridge.web_reservations}
                  pctDirect={data.kpi_bridge.pct_direct}
                />
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} md={7}>
                  <FunnelChart funnel={data.funnel} />
                </Grid>
                <Grid item xs={12} md={5}>
                  <InsightsPanel
                    mainAbandonmentStep={data.insights.main_abandonment_step}
                    mainAbandonmentDropPct={data.insights.main_abandonment_drop_pct}
                    currentConversionRate={data.insights.current_conversion_rate}
                    prevConversionRate={data.insights.prev_conversion_rate}
                    wowChange={data.insights.wow_change}
                  />
                </Grid>
              </Grid>
            </>
          )}
        </>
      )}
    </Box>
  );
}
