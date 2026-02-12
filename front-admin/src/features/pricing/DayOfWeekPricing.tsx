import {
  Box, Card, CardContent, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TextField, Button,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useAppSelector } from '../../store/hooks';
import { useGetDayOfWeekPricingQuery, useUpdateDayOfWeekPricingMutation, useCreateDayOfWeekPricingMutation } from '../../services/pricingService';
import { useState } from 'react';

const DAY_NAMES = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export default function DayOfWeekPricing() {
  const { enqueueSnackbar } = useSnackbar();
  const propertyId = useAppSelector((s) => s.auth.activePropertyId);
  const { data } = useGetDayOfWeekPricingQuery({ property: propertyId ?? undefined });
  const [updatePricing] = useUpdateDayOfWeekPricingMutation();
  const [createPricing] = useCreateDayOfWeekPricingMutation();
  const [values, setValues] = useState<Record<number, string>>({});

  const existing = data?.results ?? [];

  const getValue = (day: number): string => {
    if (values[day] !== undefined) return values[day];
    const item = existing.find((e) => e.day_of_week === day);
    return item?.price_modifier ?? '1.00';
  };

  const handleSave = async (day: number) => {
    const modifier = values[day];
    if (!modifier) return;
    const item = existing.find((e) => e.day_of_week === day);
    try {
      if (item) {
        await updatePricing({ id: item.id, data: { price_modifier: modifier } }).unwrap();
      } else {
        await createPricing({ property: propertyId!, day_of_week: day, price_modifier: modifier }).unwrap();
      }
      enqueueSnackbar('Guardado', { variant: 'success' });
    } catch {
      enqueueSnackbar('Error', { variant: 'error' });
    }
  };

  return (
    <Card>
      <CardContent>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Día</TableCell>
                <TableCell>Modificador precio</TableCell>
                <TableCell width={100}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {DAY_NAMES.map((name, idx) => (
                <TableRow key={idx}>
                  <TableCell>{name}</TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      type="number"
                      value={getValue(idx)}
                      onChange={(e) => setValues({ ...values, [idx]: e.target.value })}
                      inputProps={{ step: 0.01, min: 0 }}
                      sx={{ width: 120 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Button size="small" onClick={() => handleSave(idx)} disabled={values[idx] === undefined}>
                      Guardar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}
