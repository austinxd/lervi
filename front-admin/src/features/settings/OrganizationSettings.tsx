import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Card, CardContent, Grid, TextField, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import { useGetOrganizationQuery, useUpdateOrganizationMutation } from '../../services/organizationService';
import type { Organization } from '../../interfaces/types';

export default function OrganizationSettings() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { data: org } = useGetOrganizationQuery();
  const [updateOrg, { isLoading }] = useUpdateOrganizationMutation();

  const { register, handleSubmit, reset } = useForm<Partial<Organization>>();

  useEffect(() => {
    if (org) reset(org);
  }, [org, reset]);

  const onSubmit = async (data: Partial<Organization>) => {
    try {
      await updateOrg(data).unwrap();
      enqueueSnackbar('Organización actualizada', { variant: 'success' });
    } catch {
      enqueueSnackbar('Error al guardar', { variant: 'error' });
    }
  };

  return (
    <Box maxWidth={700}>
      <Typography variant="h5" mb={2}>Configuración</Typography>
      <Box display="flex" gap={1} mb={3}>
        <Button variant="contained">Organización</Button>
        <Button variant="outlined" onClick={() => navigate('/settings/properties')}>Propiedades</Button>
      </Box>
      <Card>
        <CardContent>
          <Typography variant="h6" mb={2}>Datos de la organización</Typography>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}><TextField {...register('name')} label="Nombre" fullWidth /></Grid>
              <Grid item xs={12} sm={6}><TextField {...register('legal_name')} label="Razón social" fullWidth /></Grid>
              <Grid item xs={12} sm={6}><TextField {...register('tax_id')} label="RUC / Tax ID" fullWidth /></Grid>
              <Grid item xs={12} sm={6}><TextField {...register('currency')} label="Moneda" fullWidth /></Grid>
              <Grid item xs={12} sm={6}><TextField {...register('timezone')} label="Zona horaria" fullWidth /></Grid>
              <Grid item xs={12} sm={6}><TextField {...register('language')} label="Idioma" fullWidth /></Grid>
              <Grid item xs={12}><TextField {...register('logo')} label="Logo URL" fullWidth /></Grid>
              <Grid item xs={12} sm={4}><TextField {...register('primary_color')} label="Color primario" fullWidth /></Grid>
              <Grid item xs={12} sm={4}><TextField {...register('secondary_color')} label="Color secundario" fullWidth /></Grid>
              <Grid item xs={12} sm={4}><TextField {...register('font')} label="Fuente" fullWidth /></Grid>
              <Grid item xs={12} sm={6}><TextField {...register('subdomain')} label="Subdominio" fullWidth disabled /></Grid>
              <Grid item xs={12} sm={6}><TextField {...register('custom_domain')} label="Dominio custom" fullWidth /></Grid>
            </Grid>
            <Box mt={3}>
              <Button type="submit" variant="contained" disabled={isLoading}>Guardar</Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}
