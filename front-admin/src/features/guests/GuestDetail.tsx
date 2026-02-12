import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Alert, Box, Button, Card, CardContent, Chip, CircularProgress,
  Divider, Grid, IconButton, TextField, Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import { useForm } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import { useGetGuestQuery, useUpdateGuestMutation, useAddGuestNoteMutation } from '../../services/guestService';
import { formatDateTime } from '../../utils/formatters';
import type { Guest } from '../../interfaces/types';

export default function GuestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { data: guest, isLoading, error } = useGetGuestQuery(id!);
  const [updateGuest] = useUpdateGuestMutation();
  const [addNote] = useAddGuestNoteMutation();
  const [noteContent, setNoteContent] = useState('');
  const [editing, setEditing] = useState(false);

  const { register, handleSubmit, reset } = useForm<Partial<Guest>>();

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
        country_of_residence: guest.country_of_residence,
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

  if (isLoading) return <CircularProgress />;
  if (error || !guest) return <Alert severity="error">Error al cargar huésped</Alert>;

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <IconButton onClick={() => navigate('/guests')}><ArrowBackIcon /></IconButton>
        <Typography variant="h5">
          {guest.first_name} {guest.last_name}
          {guest.is_vip && <Chip label="VIP" size="small" color="secondary" sx={{ ml: 1 }} />}
        </Typography>
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
                    <Grid item xs={6}><TextField {...register('first_name')} label="Nombre" fullWidth /></Grid>
                    <Grid item xs={6}><TextField {...register('last_name')} label="Apellido" fullWidth /></Grid>
                    <Grid item xs={6}><TextField {...register('email')} label="Email" fullWidth /></Grid>
                    <Grid item xs={6}><TextField {...register('phone')} label="Teléfono" fullWidth /></Grid>
                    <Grid item xs={6}><TextField {...register('document_type')} label="Tipo doc." fullWidth /></Grid>
                    <Grid item xs={6}><TextField {...register('document_number')} label="Nro. documento" fullWidth /></Grid>
                    <Grid item xs={6}><TextField {...register('nationality')} label="Nacionalidad" fullWidth /></Grid>
                    <Grid item xs={6}><TextField {...register('country_of_residence')} label="País residencia" fullWidth /></Grid>
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
                    ['Documento', guest.document_number ? `${guest.document_type?.toUpperCase()} ${guest.document_number}` : '—'],
                    ['Nacionalidad', guest.nationality],
                    ['País residencia', guest.country_of_residence],
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
    </Box>
  );
}
