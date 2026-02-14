import { Grid, Card, CardContent, Typography } from '@mui/material';

interface KpiHeroCardsProps {
  occupancyRate: number;
  revenueToday: string;
  inHouse: number;
  checkInsToday: number;
}

interface KpiItem {
  label: string;
  value: string | number;
  color: string;
}

export default function KpiHeroCards({ occupancyRate, revenueToday, inHouse, checkInsToday }: KpiHeroCardsProps) {
  const kpis: KpiItem[] = [
    { label: 'Ocupación hoy', value: `${occupancyRate}%`, color: '#1976D2' },
    { label: 'Ingresos hoy', value: revenueToday, color: '#9C27B0' },
    { label: 'In-house', value: inHouse, color: '#2E7D32' },
    { label: 'Llegadas 24h', value: checkInsToday, color: '#ED6C02' },
  ];

  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {kpis.map((kpi) => (
        <Grid item xs={12} sm={6} md={3} key={kpi.label}>
          <Card sx={{ minHeight: 120, borderLeft: `4px solid ${kpi.color}` }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
              <Typography variant="h3" fontWeight={800} color={kpi.color}>
                {kpi.value}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {kpi.label}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
