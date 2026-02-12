import { Card, CardContent, Typography } from '@mui/material';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import dayjs from 'dayjs';

interface OccupancyChartProps {
  data: { date: string; occupancy_rate: number }[];
}

export default function OccupancyChart({ data }: OccupancyChartProps) {
  const chartData = data.map((item) => ({
    ...item,
    label: dayjs(item.date).format('DD/MM'),
  }));

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Ocupacion (proximos 7 dias)
        </Typography>

        {chartData.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
            Sin datos de ocupacion disponibles
          </Typography>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: '#E0E0E0' }}
              />
              <YAxis
                domain={[0, 100]}
                tickFormatter={(v: number) => `${v}%`}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: '#E0E0E0' }}
                width={48}
              />
              <Tooltip
                formatter={(value: number) => [`${value.toFixed(1)}%`, 'Ocupacion']}
                labelFormatter={(label: string) => `Fecha: ${label}`}
              />
              <Line
                type="monotone"
                dataKey="occupancy_rate"
                stroke="#1976D2"
                strokeWidth={2}
                dot={{ r: 4, fill: '#1976D2' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
