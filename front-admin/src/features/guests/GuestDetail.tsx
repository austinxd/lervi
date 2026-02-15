import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Alert, Box, Button, Card, CardContent, Chip, CircularProgress,
  Divider, Grid, IconButton, MenuItem, TextField, Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import SendIcon from '@mui/icons-material/Send';
import { useForm, Controller } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import InputAdornment from '@mui/material/InputAdornment';
import { DOCUMENT_TYPE_OPTIONS, DOCUMENT_TYPE_LABELS, NATIONALITY_OPTIONS } from '../../utils/statusLabels';
import { useGetGuestQuery, useUpdateGuestMutation, useAddGuestNoteMutation, useDeleteGuestMutation } from '../../services/guestService';
import { useReniecLookup } from './useReniecLookup';
import ConfirmDialog from '../../components/ConfirmDialog';
import { formatDateTime } from '../../utils/formatters';
import type { Guest } from '../../interfaces/types';

export default function GuestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { data: guest, isLoading, error } = useGetGuestQuery(id!);
  const [updateGuest] = useUpdateGuestMutation();
  const [addNote] = useAddGuestNoteMutation();
  const [deleteGuest] = useDeleteGuestMutation();
  const [noteContent, setNoteContent] = useState('');
  const [editing, setEditing] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { register, handleSubmit, reset, control, watch, setValue } = useForm<Partial<Guest>>();
  const watchDocType = watch('document_type');

  const { isLooking } = useReniecLookup({ watch, setValue });

  useEffect(() => {
    if (watchDocType === 'dni') {
      setValue('nationality', 'PE');
    }
  }, [watchDocType, setValue]);

  const startEdit = () => {
    if (guest) {
      reset({
        first_name: guest.first_name,
        last_name: guest.last_name,
        email: guest.email,
        phone: guest.phone,
        document_type: guest.document_type,
        document_number: guest.document_number,
        nationality: guest.nationality,
        is_vip: guest.is_vip,
      });
      setEditing(true);
    }
  };

  const onSave = async (data: Partial<Guest>) => {
    try {
      await updateGuest({ id: id!, data }).unwrap();
      enqueueSnackbar('Huésped actualizado', { variant: 'success' });
      setEditing(false);
    } catch {
      enqueueSnackbar('Error al actualizar', { variant: 'error' });
    }
  };

  const handleAddNote = async () => {
    if (!noteContent.trim()) return;
    try {
      await addNote({ guestId: id!, content: noteContent }).unwrap();
      setNoteContent('');
      enqueueSnackbar('Nota agregada', { variant: 'success' });
    } catch {
      enqueueSnackbar('Error', { variant: 'error' });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteGuest(id!).unwrap();
      enqueueSnackbar('Huésped eliminado', { variant: 'success' });
      navigate('/guests');
    } catch {
      enqueueSnackbar('Error al eliminar', { variant: 'error' });
    }
  };

  if (isLoading) return <CircularProgress />;
  if (error || !guest) return <Alert severity="error">Error al cargar huésped</Alert>;

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Box display="flex" alignItems="center" gap={1}>
          <IconButton onClick={() => navigate('/guests')}><ArrowBackIcon /></IconButton>
          <Typography variant="h5">
            {guest.first_name} {guest.last_name}
            {guest.is_vip && <Chip label="VIP" size="small" color="secondary" sx={{ ml: 1 }} />}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={() => setDeleteOpen(true)}
          size="small"
        >
          Eliminar
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Información</Typography>
                {!editing && <Button size="small" onClick={startEdit}>Editar</Button>}
              </Box>
              {editing ? (
                <form onSubmit={handleSubmit(onSave)}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Controller name="first_name" control={control} defaultValue="" render={({ field }) => (
                        <TextField {...field} label="Nombre" fullWidth />
                      )} />
                    </Grid>
                    <Grid item xs={6}>
                      <Controller name="last_name" control={control} defaultValue="" render={({ field }) => (
                        <TextField {...field} label="Apellido" fullWidth />
                      )} />
                    </Grid>
                    <Grid item xs={6}><TextField {...register('email')} label="Email" fullWidth /></Grid>
                    <Grid item xs={6}><TextField {...register('phone')} label="Teléfono" fullWidth /></Grid>
                    <Grid item xs={6}>
                      <Controller name="document_type" control={control} render={({ field }) => (
                        <TextField {...field} select label="Tipo doc." fullWidth>
                          <MenuItem value="">— Sin tipo —</MenuItem>
                          {DOCUMENT_TYPE_OPTIONS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                        </TextField>
                      )} />
                    </Grid>
                    <Grid item xs={6}>
                      <Controller name="document_number" control={control} defaultValue="" render={({ field }) => (
                        <TextField
                          {...field}
                          label="Nro. documento"
                          fullWidth
                          InputProps={{
                            endAdornment: isLooking ? (
                              <InputAdornment position="end"><CircularProgress size={20} /></InputAdornment>
                            ) : null,
                          }}
                        />
                      )} />
                    </Grid>
                    <Grid item xs={6}>
                      <Controller name="nationality" control={control} render={({ field }) => (
                        <TextField {...field} select label="Nacionalidad" fullWidth>
                          <MenuItem value="">— Sin especificar —</MenuItem>
                          {NATIONALITY_OPTIONS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                        </TextField>
                      )} />
                    </Grid>
                  </Grid>
                  <Box display="flex" gap={1} mt={2}>
                    <Button type="submit" variant="contained" size="small">Guardar</Button>
                    <Button size="small" onClick={() => setEditing(false)}>Cancelar</Button>
                  </Box>
                </form>
              ) : (
                <Grid container spacing={1}>
                  {[
                    ['Email', guest.email],
                    ['Teléfono', guest.phone],
                    ['Documento', guest.document_number ? `${DOCUMENT_TYPE_LABELS[guest.document_type] || guest.document_type?.toUpperCase() || ''} ${guest.document_number}` : '—'],
                    ['Nacionalidad', NATIONALITY_OPTIONS.find((o) => o.value === guest.nationality)?.label || guest.nationality],
                    ['Registrado', guest.created_at ? formatDateTime(guest.created_at) : '—'],
                  ].map(([label, value]) => (
                    <Grid item xs={6} key={label}>
                      <Typography variant="caption" color="text.secondary">{label}</Typography>
                      <Typography variant="body2">{value || '—'}</Typography>
                    </Grid>
                  ))}
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={2}>Notas</Typography>
              <Box sx={{ maxHeight: 400, overflow: 'auto', mb: 2 }}>
                {(guest.notes ?? []).length === 0 && (
                  <Typography variant="body2" color="text.secondary">Sin notas</Typography>
                )}
                {(guest.notes ?? []).map((note) => (
                  <Box key={note.id} sx={{ mb: 1.5, p: 1.5, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                    <Typography variant="body2">{note.content}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {note.created_by_name} — {formatDateTime(note.created_at)}
                    </Typography>
                  </Box>
                ))}
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Box display="flex" gap={1}>
                <TextField
                  size="small"
                  fullWidth
                  placeholder="Escribir nota..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddNote(); } }}
                />
                <IconButton color="primary" onClick={handleAddNote} disabled={!noteContent.trim()}>
                  <SendIcon />
                </IconButton>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <ConfirmDialog
        open={deleteOpen}
        title="Eliminar huésped"
        message={`¿Está seguro de eliminar a ${guest.first_name} ${guest.last_name}? Esta acción no se puede deshacer.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </Box>
  );
}
