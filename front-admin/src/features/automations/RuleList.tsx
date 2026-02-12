import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Chip, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useSnackbar } from 'notistack';
import { useGetRulesQuery, useDeleteRuleMutation } from '../../services/automationService';
import DataTable, { Column } from '../../components/DataTable';
import ConfirmDialog from '../../components/ConfirmDialog';
import type { AutomationRule } from '../../interfaces/types';

export default function RuleList() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [page, setPage] = useState(0);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data } = useGetRulesQuery({ page: page + 1 });
  const [deleteRule] = useDeleteRuleMutation();

  const handleDelete = async () => {
    if (!deleteId) return;
    try { await deleteRule(deleteId).unwrap(); setDeleteId(null); enqueueSnackbar('Eliminada', { variant: 'success' }); }
    catch { enqueueSnackbar('Error', { variant: 'error' }); }
  };

  const columns: Column<AutomationRule>[] = [
    { id: 'name', label: 'Nombre', render: (r) => r.name },
    { id: 'trigger', label: 'Trigger', render: (r) => <Chip label={r.trigger} size="small" variant="outlined" /> },
    { id: 'priority', label: 'Prioridad', render: (r) => r.priority },
    { id: 'active', label: 'Activa', render: (r) => r.is_active ? <Chip label="Sí" size="small" color="success" /> : <Chip label="No" size="small" /> },
    { id: 'system', label: 'Sistema', render: (r) => r.is_system ? 'Sí' : 'No' },
    {
      id: 'actions', label: '', render: (r) => (
        <Box display="flex" gap={0.5}>
          <Button size="small" onClick={(e) => { e.stopPropagation(); navigate(`/automations/rules/${r.id}/edit`); }}>Editar</Button>
          {!r.is_system && <Button size="small" color="error" onClick={(e) => { e.stopPropagation(); setDeleteId(r.id); }}>Eliminar</Button>}
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Automatizaciones</Typography>
        <Box display="flex" gap={1}>
          <Button variant="outlined" onClick={() => navigate('/automations/logs')}>Ver logs</Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/automations/rules/new')}>Nueva regla</Button>
        </Box>
      </Box>
      <DataTable columns={columns} rows={data?.results ?? []} total={data?.count ?? 0} page={page} onPageChange={setPage} rowKey={(r) => r.id} />
      <ConfirmDialog open={!!deleteId} title="Eliminar regla" message="¿Eliminar esta regla de automatización?" confirmLabel="Eliminar" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </Box>
  );
}
