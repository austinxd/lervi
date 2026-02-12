import { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  ButtonGroup,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import dayjs from 'dayjs';
import { useAppSelector } from '../../store/hooks';
import { useGetRevenueQuery } from '../../services/dashboardService';
import { formatCurrency } from '../../utils/formatters';
import { PAYMENT_METHOD_LABELS } from '../../utils/statusLabels';

type Period = 'today' | 'week' | 'month';

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: 'today', label: 'Hoy' },
  { value: 'week', label: 'Semana' },
  { value: 'month', label: 'Mes' },
];

export default function RevenueSection() {
  const user = useAppSelector((s) => s.auth.user);
  const activePropertyId = useAppSelector((s) => s.auth.activePropertyId);
  const [period, setPeriod] = useState<Period>('month');

  const isOwner = user?.role === 'owner' || user?.role === 'super_admin';

  const { data, isLoading, isError } = useGetRevenueQuery(
    { property: activePropertyId ?? undefined, period },
    { skip: !isOwner },
  );

  if (!isOwner) return null;

  if (isLoading) {
    return (
      <Card>
        <CardContent sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </CardContent>
      </Card>
    );
  }

  if (isError || !data) {
    return (
      <Card>
        <CardContent>
          <Alert severity="error">Error al cargar datos de ingresos</Alert>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.daily.map((item) => ({
    ...item,
    label: dayjs(item.date).format('DD/MM'),
    amount: parseFloat(item.revenue),
  }));

  const methodEntries = Object.entries(data.revenue.by_method);

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h6">Ingresos</Typography>
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

        <Box sx={{ display: 'flex', gap: 4, mb: 3, flexWrap: 'wrap' }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Total del periodo
            </Typography>
            <Typography variant="h4" fontWeight={700} color="primary">
              {formatCurrency(data.revenue.total)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {data.revenue.payment_count} pago{data.revenue.payment_count !== 1 ? 's' : ''}
            </Typography>
          </Box>

          {methodEntries.length > 0 && (
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'flex-start' }}>
              {methodEntries.map(([method, info]) => (
                <Box key={method}>
                  <Typography variant="body2" color="text.secondary">
                    {PAYMENT_METHOD_LABELS[method] ?? method}
                  </Typography>
                  <Typography variant="h6" fontWeight={600}>
                    {formatCurrency(info.total)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {info.count} pago{info.count !== 1 ? 's' : ''}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </Box>

        {chartData.length > 0 && (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: '#E0E0E0' }}
              />
              <YAxis
                tickFormatter={(v: number) => formatCurrency(v)}
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: '#E0E0E0' }}
                width={80}
              />
              <Tooltip
                formatter={(value: number) => [formatCurrency(value), 'Ingreso']}
                labelFormatter={(label: string) => `Fecha: ${label}`}
              />
              <Bar dataKey="amount" fill="#1976D2" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
