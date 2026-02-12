import { Box, Tab, Tabs, Typography } from '@mui/material';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import SeasonList from './SeasonList';
import DayOfWeekPricing from './DayOfWeekPricing';
import RatePlanList from './RatePlanList';
import PromotionList from './PromotionList';
import PriceSimulator from './PriceSimulator';

const TABS = [
  { label: 'Temporadas', path: '' },
  { label: 'Día semana', path: 'day-of-week' },
  { label: 'Planes tarifa', path: 'rate-plans' },
  { label: 'Promociones', path: 'promotions' },
  { label: 'Simulador', path: 'simulator' },
];

export default function PricingLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const currentTab = TABS.findIndex((t) => {
    const path = `/pricing/${t.path}`;
    return t.path === '' ? location.pathname === '/pricing' : location.pathname.startsWith(path);
  });

  return (
    <Box>
      <Typography variant="h5" mb={2}>Pricing</Typography>
      <Tabs value={Math.max(currentTab, 0)} onChange={(_, v) => navigate(`/pricing/${TABS[v].path}`)} sx={{ mb: 3 }}>
        {TABS.map((t) => <Tab key={t.path} label={t.label} />)}
      </Tabs>
      <Routes>
        <Route index element={<SeasonList />} />
        <Route path="day-of-week" element={<DayOfWeekPricing />} />
        <Route path="rate-plans" element={<RatePlanList />} />
        <Route path="promotions" element={<PromotionList />} />
        <Route path="simulator" element={<PriceSimulator />} />
      </Routes>
    </Box>
  );
}
