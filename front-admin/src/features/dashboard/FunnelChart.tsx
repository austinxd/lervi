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

const STEP_HEIGHT = 34;
const DROP_GAP = 20;
const SVG_WIDTH = 500;
const MAX_BAR_WIDTH = 420;
const CENTER_X = SVG_WIDTH / 2;
const MIN_WIDTH_PCT = 5;
const TEXT_FIT_THRESHOLD = 160;
const LOW_VOLUME_THRESHOLD = 30;

// Benchmark: typical search-to-booking conversion for the platform
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

  // Conversion: search_dates → booking_confirmed
  const searchSessions = funnel.find((s) => s.step === 'search_dates')?.sessions ?? 0;
  const confirmedSessions = funnel.find((s) => s.step === 'booking_confirmed')?.sessions ?? 0;
  const conversionPct = searchSessions > 0
    ? (confirmedSessions / searchSessions * 100)
    : 0;

  const totalHeight = steps.reduce((acc, _, i) => {
    if (i < steps.length - 1) return acc + STEP_HEIGHT + DROP_GAP;
    return acc + STEP_HEIGHT;
  }, 0);

  return (
    <Card>
      <CardContent sx={{ pb: '12px !important' }}>
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 0.25 }}>
          Intencion del usuario
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
          Embudo basado en sesiones web{periodLabel ? ` — ${periodLabel}` : ''}
          {lowVolume && hasData && ' · Datos iniciales'}
        </Typography>

        {placeholder && !hasData && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Recolectando datos...
          </Typography>
        )}

        <svg
          width="100%"
          viewBox={`0 0 ${SVG_WIDTH} ${totalHeight}`}
          preserveAspectRatio="xMidYMid meet"
        >
          {steps.map((step, i) => {
            const y = i * (STEP_HEIGHT + DROP_GAP);
            const barWidth = (step.widthPct / 100) * MAX_BAR_WIDTH;
            const x = CENTER_X - barWidth / 2;
            const noData = !hasData;

            const displayText = hasData
              ? `${step.label} (${step.sessions})`
              : step.label;

            const textInside = barWidth >= TEXT_FIT_THRESHOLD;

            // Drop-off color: neutral when low volume, red only with enough data
            const dropColor = (pct: number) => {
              if (lowVolume) return '#90A4AE'; // blue-grey neutral
              return pct > 50 ? '#D32F2F' : '#9E9E9E';
            };

            return (
              <g key={step.step}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={STEP_HEIGHT}
                  rx={5}
                  fill={step.color}
                  opacity={noData ? 0.12 : lowVolume ? 0.7 : 1}
                />

                {textInside ? (
                  <text
                    x={x + 12}
                    y={y + STEP_HEIGHT / 2 + 4.5}
                    textAnchor="start"
                    fontSize={12}
                    fontWeight={600}
                    fill={noData ? '#9E9E9E' : '#fff'}
                  >
                    {displayText}
                  </text>
                ) : (
                  <text
                    x={x + barWidth + 8}
                    y={y + STEP_HEIGHT / 2 + 4.5}
                    textAnchor="start"
                    fontSize={11}
                    fontWeight={600}
                    fill={noData ? '#9E9E9E' : '#616161'}
                  >
                    {displayText}
                  </text>
                )}

                {i < steps.length - 1 && hasData && dropOffs[i] > 0 && (
                  <text
                    x={CENTER_X}
                    y={y + STEP_HEIGHT + DROP_GAP / 2 + 4}
                    textAnchor="middle"
                    fontSize={11}
                    fontWeight={500}
                    fill={dropColor(dropOffs[i])}
                  >
                    ▼ -{dropOffs[i]}%
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Benchmark */}
        {hasData && searchSessions > 0 && (
          <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography variant="caption" color="text.secondary">
              Busqueda → Reserva: {conversionPct.toFixed(1)}%
              {!lowVolume && (
                <> · Promedio Lervi: {PLATFORM_BENCHMARK_PCT}%</>
              )}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
