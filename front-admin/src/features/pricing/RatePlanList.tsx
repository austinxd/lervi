import { useState } from 'react';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  Grid, MenuItem, Switch, TextField, FormControlLabel,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useForm } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import { useAppSelector } from '../../store/hooks';
import { useGetRatePlansQuery, useCreateRatePlanMutation, useUpdateRatePlanMutation, useDeleteRatePlanMutation } from '../../services/pricingService';
import { useGetRoomTypesQuery } from '../../services/roomTypeService';
import DataTable, { Column } from '../../components/DataTable';
import ConfirmDialog from '../../components/ConfirmDialog';
import type { RatePlan } from '../../interfaces/types';

export default function RatePlanList() {
  const { enqueueSnackbar } = useSnackbar();
  const propertyId = useAppSelector((s) => s.auth.activePropertyId);
  const [page, setPage] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data } = useGetRatePlansQuery({ property: propertyId ?? undefined, page: page + 1 });
  const { data: roomTypesData } = useGetRoomTypesQuery({ property: propertyId ?? undefined });
  const [create] = useCreateRatePlanMutation();
  const [update] = useUpdateRatePlanMutation();
  const [remove] = useDeleteRatePlanMutation();

  const { register, handleSubmit, reset } = useForm<Partial<RatePlan>>();

  const openCreate = () => { reset({}); setEditId(null); setDialogOpen(true); };
  const openEdit = (r: RatePlan) => { reset(r); setEditId(r.id); setDialogOpen(true); };

  const onSubmit = async (formData: Partial<RatePlan>) => {
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

  const columns: Column<RatePlan>[] = [
    { id: 'name', label: 'Nombre', render: (r) => r.name },
    { id: 'rt', label: 'Tipo hab.', render: (r) => r.room_type_name },
    { id: 'type', label: 'Tipo plan', render: (r) => r.plan_type },
    { id: 'mod', label: 'Modificador', render: (r) => r.price_modifier },
    { id: 'nights', label: 'Mín. noches', render: (r) => r.min_nights },
    { id: 'advance', label: 'Mín. anticipación', render: (r) => `${r.min_advance_days}d` },
    { id: 'active', label: 'Activo', render: (r) => r.is_active ? 'Sí' : 'No' },
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
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>Nuevo plan</Button>
      </Box>
      <DataTable columns={columns} rows={data?.results ?? []} total={data?.count ?? 0} page={page} onPageChange={setPage} rowKey={(r) => r.id} />

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editId ? 'Editar Plan' : 'Nuevo Plan de Tarifa'}</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}><TextField {...register('name')} label="Nombre" fullWidth required /></Grid>
              <Grid item xs={12}>
                <TextField {...register('room_type')} label="Tipo habitación" select fullWidth required defaultValue="">
                  {(roomTypesData?.results ?? []).map((rt) => <MenuItem key={rt.id} value={rt.id}>{rt.name}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={6}>
                <TextField {...register('plan_type')} label="Tipo plan" select fullWidth defaultValue="percentage">
                  <MenuItem value="percentage">Porcentaje</MenuItem>
                  <MenuItem value="fixed_amount">Monto fijo</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={6}><TextField {...register('price_modifier')} label="Modificador" type="number" fullWidth inputProps={{ step: 0.01 }} /></Grid>
              <Grid item xs={6}><TextField {...register('min_nights', { valueAsNumber: true })} label="Mín. noches" type="number" fullWidth /></Grid>
              <Grid item xs={6}><TextField {...register('min_advance_days', { valueAsNumber: true })} label="Mín. anticipación (días)" type="number" fullWidth /></Grid>
              <Grid item xs={6}><FormControlLabel control={<Switch {...register('is_active')} defaultChecked />} label="Activo" /></Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button type="submit" variant="contained">Guardar</Button>
          </DialogActions>
        </form>
      </Dialog>

      <ConfirmDialog open={!!deleteId} title="Eliminar plan" message="¿Eliminar este plan de tarifa?" confirmLabel="Eliminar" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </Box>
  );
}
