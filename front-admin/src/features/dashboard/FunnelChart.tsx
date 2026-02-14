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
  booking_confirmed: 'Reserva confirmada',
};

const BAR_COLORS = ['#1976D2', '#42A5F5', '#64B5F6', '#2E7D32'];

const STEP_HEIGHT = 48;
const STEP_GAP = 6;
const SVG_WIDTH = 600;
const MAX_BAR_WIDTH = 520;
const CENTER_X = SVG_WIDTH / 2;
const MIN_WIDTH_PCT = 8;

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
          Intencion del usuario
        </Typography>

        <svg
          width="100%"
          viewBox={`0 0 ${SVG_WIDTH} ${totalHeight}`}
          preserveAspectRatio="xMidYMid meet"
        >
          {steps.map((step, i) => {
            const y = i * (STEP_HEIGHT + STEP_GAP);
            const barWidth = (step.widthPct / 100) * MAX_BAR_WIDTH;
            const x = CENTER_X - barWidth / 2;

            return (
              <g key={step.step}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={STEP_HEIGHT}
                  rx={6}
                  fill={step.color}
                  opacity={placeholder ? 0.2 : 1}
                />
                <text
                  x={x + 14}
                  y={y + STEP_HEIGHT / 2 + 5}
                  textAnchor="start"
                  fontSize={13}
                  fontWeight={600}
                  fill={placeholder ? '#9E9E9E' : '#fff'}
                >
                  {step.label}
                </text>
                {!placeholder && (
                  <text
                    x={x + barWidth - 14}
                    y={y + STEP_HEIGHT / 2 + 5}
                    textAnchor="end"
                    fontSize={14}
                    fontWeight={700}
                    fill="#fff"
                  >
                    {step.sessions}
                  </text>
                )}
                {/* Drop-off annotation between steps */}
                {!placeholder && i < steps.length - 1 && dropOffs[i] && dropOffs[i].pct > 0 && (
                  <text
                    x={CENTER_X + MAX_BAR_WIDTH / 2 + 8}
                    y={y + STEP_HEIGHT + STEP_GAP / 2 + 4}
                    textAnchor="start"
                    fontSize={11}
                    fill={dropOffs[i].pct > 50 ? '#D32F2F' : '#9E9E9E'}
                  >
                    -{dropOffs[i].pct}%
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {!placeholder && dropOffs.length > 0 && (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1.5 }}>
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
