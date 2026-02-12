import { useState } from 'react';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  Grid, Switch, TextField, FormControlLabel,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useForm } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import { useAppSelector } from '../../store/hooks';
import { useGetSeasonsQuery, useCreateSeasonMutation, useUpdateSeasonMutation, useDeleteSeasonMutation } from '../../services/pricingService';
import DataTable, { Column } from '../../components/DataTable';
import ConfirmDialog from '../../components/ConfirmDialog';
import type { Season } from '../../interfaces/types';

const MONTH_NAMES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const fmtMD = (month: number, day: number) => `${day} ${MONTH_NAMES[month - 1]}`;

export default function SeasonList() {
  const { enqueueSnackbar } = useSnackbar();
  const propertyId = useAppSelector((s) => s.auth.activePropertyId);
  const [page, setPage] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data } = useGetSeasonsQuery({ property: propertyId ?? undefined, page: page + 1 });
  const [createSeason] = useCreateSeasonMutation();
  const [updateSeason] = useUpdateSeasonMutation();
  const [deleteSeason] = useDeleteSeasonMutation();

  const { register, handleSubmit, reset } = useForm<Partial<Season>>();

  const openCreate = () => { reset({}); setEditId(null); setDialogOpen(true); };
  const openEdit = (s: Season) => { reset(s); setEditId(s.id); setDialogOpen(true); };

  const onSubmit = async (formData: Partial<Season>) => {
    try {
      if (editId) {
        await updateSeason({ id: editId, data: formData }).unwrap();
        enqueueSnackbar('Temporada actualizada', { variant: 'success' });
      } else {
        await createSeason({ ...formData, property: propertyId! }).unwrap();
        enqueueSnackbar('Temporada creada', { variant: 'success' });
      }
      setDialogOpen(false);
    } catch {
      enqueueSnackbar('Error', { variant: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteSeason(deleteId).unwrap();
      enqueueSnackbar('Eliminada', { variant: 'success' });
      setDeleteId(null);
    } catch {
      enqueueSnackbar('Error', { variant: 'error' });
    }
  };

  const columns: Column<Season>[] = [
    { id: 'name', label: 'Nombre', render: (r) => r.name },
    { id: 'start', label: 'Inicio', render: (r) => fmtMD(r.start_month, r.start_day) },
    { id: 'end', label: 'Fin', render: (r) => fmtMD(r.end_month, r.end_day) },
    { id: 'mod', label: 'Modificador', render: (r) => `${r.price_modifier}x` },
    { id: 'active', label: 'Activa', render: (r) => r.is_active ? 'Sí' : 'No' },
    {
      id: 'actions', label: '', render: (r) => (
        <Box display="flex" gap={0.5}>
          <Button size="small" onClick={(e) => { e.stopPropagation(); openEdit(r); }}>Editar</Button>
          <Button size="small" color="error" onClick={(e) => { e.stopPropagation(); setDeleteId(r.id); }}>Eliminar</Button>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>Nueva temporada</Button>
      </Box>
      <DataTable columns={columns} rows={data?.results ?? []} total={data?.count ?? 0} page={page} onPageChange={setPage} rowKey={(r) => r.id} />

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editId ? 'Editar Temporada' : 'Nueva Temporada'}</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}><TextField {...register('name')} label="Nombre" fullWidth required /></Grid>
              <Grid item xs={3}><TextField {...register('start_month', { valueAsNumber: true })} label="Mes inicio" type="number" fullWidth inputProps={{ min: 1, max: 12 }} required /></Grid>
              <Grid item xs={3}><TextField {...register('start_day', { valueAsNumber: true })} label="Día inicio" type="number" fullWidth inputProps={{ min: 1, max: 31 }} required /></Grid>
              <Grid item xs={3}><TextField {...register('end_month', { valueAsNumber: true })} label="Mes fin" type="number" fullWidth inputProps={{ min: 1, max: 12 }} required /></Grid>
              <Grid item xs={3}><TextField {...register('end_day', { valueAsNumber: true })} label="Día fin" type="number" fullWidth inputProps={{ min: 1, max: 31 }} required /></Grid>
              <Grid item xs={6}><TextField {...register('price_modifier')} label="Modificador precio" type="number" fullWidth inputProps={{ step: 0.01 }} required /></Grid>
              <Grid item xs={6}><FormControlLabel control={<Switch {...register('is_active')} defaultChecked />} label="Activa" /></Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button type="submit" variant="contained">Guardar</Button>
          </DialogActions>
        </form>
      </Dialog>

      <ConfirmDialog open={!!deleteId} title="Eliminar temporada" message="¿Eliminar esta temporada?" confirmLabel="Eliminar" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </Box>
  );
}
