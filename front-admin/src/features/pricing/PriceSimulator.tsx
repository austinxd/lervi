import { useState } from 'react';
import {
  Alert, Box, Button, Card, CardContent, Grid, MenuItem,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, Typography,
} from '@mui/material';
import CalculateIcon from '@mui/icons-material/Calculate';
import { useAppSelector } from '../../store/hooks';
import { useCalculatePriceMutation } from '../../services/pricingService';
import { useGetRoomTypesQuery } from '../../services/roomTypeService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import type { PriceCalculationResponse } from '../../interfaces/types';

export default function PriceSimulator() {
  const propertyId = useAppSelector((s) => s.auth.activePropertyId);
  const { data: roomTypesData } = useGetRoomTypesQuery({ property: propertyId ?? undefined });
  const [calculate, { isLoading }] = useCalculatePriceMutation();

  const [roomTypeId, setRoomTypeId] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [promotionCode, setPromotionCode] = useState('');
  const [result, setResult] = useState<PriceCalculationResponse | null>(null);
  const [error, setError] = useState('');

  const handleCalculate = async () => {
    if (!propertyId || !roomTypeId || !checkIn || !checkOut) return;
    setError('');
    try {
      const res = await calculate({
        property_id: propertyId,
        room_type_id: roomTypeId,
        check_in: checkIn,
        check_out: checkOut,
        ...(promotionCode && { promotion_code: promotionCode }),
      }).unwrap();
      setResult(res);
    } catch (err: unknown) {
      const e = err as { data?: { detail?: string } };
      setError(e?.data?.detail || 'Error al calcular precio');
    }
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={5}>
        <Card>
          <CardContent>
            <Typography variant="h6" mb={2}>Simular precio</Typography>
            <TextField
              label="Tipo de habitación"
              select
              fullWidth
              value={roomTypeId}
              onChange={(e) => setRoomTypeId(e.target.value)}
              sx={{ mb: 2 }}
            >
              {(roomTypesData?.results ?? []).map((rt) => (
                <MenuItem key={rt.id} value={rt.id}>{rt.name} — {formatCurrency(rt.base_price)}</MenuItem>
              ))}
            </TextField>
            <TextField label="Check-in" type="date" fullWidth value={checkIn} onChange={(e) => setCheckIn(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ mb: 2 }} />
            <TextField label="Check-out" type="date" fullWidth value={checkOut} onChange={(e) => setCheckOut(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ mb: 2 }} />
            <TextField label="Código promoción (opcional)" fullWidth value={promotionCode} onChange={(e) => setPromotionCode(e.target.value)} sx={{ mb: 2 }} />
            <Button variant="contained" fullWidth startIcon={<CalculateIcon />} onClick={handleCalculate} disabled={isLoading || !roomTypeId || !checkIn || !checkOut}>
              Calcular
            </Button>
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={7}>
        {result && (
          <Card>
            <CardContent>
              <Typography variant="h6" mb={2}>Resultado</Typography>
              <Box display="flex" gap={4} mb={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Noches</Typography>
                  <Typography variant="h5">{result.nights}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Total base</Typography>
                  <Typography variant="h5">{formatCurrency(result.base_total)}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Total final</Typography>
                  <Typography variant="h5" color="primary" fontWeight={700}>{formatCurrency(result.final_total)}</Typography>
                </Box>
              </Box>

              {result.modifiers_applied?.length > 0 && (
                <Box mb={2}>
                  <Typography variant="subtitle2" mb={1}>Modificadores aplicados</Typography>
                  {result.modifiers_applied.map((m, i) => (
                    <Typography key={i} variant="body2">{m.name}: {m.amount}</Typography>
                  ))}
                </Box>
              )}

              {result.daily_breakdown?.length > 0 && (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Fecha</TableCell>
                        <TableCell align="right">Precio</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {result.daily_breakdown.map((d) => (
                        <TableRow key={d.date}>
                          <TableCell>{formatDate(d.date)}</TableCell>
                          <TableCell align="right">{formatCurrency(d.price)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        )}
      </Grid>
    </Grid>
  );
}
