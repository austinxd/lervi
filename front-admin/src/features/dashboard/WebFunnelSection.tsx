import { useState } from 'react';
import {
  Box,
  Typography,
  ButtonGroup,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import { useAppSelector } from '../../store/hooks';
import { useGetWebFunnelQuery } from '../../services/dashboardService';
import FunnelChart from './FunnelChart';
import InsightsPanel from './InsightsPanel';
import CheckoutFrictionPanel from './CheckoutFrictionPanel';
import type { DataTier } from './InsightsPanel';

type Period = 'today' | '7d' | '30d';

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: 'today', label: 'Hoy' },
  { value: '7d', label: '7 dias' },
  { value: '30d', label: '30 dias' },
];

const FUNNEL_MIN_SESSIONS = 30;

export default function WebFunnelSection() {
  const activePropertyId = useAppSelector((s) => s.auth.activePropertyId);
  const [period, setPeriod] = useState<Period>('7d');

  const { data, isLoading, isError } = useGetWebFunnelQuery({
    property: activePropertyId ?? undefined,
    period,
  });

  const totalSessions = data?.funnel[0]?.sessions ?? 0;
  const tier: DataTier = totalSessions < FUNNEL_MIN_SESSIONS
    ? 'collecting'
    : totalSessions < 100
      ? 'initial'
      : 'reliable';

  const pageViews = data?.funnel.find((s) => s.step === 'page_view')?.sessions ?? 0;
  const bookingConfirmed = data?.funnel.find((s) => s.step === 'booking_confirmed')?.sessions ?? 0;
  const conversionRate = tier !== 'collecting' && pageViews > 0
    ? (bookingConfirmed / pageViews * 100).toFixed(1)
    : '—';

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
              {tier === 'collecting' && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  Recolectando datos suficientes para analisis. Se necesitan al menos 30 sesiones para generar insights confiables.
                </Alert>
              )}

              {/* Side-by-side: funnel left, KPIs + insights right */}
              <Grid container spacing={2}>
                {/* Left column: funnel chart */}
                <Grid item xs={12} md={5}>
                  <FunnelChart
                    funnel={data.funnel}
                    placeholder={tier === 'collecting'}
                    periodLabel={PERIOD_OPTIONS.find((o) => o.value === period)?.label}
                  />
                </Grid>

                {/* Right column: conversion + bridge + insights + friction */}
                <Grid item xs={12} md={7}>
                  {/* Conversion rate + bridge KPIs */}
                  <Card sx={{ mb: 2, borderLeft: '4px solid #2E7D32' }}>
                    <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1.5 }}>
                        <Typography variant="h4" fontWeight={800} color="#2E7D32">
                          {conversionRate}{conversionRate !== '—' ? '%' : ''}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Tasa de conversion web
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 3 }}>
                        <Box>
                          <Typography variant="h6" fontWeight={700}>{data.kpi_bridge.total_reservations}</Typography>
                          <Typography variant="caption" color="text.secondary">Reservas totales</Typography>
                        </Box>
                        <Box>
                          <Typography variant="h6" fontWeight={700} color="#2E7D32">{data.kpi_bridge.web_reservations}</Typography>
                          <Typography variant="caption" color="text.secondary">Reservas web</Typography>
                        </Box>
                        <Box>
                          <Typography variant="h6" fontWeight={700} color="#ED6C02">{data.kpi_bridge.pct_direct}%</Typography>
                          <Typography variant="caption" color="text.secondary">% Directo</Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>

                  {tier !== 'collecting' && (
                    <>
                      <Box sx={{ mb: 2 }}>
                        <InsightsPanel
                          mainAbandonmentStep={data.insights.main_abandonment_step}
                          mainAbandonmentDropPct={data.insights.main_abandonment_drop_pct}
                          currentConversionRate={data.insights.current_conversion_rate}
                          prevConversionRate={data.insights.prev_conversion_rate}
                          wowChange={data.insights.wow_change}
                          tier={tier}
                        />
                      </Box>
                      <CheckoutFrictionPanel friction={data.checkout_friction} />
                    </>
                  )}
                </Grid>
              </Grid>

              {/* Footer */}
              {data.kpi_bridge.total_reservations > 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Reservas web: {data.kpi_bridge.web_reservations} de {data.kpi_bridge.total_reservations} reservas totales ({data.kpi_bridge.pct_direct}%)
                </Typography>
              )}
            </>
          )}
        </>
      )}
    </Box>
  );
}
