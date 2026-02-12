import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, Button, Card, CardContent, Checkbox, Chip,
  FormControl, InputLabel, ListItemText, MenuItem,
  OutlinedInput, Select, TextField, Typography,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import { useAppSelector } from '../../store/hooks';
import { useGetRoomQuery, useCreateRoomMutation, useUpdateRoomMutation } from '../../services/roomService';
import { useGetRoomTypesQuery } from '../../services/roomTypeService';

interface FormData {
  room_types: string[];
  number: string;
  floor: string;
}

export default function RoomForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const propertyId = useAppSelector((s) => s.auth.activePropertyId);
  const isEdit = !!id;

  const { data: room } = useGetRoomQuery(id!, { skip: !id });
  const { data: roomTypesData } = useGetRoomTypesQuery({ property: propertyId ?? undefined });
  const [create, { isLoading: creating }] = useCreateRoomMutation();
  const [update, { isLoading: updating }] = useUpdateRoomMutation();

  const { register, handleSubmit, reset, setValue } = useForm<FormData>();
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  const roomTypes = roomTypesData?.results ?? [];

  useEffect(() => {
    if (room) {
      reset({ room_types: room.room_types, number: room.number, floor: room.floor });
      setSelectedTypes(room.room_types);
    }
  }, [room, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      const payload = { ...data, room_types: selectedTypes };
      if (isEdit) {
        await update({ id: id!, data: payload }).unwrap();
        enqueueSnackbar('Habitación actualizada', { variant: 'success' });
      } else {
        await create({ ...payload, property: propertyId! } as never).unwrap();
        enqueueSnackbar('Habitación creada', { variant: 'success' });
      }
      navigate('/rooms');
    } catch {
      enqueueSnackbar('Error al guardar', { variant: 'error' });
    }
  };

  const handleTypeChange = (value: string | string[]) => {
    const val = typeof value === 'string' ? value.split(',') : value;
    setSelectedTypes(val);
    setValue('room_types', val);
  };

  return (
    <Box maxWidth={600}>
      <Typography variant="h5" mb={2}>{isEdit ? 'Editar Habitación' : 'Nueva Habitación'}</Typography>
      <Card>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
              {...register('number', { required: true })}
              label="Número"
              fullWidth
              required
              sx={{ mb: 2 }}
            />
            <TextField
              {...register('floor')}
              label="Piso"
              fullWidth
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth required sx={{ mb: 3 }}>
              <InputLabel shrink>Tipos de habitación</InputLabel>
              <Select
                multiple
                value={selectedTypes}
                onChange={(e) => handleTypeChange(e.target.value)}
                input={<OutlinedInput notched label="Tipos de habitación" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((id) => {
                      const rt = roomTypes.find((r) => r.id === id);
                      return <Chip key={id} label={rt?.name ?? id} size="small" />;
                    })}
                  </Box>
                )}
              >
                {roomTypes.map((rt) => (
                  <MenuItem key={rt.id} value={rt.id}>
                    <Checkbox checked={selectedTypes.includes(rt.id)} />
                    <ListItemText primary={rt.name} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box display="flex" gap={1}>
              <Button type="submit" variant="contained" disabled={creating || updating}>
                {isEdit ? 'Guardar' : 'Crear'}
              </Button>
              <Button onClick={() => navigate('/rooms')}>Cancelar</Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}
