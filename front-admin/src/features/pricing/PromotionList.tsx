import { useState } from 'react';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  Grid, Switch, TextField, FormControlLabel,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useForm } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import { useAppSelector } from '../../store/hooks';
import { useGetPromotionsQuery, useCreatePromotionMutation, useUpdatePromotionMutation, useDeletePromotionMutation } from '../../services/pricingService';
import DataTable, { Column } from '../../components/DataTable';
import ConfirmDialog from '../../components/ConfirmDialog';
import { formatDate } from '../../utils/formatters';
import type { Promotion } from '../../interfaces/types';

export default function PromotionList() {
  const { enqueueSnackbar } = useSnackbar();
  const propertyId = useAppSelector((s) => s.auth.activePropertyId);
  const [page, setPage] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data } = useGetPromotionsQuery({ property: propertyId ?? undefined, page: page + 1 });
  const [create] = useCreatePromotionMutation();
  const [update] = useUpdatePromotionMutation();
  const [remove] = useDeletePromotionMutation();

  const { register, handleSubmit, reset } = useForm<Partial<Promotion>>();

  const openCreate = () => { reset({}); setEditId(null); setDialogOpen(true); };
  const openEdit = (p: Promotion) => { reset(p); setEditId(p.id); setDialogOpen(true); };

  const onSubmit = async (formData: Partial<Promotion>) => {
    try {
      if (editId) {
        await update({ id: editId, data: formData }).unwrap();
      } else {
        await create({ ...formData, property: propertyId! }).unwrap();
      }
      enqueueSnackbar('Guardado', { variant: 'success' });
      setDialogOpen(false);
    } catch {
      enqueueSnackbar('Error', { variant: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try { await remove(deleteId).unwrap(); setDeleteId(null); enqueueSnackbar('Eliminado', { variant: 'success' }); }
    catch { enqueueSnackbar('Error', { variant: 'error' }); }
  };

  const columns: Column<Promotion>[] = [
    { id: 'name', label: 'Nombre', render: (r) => r.name },
    { id: 'code', label: 'Código', render: (r) => r.code },
    { id: 'percent', label: '% Desc.', render: (r) => r.discount_percent ? `${r.discount_percent}%` : '—' },
    { id: 'fixed', label: 'Desc. fijo', render: (r) => r.discount_fixed || '—' },
    { id: 'start', label: 'Inicio', render: (r) => formatDate(r.start_date) },
    { id: 'end', label: 'Fin', render: (r) => formatDate(r.end_date) },
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
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>Nueva promoción</Button>
      </Box>
      <DataTable columns={columns} rows={data?.results ?? []} total={data?.count ?? 0} page={page} onPageChange={setPage} rowKey={(r) => r.id} />

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editId ? 'Editar Promoción' : 'Nueva Promoción'}</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={8}><TextField {...register('name')} label="Nombre" fullWidth required /></Grid>
              <Grid item xs={4}><TextField {...register('code')} label="Código" fullWidth required /></Grid>
              <Grid item xs={6}><TextField {...register('discount_percent')} label="% Descuento" type="number" fullWidth inputProps={{ step: 0.01 }} /></Grid>
              <Grid item xs={6}><TextField {...register('discount_fixed')} label="Descuento fijo" type="number" fullWidth inputProps={{ step: 0.01 }} /></Grid>
              <Grid item xs={6}><TextField {...register('start_date')} label="Inicio" type="date" fullWidth InputLabelProps={{ shrink: true }} required /></Grid>
              <Grid item xs={6}><TextField {...register('end_date')} label="Fin" type="date" fullWidth InputLabelProps={{ shrink: true }} required /></Grid>
              <Grid item xs={6}><TextField {...register('min_nights', { valueAsNumber: true })} label="Mín. noches" type="number" fullWidth /></Grid>
              <Grid item xs={6}><FormControlLabel control={<Switch {...register('is_active')} defaultChecked />} label="Activa" /></Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button type="submit" variant="contained">Guardar</Button>
          </DialogActions>
        </form>
      </Dialog>

      <ConfirmDialog open={!!deleteId} title="Eliminar promoción" message="¿Eliminar esta promoción?" confirmLabel="Eliminar" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </Box>
  );
}
