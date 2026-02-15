import {
  Card,
  CardContent,
  Typography,
  Box,
} from '@mui/material';
import type { FunnelStep } from '../../interfaces/types';

const STEP_LABELS: Record<string, string> = {
  page_view: 'Visitas',
  search_dates: 'Busqueda de fechas',
  start_booking: 'Inicio de reserva',
  booking_confirmed: 'Reserva confirmada',
};

const BAR_COLORS = ['#1565C0', '#1E88E5', '#42A5F5', '#2E7D32'];
const LOW_VOLUME_THRESHOLD = 30;
const MIN_WIDTH_PCT = 6;
const PLATFORM_BENCHMARK_PCT = 3.5;

interface FunnelChartProps {
  funnel: FunnelStep[];
  placeholder?: boolean;
  periodLabel?: string;
}

export default function FunnelChart({ funnel, placeholder = false, periodLabel }: FunnelChartProps) {
  const maxSessions = funnel[0]?.sessions || 1;
  const hasData = maxSessions > 0 && funnel.some((s) => s.sessions > 0);
  const lowVolume = maxSessions < LOW_VOLUME_THRESHOLD;

  const steps = funnel.map((item, index) => {
    const label = STEP_LABELS[item.step] ?? item.step;
    const widthPct = hasData
      ? Math.max((item.sessions / maxSessions) * 100, MIN_WIDTH_PCT)
      : MIN_WIDTH_PCT;
    return { ...item, label, widthPct, color: BAR_COLORS[index % BAR_COLORS.length] };
  });

  const dropOffs: number[] = [];
  for (let i = 0; i < funnel.length - 1; i++) {
    const current = funnel[i].sessions;
    const next = funnel[i + 1].sessions;
    dropOffs.push(current > 0 ? Math.round(((current - next) / current) * 100) : 0);
  }

  const searchSessions = funnel.find((s) => s.step === 'search_dates')?.sessions ?? 0;
  const confirmedSessions = funnel.find((s) => s.step === 'booking_confirmed')?.sessions ?? 0;
  const conversionPct = searchSessions > 0 ? (confirmedSessions / searchSessions * 100) : 0;

  const noData = !hasData;

  return (
    <Card>
      <CardContent sx={{ pb: '12px !important', pt: 1.5 }}>
        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.25 }}>
          Intencion del usuario
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block', lineHeight: 1.3 }}>
          Sesiones web{periodLabel ? ` — ${periodLabel}` : ''}
          {lowVolume && hasData && ' · Datos iniciales'}
        </Typography>

        {placeholder && !hasData && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Recolectando datos...
          </Typography>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {steps.map((step, i) => (
            <Box key={step.step}>
              {/* Bar */}
              <Box
                sx={{
                  width: `${step.widthPct}%`,
                  height: 28,
                  bgcolor: step.color,
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  px: 1.5,
                  opacity: noData ? 0.12 : lowVolume ? 0.75 : 1,
                  mx: 'auto',
                  position: 'relative',
                }}
              >
                {step.widthPct >= 35 ? (
                  <Typography
                    variant="caption"
                    sx={{
                      color: noData ? '#9E9E9E' : '#fff',
                      fontWeight: 600,
                      fontSize: 11,
                      whiteSpace: 'nowrap',
                      lineHeight: 1,
                    }}
                  >
                    {hasData ? `${step.label} (${step.sessions})` : step.label}
                  </Typography>
                ) : null}
              </Box>

              {/* Label outside bar when too narrow */}
              {step.widthPct < 35 && (
                <Typography
                  variant="caption"
                  sx={{
                    color: noData ? '#bdbdbd' : '#616161',
                    fontWeight: 600,
                    fontSize: 11,
                    display: 'block',
                    textAlign: 'center',
                    mt: '1px',
                    lineHeight: 1.2,
                  }}
                >
                  {hasData ? `${step.label} (${step.sessions})` : step.label}
                </Typography>
              )}

              {/* Drop-off */}
              {i < steps.length - 1 && hasData && dropOffs[i] > 0 && (
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    textAlign: 'center',
                    fontSize: 10,
                    fontWeight: 500,
                    color: lowVolume ? '#90A4AE' : dropOffs[i] > 50 ? '#D32F2F' : '#bdbdbd',
                    lineHeight: 1,
                    py: '2px',
                  }}
                >
                  ▼ -{dropOffs[i]}%
                </Typography>
              )}
            </Box>
          ))}
        </Box>

        {/* Benchmark */}
        {hasData && searchSessions > 0 && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', mt: 1, pt: 0.75, borderTop: '1px solid', borderColor: 'divider', fontSize: 11 }}
          >
            Busqueda → Reserva: {conversionPct.toFixed(1)}%
            {!lowVolume && <> · Promedio Lervi: {PLATFORM_BENCHMARK_PCT}%</>}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
