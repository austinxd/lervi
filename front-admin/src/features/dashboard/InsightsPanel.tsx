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
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const STEP_LABELS: Record<string, string> = {
  page_view: 'Visitas',
  search_dates: 'Busqueda de fechas',
  start_booking: 'Inicio de reserva',
  guest_lookup_started: 'Registro huesped',
  booking_confirmed: 'Reserva confirmada',
};

export type DataTier = 'collecting' | 'initial' | 'reliable';

interface InsightsPanelProps {
  mainAbandonmentStep: string | null;
  mainAbandonmentDropPct: number;
  currentConversionRate: number;
  prevConversionRate: number;
  wowChange: number;
  tier: DataTier;
}

export default function InsightsPanel({
  mainAbandonmentStep,
  mainAbandonmentDropPct,
  currentConversionRate,
  wowChange,
  tier,
}: InsightsPanelProps) {
  const isPositive = wowChange >= 0;
  const isInitial = tier === 'initial';

  const AbandonIcon = isInitial ? InfoOutlinedIcon : WarningAmberIcon;
  const abandonIconColor = isInitial ? '#1976D2' : '#ED6C02';

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Insights
        </Typography>

        {/* Abandonment insight */}
        {mainAbandonmentStep ? (
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 2 }}>
            <AbandonIcon sx={{ color: abandonIconColor, mt: 0.3 }} />
            <Box>
              <Typography variant="body2" color="text.secondary">
                Principal punto de abandono
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {STEP_LABELS[mainAbandonmentStep] ?? mainAbandonmentStep}
              </Typography>
              <Typography variant="body2" color={isInitial ? 'text.secondary' : 'error.main'}>
                {isInitial ? 'Datos iniciales — ' : ''}{mainAbandonmentDropPct}% de caida
              </Typography>
            </Box>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <AbandonIcon sx={{ color: '#BDBDBD' }} />
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
              {tier === 'reliable' && (
                <Typography
                  variant="body2"
                  fontWeight={600}
                  sx={{ color: isPositive ? '#2E7D32' : '#D32F2F' }}
                >
                  {isPositive ? '+' : ''}{wowChange}% vs periodo anterior
                </Typography>
              )}
            </Box>
          </Box>
        </Box>

        {isInitial && (
          <>
            <Divider sx={{ my: 1.5 }} />
            <Typography variant="caption" color="text.secondary">
              Basado en datos iniciales. Los insights seran mas precisos con mayor volumen.
            </Typography>
          </>
        )}
      </CardContent>
    </Card>
  );
}
