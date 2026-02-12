import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, MenuItem, Select, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useSnackbar } from 'notistack';
import { useAppSelector } from '../../store/hooks';
import { useGetTasksQuery, useStartTaskMutation, useCompleteTaskMutation } from '../../services/taskService';
import DataTable, { Column } from '../../components/DataTable';
import StatusChip from '../../components/StatusChip';
import ConfirmDialog from '../../components/ConfirmDialog';
import { TASK_STATUS, TASK_PRIORITY, TASK_TYPE_LABELS } from '../../utils/statusLabels';
import { formatDate } from '../../utils/formatters';
import type { TaskItem } from '../../interfaces/types';

export default function TaskList() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const propertyId = useAppSelector((s) => s.auth.activePropertyId);
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [completeDialog, setCompleteDialog] = useState<string | null>(null);

  const { data } = useGetTasksQuery({
    property: propertyId ?? undefined,
    page: page + 1,
    ...(statusFilter && { status: statusFilter }),
    ...(typeFilter && { task_type: typeFilter }),
    ...(priorityFilter && { priority: priorityFilter }),
  });

  const [startTask] = useStartTaskMutation();
  const [completeTask] = useCompleteTaskMutation();

  const handleStart = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await startTask(id).unwrap();
      enqueueSnackbar('Tarea iniciada', { variant: 'success' });
    } catch {
      enqueueSnackbar('Error al iniciar', { variant: 'error' });
    }
  };

  const handleComplete = async () => {
    if (!completeDialog) return;
    try {
      await completeTask({ id: completeDialog }).unwrap();
      enqueueSnackbar('Tarea completada', { variant: 'success' });
      setCompleteDialog(null);
    } catch {
      enqueueSnackbar('Error al completar', { variant: 'error' });
    }
  };

  const columns: Column<TaskItem>[] = [
    { id: 'type', label: 'Tipo', render: (r) => TASK_TYPE_LABELS[r.task_type] ?? r.task_type },
    { id: 'room', label: 'Habitación', render: (r) => r.room_number || '—' },
    { id: 'assigned', label: 'Asignado a', render: (r) => r.assigned_to_name || r.assigned_role || '—' },
    { id: 'priority', label: 'Prioridad', render: (r) => <StatusChip statusMap={TASK_PRIORITY} value={r.priority} /> },
    { id: 'status', label: 'Estado', render: (r) => <StatusChip statusMap={TASK_STATUS} value={r.status} /> },
    { id: 'due', label: 'Vence', render: (r) => formatDate(r.due_date) },
    {
      id: 'actions', label: 'Acciones', render: (r) => (
        <Box display="flex" gap={0.5}>
          {r.status === 'pending' && (
            <Button size="small" startIcon={<PlayArrowIcon />} onClick={(e) => handleStart(r.id, e)}>Iniciar</Button>
          )}
          {r.status === 'in_progress' && (
            <Button size="small" startIcon={<CheckCircleIcon />} onClick={(e) => { e.stopPropagation(); setCompleteDialog(r.id); }}>Completar</Button>
          )}
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Tareas</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/tasks/new')}>
          Nueva tarea
        </Button>
      </Box>
      <DataTable
        columns={columns}
        rows={data?.results ?? []}
        total={data?.count ?? 0}
        page={page}
        onPageChange={setPage}
        rowKey={(r) => r.id}
        onRowClick={(r) => navigate(`/tasks/${r.id}/edit`)}
        toolbar={
          <>
            <Select size="small" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }} displayEmpty sx={{ minWidth: 130 }}>
              <MenuItem value="">Todos estados</MenuItem>
              {Object.entries(TASK_STATUS).map(([k, v]) => <MenuItem key={k} value={k}>{v.label}</MenuItem>)}
            </Select>
            <Select size="small" value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(0); }} displayEmpty sx={{ minWidth: 130 }}>
              <MenuItem value="">Todos tipos</MenuItem>
              {Object.entries(TASK_TYPE_LABELS).map(([k, v]) => <MenuItem key={k} value={k}>{v}</MenuItem>)}
            </Select>
            <Select size="small" value={priorityFilter} onChange={(e) => { setPriorityFilter(e.target.value); setPage(0); }} displayEmpty sx={{ minWidth: 130 }}>
              <MenuItem value="">Todas prioridades</MenuItem>
              {Object.entries(TASK_PRIORITY).map(([k, v]) => <MenuItem key={k} value={k}>{v.label}</MenuItem>)}
            </Select>
          </>
        }
      />
      <ConfirmDialog
        open={!!completeDialog}
        title="Completar tarea"
        message="¿Marcar esta tarea como completada?"
        confirmLabel="Completar"
        onConfirm={handleComplete}
        onCancel={() => setCompleteDialog(null)}
      />
    </Box>
  );
}
