import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Chip, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useGetLogsQuery } from '../../services/automationService';
import DataTable, { Column } from '../../components/DataTable';
import { formatDateTime } from '../../utils/formatters';
import type { AutomationLog } from '../../interfaces/types';

export default function LogList() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);

  const { data } = useGetLogsQuery({ page: page + 1 });

  const columns: Column<AutomationLog>[] = [
    { id: 'date', label: 'Fecha', render: (r) => formatDateTime(r.created_at) },
    { id: 'rule', label: 'Regla', render: (r) => r.rule_name },
    { id: 'trigger', label: 'Trigger', render: (r) => <Chip label={r.trigger} size="small" variant="outlined" /> },
    {
      id: 'success', label: 'Estado', render: (r) => (
        r.success
          ? <Chip label="OK" size="small" color="success" />
          : <Chip label="Error" size="small" color="error" />
      ),
    },
    { id: 'error', label: 'Error', render: (r) => r.error_message || '—' },
  ];

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/automations')}>Volver</Button>
        <Typography variant="h5">Logs de Automatizaciones</Typography>
      </Box>
      <DataTable columns={columns} rows={data?.results ?? []} total={data?.count ?? 0} page={page} onPageChange={setPage} rowKey={(r) => r.id} />
    </Box>
  );
}
