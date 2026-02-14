import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
} from '@mui/material';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import type { FunnelStep } from '../../interfaces/types';

const STEP_LABELS: Record<string, string> = {
  page_view: 'Visitas',
  search_dates: 'Busqueda de fechas',
  start_booking: 'Inicio de reserva',
  guest_lookup_started: 'Registro huesped',
  booking_confirmed: 'Reserva confirmada',
};

const BAR_COLORS = ['#1976D2', '#2196F3', '#42A5F5', '#64B5F6', '#2E7D32'];

interface FunnelChartProps {
  funnel: FunnelStep[];
}

export default function FunnelChart({ funnel }: FunnelChartProps) {
  const chartData = funnel.map((item) => ({
    ...item,
    label: STEP_LABELS[item.step] ?? item.step,
  }));

  const dropOffs: { from: string; to: string; pct: number }[] = [];
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

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Embudo de conversion
        </Typography>

        <ResponsiveContainer width="100%" height={280}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 8, right: 40, left: 10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 12 }} tickLine={false} />
            <YAxis
              type="category"
              dataKey="label"
              tick={{ fontSize: 12 }}
              tickLine={false}
              width={140}
            />
            <Tooltip
              formatter={(value: number) => [value, 'Sesiones']}
              labelFormatter={(label: string) => label}
            />
            <Bar dataKey="sessions" radius={[0, 4, 4, 0]} maxBarSize={32}>
              {chartData.map((_entry, index) => (
                <Cell key={index} fill={BAR_COLORS[index % BAR_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {dropOffs.length > 0 && (
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
