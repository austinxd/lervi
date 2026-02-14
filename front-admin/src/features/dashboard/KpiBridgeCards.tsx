import { Grid } from '@mui/material';
import BookOnlineIcon from '@mui/icons-material/BookOnline';
import LanguageIcon from '@mui/icons-material/Language';
import PercentIcon from '@mui/icons-material/Percent';
import SummaryCard from './SummaryCard';

interface KpiBridgeCardsProps {
  totalReservations: number;
  webReservations: number;
  pctDirect: number;
}

export default function KpiBridgeCards({
  totalReservations,
  webReservations,
  pctDirect,
}: KpiBridgeCardsProps) {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={4}>
        <SummaryCard
          title="Reservas totales"
          value={totalReservations}
          icon={<BookOnlineIcon />}
          color="#1976D2"
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <SummaryCard
          title="Reservas web directas"
          value={webReservations}
          icon={<LanguageIcon />}
          color="#2E7D32"
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <SummaryCard
          title="% Directo"
          value={`${pctDirect}%`}
          icon={<PercentIcon />}
          color="#ED6C02"
        />
      </Grid>
    </Grid>
  );
}
