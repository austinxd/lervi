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
        <Grid item xs={6} md={3} key={kpi.label}>
          <Card sx={{ minHeight: { xs: 90, sm: 120 }, borderLeft: `4px solid ${kpi.color}` }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', px: { xs: 1.5, sm: 2 } }}>
              <Typography sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '3rem' }, fontWeight: 800, color: kpi.color, lineHeight: 1.2 }}>
                {kpi.value}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>
                {kpi.label}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
