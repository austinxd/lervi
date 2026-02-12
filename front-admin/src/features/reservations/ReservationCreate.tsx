import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import { useCreateReservationMutation } from '../../services/reservationService';
import { useGetRoomTypesQuery } from '../../services/roomTypeService';
import { useAppSelector } from '../../store/hooks';
import { ORIGIN_TYPE_LABELS } from '../../utils/statusLabels';
import type { ReservationCreate as ReservationCreatePayload } from '../../interfaces/types';

interface FormValues {
  guest: string;
  room_type: string;
  check_in_date: string;
  check_out_date: string;
  adults: number;
  children: number;
  total_amount: string;
  origin_type: string;
  special_requests: string;
}

export default function ReservationCreate() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const property = useAppSelector((s) => s.auth.activePropertyId);

  const [createReservation, { isLoading }] = useCreateReservationMutation();

  const { data: roomTypesData } = useGetRoomTypesQuery(
    { property: property ?? undefined },
    { skip: !property },
  );

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      guest: '',
      room_type: '',
      check_in_date: '',
      check_out_date: '',
      adults: 1,
      children: 0,
      total_amount: '',
      origin_type: 'website',
      special_requests: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    if (!property) {
      enqueueSnackbar('Debe seleccionar una propiedad', { variant: 'warning' });
      return;
    }

    const payload: ReservationCreatePayload = {
      guest: values.guest,
      property,
      room_type: values.room_type,
      check_in_date: values.check_in_date,
      check_out_date: values.check_out_date,
      adults: values.adults,
      children: values.children,
      total_amount: values.total_amount,
      origin_type: values.origin_type as ReservationCreatePayload['origin_type'],
      special_requests: values.special_requests || undefined,
    };

    try {
      const result = await createReservation(payload).unwrap();
      enqueueSnackbar('Reservacion creada correctamente', { variant: 'success' });
      navigate(`/reservations/${result.id}`);
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'data' in err
          ? JSON.stringify((err as { data: unknown }).data)
          : 'Ocurrio un error al crear la reservacion';
      enqueueSnackbar(message, { variant: 'error' });
    }
  };

  const roomTypes = roomTypesData?.results ?? [];

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
        Nueva Reservacion
      </Typography>
      <Card>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={2}>
              {/* Guest ID */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="ID del huesped"
                  fullWidth
                  {...register('guest', { required: 'El huesped es requerido' })}
                  error={!!errors.guest}
                  helperText={errors.guest?.message}
                />
              </Grid>

              {/* Room Type */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors.room_type}>
                  <InputLabel>Tipo de habitacion</InputLabel>
                  <Controller
                    name="room_type"
                    control={control}
                    rules={{ required: 'El tipo de habitacion es requerido' }}
                    render={({ field }) => (
                      <Select {...field} label="Tipo de habitacion">
                        {roomTypes.map((rt) => (
                          <MenuItem key={rt.id} value={rt.id}>
                            {rt.name}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  />
                  {errors.room_type && (
                    <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5 }}>
                      {errors.room_type.message}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              {/* Check-in date */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Fecha de check-in"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  {...register('check_in_date', { required: 'La fecha de check-in es requerida' })}
                  error={!!errors.check_in_date}
                  helperText={errors.check_in_date?.message}
                />
              </Grid>

              {/* Check-out date */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Fecha de check-out"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  {...register('check_out_date', { required: 'La fecha de check-out es requerida' })}
                  error={!!errors.check_out_date}
                  helperText={errors.check_out_date?.message}
                />
              </Grid>

              {/* Adults */}
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  label="Adultos"
                  type="number"
                  fullWidth
                  inputProps={{ min: 1 }}
                  {...register('adults', {
                    required: 'Requerido',
                    valueAsNumber: true,
                    min: { value: 1, message: 'Minimo 1 adulto' },
                  })}
                  error={!!errors.adults}
                  helperText={errors.adults?.message}
                />
              </Grid>

              {/* Children */}
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  label="Ninos"
                  type="number"
                  fullWidth
                  inputProps={{ min: 0 }}
                  {...register('children', {
                    valueAsNumber: true,
                    min: { value: 0, message: 'Minimo 0' },
                  })}
                  error={!!errors.children}
                  helperText={errors.children?.message}
                />
              </Grid>

              {/* Total amount */}
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  label="Monto total"
                  type="number"
                  fullWidth
                  inputProps={{ step: '0.01', min: '0' }}
                  {...register('total_amount', {
                    required: 'El monto es requerido',
                    min: { value: 0, message: 'Debe ser mayor o igual a 0' },
                  })}
                  error={!!errors.total_amount}
                  helperText={errors.total_amount?.message}
                />
              </Grid>

              {/* Origin type */}
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Origen</InputLabel>
                  <Controller
                    name="origin_type"
                    control={control}
                    render={({ field }) => (
                      <Select {...field} label="Origen">
                        {Object.entries(ORIGIN_TYPE_LABELS).map(([key, label]) => (
                          <MenuItem key={key} value={key}>
                            {label}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  />
                </FormControl>
              </Grid>

              {/* Special requests */}
              <Grid item xs={12}>
                <TextField
                  label="Solicitudes especiales"
                  multiline
                  rows={3}
                  fullWidth
                  {...register('special_requests')}
                />
              </Grid>

              {/* Buttons */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 1 }}>
                  <Button onClick={() => navigate('/reservations')}>Cancelar</Button>
                  <Button type="submit" variant="contained" disabled={isLoading}>
                    Crear Reservacion
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}
