import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, Button, Card, CardContent, Checkbox, FormControlLabel,
  Grid, ListItemText, MenuItem, TextField, Typography,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import { useGetUserQuery, useCreateUserMutation, useUpdateUserMutation } from '../../services/userService';
import { useGetPropertiesQuery } from '../../services/organizationService';
import { getRoleLabel } from '../../utils/roles';
import type { UserRole } from '../../interfaces/types';

const ROLES: UserRole[] = ['maintenance', 'housekeeping', 'reception', 'manager', 'owner'];

interface FormData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  properties: string[];
  is_active: boolean;
}

export default function UserForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const isEdit = !!id;

  const { data: user } = useGetUserQuery(id!, { skip: !id });
  const { data: propertiesData } = useGetPropertiesQuery({});
  const [create, { isLoading: creating }] = useCreateUserMutation();
  const [update, { isLoading: updating }] = useUpdateUserMutation();

  const { register, handleSubmit, reset, control } = useForm<FormData>({
    defaultValues: { properties: [], is_active: true },
  });

  useEffect(() => {
    if (user) {
      reset({
        email: user.email,
        password: '',
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        properties: user.properties,
        is_active: user.is_active,
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      if (isEdit) {
        const { password, ...rest } = data;
        await update({ id: id!, data: rest as never }).unwrap();
        enqueueSnackbar('Usuario actualizado', { variant: 'success' });
      } else {
        await create(data).unwrap();
        enqueueSnackbar('Usuario creado', { variant: 'success' });
      }
      navigate('/users');
    } catch {
      enqueueSnackbar('Error al guardar', { variant: 'error' });
    }
  };

  const properties = propertiesData?.results ?? [];

  return (
    <Box maxWidth={600}>
      <Typography variant="h5" mb={2}>{isEdit ? 'Editar Usuario' : 'Nuevo Usuario'}</Typography>
      <Card>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={2}>
              <Grid item xs={6}><TextField {...register('first_name')} label="Nombre" fullWidth required /></Grid>
              <Grid item xs={6}><TextField {...register('last_name')} label="Apellido" fullWidth required /></Grid>
              <Grid item xs={12}><TextField {...register('email')} label="Email" type="email" fullWidth required /></Grid>
              {!isEdit && (
                <Grid item xs={12}>
                  <TextField {...register('password')} label="Contraseña" type="password" fullWidth required inputProps={{ minLength: 8 }} helperText="Mínimo 8 caracteres" />
                </Grid>
              )}
              <Grid item xs={12}>
                <TextField {...register('role')} label="Rol" select fullWidth required defaultValue={user?.role ?? 'reception'}>
                  {ROLES.map((r) => <MenuItem key={r} value={r}>{getRoleLabel(r)}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="properties"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      label="Propiedades"
                      select
                      fullWidth
                      SelectProps={{ multiple: true, renderValue: (selected) => {
                        const sel = selected as string[];
                        return sel.map((id) => properties.find((p) => p.id === id)?.name ?? id).join(', ');
                      } }}
                      value={field.value}
                      onChange={field.onChange}
                    >
                      {properties.map((p) => (
                        <MenuItem key={p.id} value={p.id}>
                          <Checkbox checked={field.value.includes(p.id)} />
                          <ListItemText primary={p.name} />
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel control={<Checkbox {...register('is_active')} defaultChecked={user?.is_active ?? true} />} label="Activo" />
              </Grid>
            </Grid>
            <Box display="flex" gap={1} mt={3}>
              <Button type="submit" variant="contained" disabled={creating || updating}>{isEdit ? 'Guardar' : 'Crear'}</Button>
              <Button onClick={() => navigate('/users')}>Cancelar</Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}
