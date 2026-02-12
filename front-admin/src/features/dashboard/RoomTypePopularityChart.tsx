import { Card, CardContent, Typography, Box } from '@mui/material';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  LabelList,
} from 'recharts';
import type { RoomTypeOccupancy } from '../../interfaces/types';

interface RoomTypePopularityChartProps {
  data: RoomTypeOccupancy[];
}

export default function RoomTypePopularityChart({ data }: RoomTypePopularityChartProps) {
  if (data.length === 0) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Ocupacion por tipo de habitacion
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
            Sin datos disponibles
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map((item) => ({
    ...item,
    label: `${item.occupied}/${item.total_rooms} hab.`,
  }));

  const chartHeight = Math.max(200, data.length * 50 + 40);

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Ocupacion por tipo de habitacion
        </Typography>

        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 8, right: 60, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" horizontal={false} />
            <XAxis
              type="number"
              domain={[0, 100]}
              tickFormatter={(v: number) => `${v}%`}
              tick={{ fontSize: 12 }}
              axisLine={{ stroke: '#E0E0E0' }}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 12 }}
              width={120}
              axisLine={{ stroke: '#E0E0E0' }}
            />
            <Tooltip
              formatter={(value: number) => [`${value.toFixed(1)}%`, 'Ocupacion']}
            />
            <Bar dataKey="occupancy_rate" radius={[0, 4, 4, 0]} maxBarSize={28}>
              {chartData.map((entry) => (
                <Cell
                  key={entry.id}
                  fill={entry.occupancy_rate >= 80 ? '#E53935' : entry.occupancy_rate >= 50 ? '#1976D2' : '#4CAF50'}
                />
              ))}
              <LabelList dataKey="label" position="right" style={{ fontSize: 11, fill: '#666' }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Upcoming demand */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            Demanda prox. 7 dias
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {data.map((item) => (
              <Typography key={item.id} variant="body2">
                <strong>{item.name}:</strong> {item.upcoming_demand} reserva{item.upcoming_demand !== 1 ? 's' : ''}
              </Typography>
            ))}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
