import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, Card, CardContent, Grid, MenuItem, TextField, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import { useAppSelector } from '../../store/hooks';
import { useGetTaskQuery, useCreateTaskMutation, useUpdateTaskMutation } from '../../services/taskService';
import { useGetRoomsQuery } from '../../services/roomService';
import { TASK_TYPE_LABELS } from '../../utils/statusLabels';

interface FormData {
  task_type: string;
  room: string;
  assigned_role: string;
  priority: string;
  due_date: string;
  notes: string;
}

export default function TaskForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const propertyId = useAppSelector((s) => s.auth.activePropertyId);
  const isEdit = !!id;

  const { data: task } = useGetTaskQuery(id!, { skip: !id });
  const { data: roomsData } = useGetRoomsQuery({ property: propertyId ?? undefined });
  const [createTask, { isLoading: creating }] = useCreateTaskMutation();
  const [updateTask, { isLoading: updating }] = useUpdateTaskMutation();

  const { register, handleSubmit, reset } = useForm<FormData>();

  useEffect(() => {
    if (task) {
      reset({
        task_type: task.task_type,
        room: task.room || '',
        assigned_role: task.assigned_role,
        priority: task.priority,
        due_date: task.due_date?.slice(0, 16) || '',
        notes: task.notes || '',
      });
    }
  }, [task, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      const payload = {
        ...data,
        property: propertyId!,
        room: data.room || null,
        due_date: data.due_date || null,
      };
      if (isEdit) {
        await updateTask({ id: id!, data: payload as never }).unwrap();
        enqueueSnackbar('Tarea actualizada', { variant: 'success' });
      } else {
        await createTask(payload as never).unwrap();
        enqueueSnackbar('Tarea creada', { variant: 'success' });
      }
      navigate('/tasks');
    } catch {
      enqueueSnackbar('Error al guardar', { variant: 'error' });
    }
  };

  return (
    <Box maxWidth={600}>
      <Typography variant="h5" mb={2}>{isEdit ? 'Editar Tarea' : 'Nueva Tarea'}</Typography>
      <Card>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  {...register('task_type', { required: true })}
                  label="Tipo"
                  select
                  fullWidth
                  required
                  defaultValue={task?.task_type ?? ''}
                >
                  {Object.entries(TASK_TYPE_LABELS).map(([k, v]) => (
                    <MenuItem key={k} value={k}>{v}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  {...register('priority', { required: true })}
                  label="Prioridad"
                  select
                  fullWidth
                  required
                  defaultValue={task?.priority ?? 'normal'}
                >
                  <MenuItem value="normal">Normal</MenuItem>
                  <MenuItem value="high">Alta</MenuItem>
                  <MenuItem value="urgent">Urgente</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  {...register('room')}
                  label="Habitación"
                  select
                  fullWidth
                  defaultValue={task?.room ?? ''}
                >
                  <MenuItem value="">Sin asignar</MenuItem>
                  {(roomsData?.results ?? []).map((r) => (
                    <MenuItem key={r.id} value={r.id}>{r.number} — {r.room_type_names.join(', ')}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  {...register('assigned_role')}
                  label="Rol asignado"
                  select
                  fullWidth
                  defaultValue={task?.assigned_role ?? ''}
                >
                  <MenuItem value="">Sin rol</MenuItem>
                  <MenuItem value="housekeeping">Housekeeping</MenuItem>
                  <MenuItem value="maintenance">Mantenimiento</MenuItem>
                  <MenuItem value="reception">Recepción</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  {...register('due_date')}
                  label="Fecha límite"
                  type="datetime-local"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField {...register('notes')} label="Notas" multiline rows={3} fullWidth />
              </Grid>
            </Grid>
            <Box display="flex" gap={1} mt={3}>
              <Button type="submit" variant="contained" disabled={creating || updating}>
                {isEdit ? 'Guardar' : 'Crear'}
              </Button>
              <Button onClick={() => navigate('/tasks')}>Cancelar</Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}
