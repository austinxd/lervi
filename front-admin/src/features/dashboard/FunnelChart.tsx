import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
} from '@mui/material';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import type { FunnelStep } from '../../interfaces/types';

const STEP_LABELS: Record<string, string> = {
  page_view: 'Visitas',
  search_dates: 'Busqueda de fechas',
  start_booking: 'Inicio de reserva',
  guest_lookup_started: 'Registro huesped',
  booking_confirmed: 'Reserva confirmada',
};

const BAR_COLORS = ['#1976D2', '#2196F3', '#42A5F5', '#64B5F6', '#2E7D32'];

const STEP_HEIGHT = 44;
const STEP_GAP = 4;
const LABEL_WIDTH = 140;
const VALUE_WIDTH = 60;
const MIN_WIDTH_PCT = 15;

interface FunnelChartProps {
  funnel: FunnelStep[];
  placeholder?: boolean;
}

export default function FunnelChart({ funnel, placeholder = false }: FunnelChartProps) {
  const maxSessions = funnel[0]?.sessions || 1;

  const steps = funnel.map((item, index) => {
    const label = STEP_LABELS[item.step] ?? item.step;
    const widthPct = maxSessions > 0
      ? Math.max((item.sessions / maxSessions) * 100, MIN_WIDTH_PCT)
      : MIN_WIDTH_PCT;
    return { ...item, label, widthPct, color: BAR_COLORS[index % BAR_COLORS.length] };
  });

  const dropOffs: { from: string; to: string; pct: number }[] = [];
  if (!placeholder) {
    for (let i = 0; i < funnel.length - 1; i++) {
      const current = funnel[i].sessions;
      const next = funnel[i + 1].sessions;
      const drop = current > 0 ? Math.round((current - next) / current * 100) : 0;
      dropOffs.push({
        from: STEP_LABELS[funnel[i].step] ?? funnel[i].step,
        to: STEP_LABELS[funnel[i + 1].step] ?? funnel[i + 1].step,
        pct: drop,
      });
    }
  }

  const totalHeight = steps.length * STEP_HEIGHT + (steps.length - 1) * STEP_GAP;

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Embudo de conversion
        </Typography>

        <Box sx={{ position: 'relative' }}>
          <svg
            width="100%"
            viewBox={`0 0 600 ${totalHeight}`}
            preserveAspectRatio="xMidYMid meet"
          >
            {steps.map((step, i) => {
              const y = i * (STEP_HEIGHT + STEP_GAP);
              const prevWidthPct = i > 0 ? steps[i - 1].widthPct : step.widthPct;
              const barMaxWidth = 600 - LABEL_WIDTH - VALUE_WIDTH;

              const topLeft = LABEL_WIDTH;
              const topRight = LABEL_WIDTH + (prevWidthPct / 100) * barMaxWidth;
              const bottomLeft = LABEL_WIDTH;
              const bottomRight = LABEL_WIDTH + (step.widthPct / 100) * barMaxWidth;

              const points = [
                `${topLeft},${y}`,
                `${topRight},${y}`,
                `${bottomRight},${y + STEP_HEIGHT}`,
                `${bottomLeft},${y + STEP_HEIGHT}`,
              ].join(' ');

              return (
                <g key={step.step}>
                  <polygon
                    points={points}
                    fill={step.color}
                    opacity={placeholder ? 0.3 : 1}
                    rx={4}
                  />
                  <text
                    x={LABEL_WIDTH - 8}
                    y={y + STEP_HEIGHT / 2 + 4}
                    textAnchor="end"
                    fontSize={12}
                    fill="#616161"
                  >
                    {step.label}
                  </text>
                  {!placeholder && (
                    <text
                      x={Math.max(topRight, bottomRight) + 8}
                      y={y + STEP_HEIGHT / 2 + 4}
                      textAnchor="start"
                      fontSize={13}
                      fontWeight={600}
                      fill="#212121"
                    >
                      {step.sessions}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {placeholder && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="body1" fontWeight={600} color="text.secondary">
                Datos insuficientes
              </Typography>
            </Box>
          )}
        </Box>

        {!placeholder && dropOffs.length > 0 && (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
            {dropOffs.map((d, i) => (
              <Chip
                key={i}
                icon={<ArrowDownwardIcon sx={{ fontSize: 14 }} />}
                label={`${d.from} → ${d.to}: -${d.pct}%`}
                size="small"
                variant="outlined"
                color={d.pct > 50 ? 'error' : 'default'}
              />
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
