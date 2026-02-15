import {
  Card,
  CardContent,
  Typography,
} from '@mui/material';
import type { FunnelStep } from '../../interfaces/types';

const STEP_LABELS: Record<string, string> = {
  page_view: 'Visitas',
  search_dates: 'Busqueda de fechas',
  start_booking: 'Inicio de reserva',
  booking_confirmed: 'Reserva confirmada',
};

const BAR_COLORS = ['#1976D2', '#42A5F5', '#64B5F6', '#2E7D32'];

const STEP_HEIGHT = 48;
const DROP_GAP = 28;
const SVG_WIDTH = 600;
const MAX_BAR_WIDTH = 520;
const CENTER_X = SVG_WIDTH / 2;
const MIN_WIDTH_PCT = 5;
const TEXT_FIT_THRESHOLD = 180;

interface FunnelChartProps {
  funnel: FunnelStep[];
  placeholder?: boolean;
}

export default function FunnelChart({ funnel, placeholder = false }: FunnelChartProps) {
  const maxSessions = funnel[0]?.sessions || 1;
  const hasData = maxSessions > 0 && funnel.some((s) => s.sessions > 0);

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

  const totalHeight = steps.reduce((acc, _, i) => {
    if (i < steps.length - 1) return acc + STEP_HEIGHT + DROP_GAP;
    return acc + STEP_HEIGHT;
  }, 0);

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Intencion del usuario
        </Typography>

        {placeholder && (
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

            return (
              <g key={step.step}>
                {/* Bar */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={STEP_HEIGHT}
                  rx={6}
                  fill={step.color}
                  opacity={noData ? 0.15 : 1}
                />

                {/* Label + count */}
                {textInside ? (
                  <text
                    x={x + 14}
                    y={y + STEP_HEIGHT / 2 + 5}
                    textAnchor="start"
                    fontSize={13}
                    fontWeight={600}
                    fill={noData ? '#9E9E9E' : '#fff'}
                  >
                    {displayText}
                  </text>
                ) : (
                  <text
                    x={x + barWidth + 10}
                    y={y + STEP_HEIGHT / 2 + 5}
                    textAnchor="start"
                    fontSize={12}
                    fontWeight={600}
                    fill={noData ? '#9E9E9E' : '#616161'}
                  >
                    {displayText}
                  </text>
                )}

                {/* Drop-off indicator between steps */}
                {i < steps.length - 1 && hasData && dropOffs[i] > 0 && (
                  <text
                    x={CENTER_X}
                    y={y + STEP_HEIGHT + DROP_GAP / 2 + 5}
                    textAnchor="middle"
                    fontSize={12}
                    fontWeight={600}
                    fill={dropOffs[i] > 50 ? '#D32F2F' : '#9E9E9E'}
                  >
                    ▼ -{dropOffs[i]}%
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </CardContent>
    </Card>
  );
}
