import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Chip, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useGetGuestsQuery, useCreateGuestMutation } from '../../services/guestService';
import DataTable, { Column } from '../../components/DataTable';
import { formatDate } from '../../utils/formatters';
import type { Guest } from '../../interfaces/types';
import {
  Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, TextField, Grid, FormControlLabel, Switch,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import { DOCUMENT_TYPE_OPTIONS, DOCUMENT_TYPE_LABELS, NATIONALITY_OPTIONS } from '../../utils/statusLabels';

export default function GuestList() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout>>();

  const { data } = useGetGuestsQuery({ page: page + 1, search: search || undefined });
  const [createGuest, { isLoading: creating }] = useCreateGuestMutation();
  const { register, handleSubmit, reset, control, watch, setValue } = useForm<Partial<Guest>>();
  const watchDocType = watch('document_type');

  useEffect(() => {
    if (watchDocType === 'dni') {
      setValue('nationality', 'PE');
    }
  }, [watchDocType, setValue]);

  const handleSearch = (val: string) => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => { setSearch(val); setPage(0); }, 300);
  };

  const onCreateSubmit = async (data: Partial<Guest>) => {
    try {
      const result = await createGuest(data).unwrap();
      enqueueSnackbar('Huésped creado', { variant: 'success' });
      setDialogOpen(false);
      reset();
      navigate(`/guests/${result.id}`);
    } catch {
      enqueueSnackbar('Error al crear', { variant: 'error' });
    }
  };

  const columns: Column<Guest>[] = [
    { id: 'name', label: 'Nombre', render: (r) => `${r.first_name} ${r.last_name}` },
    { id: 'email', label: 'Email', render: (r) => r.email || '—' },
    { id: 'phone', label: 'Teléfono', render: (r) => r.phone || '—' },
    { id: 'doc', label: 'Documento', render: (r) => r.document_number ? `${DOCUMENT_TYPE_LABELS[r.document_type] || r.document_type?.toUpperCase() || ''} ${r.document_number}` : '—' },
    { id: 'vip', label: 'VIP', render: (r) => r.is_vip ? <Chip label="VIP" size="small" color="secondary" /> : null },
    { id: 'created', label: 'Creado', render: (r) => formatDate(r.created_at) },
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Huéspedes</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
          Nuevo huésped
        </Button>
      </Box>
      <DataTable
        columns={columns}
        rows={data?.results ?? []}
        total={data?.count ?? 0}
        page={page}
        onPageChange={setPage}
        onSearch={handleSearch}
        searchPlaceholder="Buscar por nombre, email o documento..."
        rowKey={(r) => r.id}
        onRowClick={(r) => navigate(`/guests/${r.id}`)}
      />

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nuevo Huésped</DialogTitle>
        <form onSubmit={handleSubmit(onCreateSubmit)}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField {...register('first_name')} label="Nombre" fullWidth required />
              </Grid>
              <Grid item xs={6}>
                <TextField {...register('last_name')} label="Apellido" fullWidth required />
              </Grid>
              <Grid item xs={6}>
                <TextField {...register('email')} label="Email" type="email" fullWidth />
              </Grid>
              <Grid item xs={6}>
                <TextField {...register('phone')} label="Teléfono" fullWidth />
              </Grid>
              <Grid item xs={6}>
                <Controller name="document_type" control={control} defaultValue="" render={({ field }) => (
                  <TextField {...field} select label="Tipo doc." fullWidth>
                    <MenuItem value="">— Sin tipo —</MenuItem>
                    {DOCUMENT_TYPE_OPTIONS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                  </TextField>
                )} />
              </Grid>
              <Grid item xs={6}>
                <TextField {...register('document_number')} label="Nro. documento" fullWidth />
              </Grid>
              <Grid item xs={6}>
                <Controller name="nationality" control={control} defaultValue="" render={({ field }) => (
                  <TextField {...field} select label="Nacionalidad" fullWidth>
                    <MenuItem value="">— Sin especificar —</MenuItem>
                    {NATIONALITY_OPTIONS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                  </TextField>
                )} />
              </Grid>
              <Grid item xs={6}>
                <FormControlLabel control={<Switch {...register('is_vip')} />} label="VIP" />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button type="submit" variant="contained" disabled={creating}>Crear</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
