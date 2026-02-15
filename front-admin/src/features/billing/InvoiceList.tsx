import { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SettingsIcon from '@mui/icons-material/Settings';
import DataTable, { type Column } from '../../components/DataTable';
import StatusChip from '../../components/StatusChip';
import { useGetInvoicesQuery } from '../../services/billingService';
import { useAppSelector } from '../../store/hooks';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { INVOICE_STATUS, INVOICE_DOC_TYPE } from '../../utils/statusLabels';
import type { InvoiceListItem } from '../../interfaces/types';
import CreateInvoiceDialog from './CreateInvoiceDialog';

export default function InvoiceList() {
  const navigate = useNavigate();
  const property = useAppSelector((s) => s.auth.activePropertyId);

  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [docTypeFilter, setDocTypeFilter] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(0);
    }, 300);
  }, []);

  const { data } = useGetInvoicesQuery({
    property: property ?? undefined,
    page: page + 1,
    search: debouncedSearch || undefined,
    status: statusFilter || undefined,
    document_type: docTypeFilter || undefined,
  });

  const columns: Column<InvoiceListItem>[] = [
    {
      id: 'numero_completo',
      label: 'Numero',
      render: (row) => row.numero_completo,
      width: 130,
    },
    {
      id: 'document_type',
      label: 'Tipo',
      render: (row) => INVOICE_DOC_TYPE[row.document_type] ?? row.document_type,
      width: 120,
    },
    {
      id: 'status',
      label: 'Estado',
      render: (row) => <StatusChip statusMap={INVOICE_STATUS} value={row.status} />,
      width: 120,
    },
    {
      id: 'cliente_razon_social',
      label: 'Cliente',
      render: (row) => row.cliente_razon_social,
    },
    {
      id: 'total',
      label: 'Total',
      render: (row) => formatCurrency(row.total, row.currency),
      align: 'right',
      width: 110,
    },
    {
      id: 'fecha_emision',
      label: 'Emision',
      render: (row) => formatDate(row.fecha_emision),
      width: 110,
    },
    {
      id: 'property_name',
      label: 'Propiedad',
      render: (row) => row.property_name,
      width: 140,
    },
    {
      id: 'reservation_code',
      label: 'Reserva',
      render: (row) => row.reservation_code ?? '—',
      width: 110,
    },
  ];

  const toolbar = (
    <>
      <FormControl size="small" sx={{ minWidth: 140 }}>
        <InputLabel>Estado</InputLabel>
        <Select
          label="Estado"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
        >
          <MenuItem value="">Todos</MenuItem>
          {Object.entries(INVOICE_STATUS).map(([key, info]) => (
            <MenuItem key={key} value={key}>{info.label}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 140 }}>
        <InputLabel>Tipo</InputLabel>
        <Select
          label="Tipo"
          value={docTypeFilter}
          onChange={(e) => { setDocTypeFilter(e.target.value); setPage(0); }}
        >
          <MenuItem value="">Todos</MenuItem>
          {Object.entries(INVOICE_DOC_TYPE).map(([key, label]) => (
            <MenuItem key={key} value={key}>{label}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <Button
        variant="outlined"
        startIcon={<SettingsIcon />}
        onClick={() => navigate('/billing/config')}
      >
        Configuracion
      </Button>

      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => setDialogOpen(true)}
      >
        Crear comprobante
      </Button>
    </>
  );

  return (
    <Box>
      <DataTable<InvoiceListItem>
        columns={columns}
        rows={data?.results ?? []}
        total={data?.count ?? 0}
        page={page}
        onPageChange={setPage}
        onSearch={handleSearch}
        searchPlaceholder="Buscar por numero o cliente..."
        rowKey={(row) => row.id}
        onRowClick={(row) => navigate(`/billing/invoices/${row.id}`)}
        toolbar={toolbar}
      />
      <CreateInvoiceDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </Box>
  );
}
