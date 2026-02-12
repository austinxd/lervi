import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, Button, Card, CardContent, Grid, MenuItem, Switch,
  TextField, Typography, FormControlLabel,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import { useGetRuleQuery, useCreateRuleMutation, useUpdateRuleMutation } from '../../services/automationService';

const TRIGGERS = [
  'reservation.created', 'reservation.confirmed', 'reservation.check_in',
  'reservation.check_out', 'reservation.cancelled', 'reservation.no_show',
  'task.completed',
];

interface FormData {
  name: string;
  description: string;
  trigger: string;
  conditions: string;
  actions: string;
  priority: number;
  is_active: boolean;
}

export default function RuleForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const isEdit = !!id;

  const { data: rule } = useGetRuleQuery(id!, { skip: !id });
  const [create, { isLoading: creating }] = useCreateRuleMutation();
  const [update, { isLoading: updating }] = useUpdateRuleMutation();

  const { register, handleSubmit, reset } = useForm<FormData>();

  useEffect(() => {
    if (rule) {
      reset({
        name: rule.name,
        description: rule.description,
        trigger: rule.trigger,
        conditions: JSON.stringify(rule.conditions, null, 2),
        actions: JSON.stringify(rule.actions, null, 2),
        priority: rule.priority,
        is_active: rule.is_active,
      });
    }
  }, [rule, reset]);

  const onSubmit = async (data: FormData) => {
    let conditions, actions;
    try {
      conditions = JSON.parse(data.conditions || '{}');
      actions = JSON.parse(data.actions || '{}');
    } catch {
      enqueueSnackbar('JSON inválido en condiciones o acciones', { variant: 'error' });
      return;
    }

    const payload = { ...data, conditions, actions };
    try {
      if (isEdit) {
        await update({ id: id!, data: payload }).unwrap();
        enqueueSnackbar('Regla actualizada', { variant: 'success' });
      } else {
        await create(payload).unwrap();
        enqueueSnackbar('Regla creada', { variant: 'success' });
      }
      navigate('/automations');
    } catch {
      enqueueSnackbar('Error al guardar', { variant: 'error' });
    }
  };

  return (
    <Box maxWidth={700}>
      <Typography variant="h5" mb={2}>{isEdit ? 'Editar Regla' : 'Nueva Regla'}</Typography>
      <Card>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={8}><TextField {...register('name')} label="Nombre" fullWidth required /></Grid>
              <Grid item xs={12} sm={4}><TextField {...register('priority', { valueAsNumber: true })} label="Prioridad" type="number" fullWidth /></Grid>
              <Grid item xs={12}><TextField {...register('description')} label="Descripción" fullWidth multiline rows={2} /></Grid>
              <Grid item xs={12}>
                <TextField {...register('trigger')} label="Trigger" select fullWidth required defaultValue={rule?.trigger ?? ''}>
                  {TRIGGERS.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField {...register('conditions')} label="Condiciones (JSON)" fullWidth multiline rows={4} placeholder='{"field": "value"}' />
              </Grid>
              <Grid item xs={12}>
                <TextField {...register('actions')} label="Acciones (JSON)" fullWidth multiline rows={4} placeholder='{"type": "action"}' />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel control={<Switch {...register('is_active')} defaultChecked />} label="Activa" />
              </Grid>
            </Grid>
            <Box display="flex" gap={1} mt={3}>
              <Button type="submit" variant="contained" disabled={creating || updating}>{isEdit ? 'Guardar' : 'Crear'}</Button>
              <Button onClick={() => navigate('/automations')}>Cancelar</Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}
