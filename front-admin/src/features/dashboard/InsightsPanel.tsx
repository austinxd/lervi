import {
  Card,
  CardContent,
  Typography,
  Box,
  Divider,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

const STEP_LABELS: Record<string, string> = {
  page_view: 'Visitas',
  search_dates: 'Busqueda de fechas',
  start_booking: 'Inicio de reserva',
  guest_lookup_started: 'Registro huesped',
  booking_confirmed: 'Reserva confirmada',
};

interface InsightsPanelProps {
  mainAbandonmentStep: string | null;
  mainAbandonmentDropPct: number;
  currentConversionRate: number;
  prevConversionRate: number;
  wowChange: number;
}

export default function InsightsPanel({
  mainAbandonmentStep,
  mainAbandonmentDropPct,
  currentConversionRate,
  wowChange,
}: InsightsPanelProps) {
  const isPositive = wowChange >= 0;

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Insights
        </Typography>

        {/* Abandonment insight */}
        {mainAbandonmentStep ? (
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 2 }}>
            <WarningAmberIcon sx={{ color: '#ED6C02', mt: 0.3 }} />
            <Box>
              <Typography variant="body2" color="text.secondary">
                Principal punto de abandono
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {STEP_LABELS[mainAbandonmentStep] ?? mainAbandonmentStep}
              </Typography>
              <Typography variant="body2" color="error.main">
                {mainAbandonmentDropPct}% de caida
              </Typography>
            </Box>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <WarningAmberIcon sx={{ color: '#BDBDBD' }} />
            <Typography variant="body2" color="text.secondary">
              Sin datos de abandono en este periodo
            </Typography>
          </Box>
        )}

        <Divider sx={{ my: 1.5 }} />

        {/* Conversion rate insight */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
          {isPositive ? (
            <TrendingUpIcon sx={{ color: '#2E7D32', mt: 0.3 }} />
          ) : (
            <TrendingDownIcon sx={{ color: '#D32F2F', mt: 0.3 }} />
          )}
          <Box>
            <Typography variant="body2" color="text.secondary">
              Tasa de conversion
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
              <Typography variant="h5" fontWeight={700}>
                {currentConversionRate}%
              </Typography>
              <Typography
                variant="body2"
                fontWeight={600}
                sx={{ color: isPositive ? '#2E7D32' : '#D32F2F' }}
              >
                {isPositive ? '+' : ''}{wowChange}% vs periodo anterior
              </Typography>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
