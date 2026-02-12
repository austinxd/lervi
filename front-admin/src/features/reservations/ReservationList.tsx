import { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DataTable, { type Column } from '../../components/DataTable';
import StatusChip from '../../components/StatusChip';
import { useGetReservationsQuery } from '../../services/reservationService';
import { useAppSelector } from '../../store/hooks';
import { formatDate, formatCurrency } from '../../utils/formatters';
import {
  OPERATIONAL_STATUS,
  FINANCIAL_STATUS,
  ORIGIN_TYPE_LABELS,
} from '../../utils/statusLabels';
import type { ReservationList as ReservationListItem } from '../../interfaces/types';

export default function ReservationList() {
  const navigate = useNavigate();
  const property = useAppSelector((s) => s.auth.activePropertyId);

  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [operationalStatus, setOperationalStatus] = useState('');
  const [financialStatus, setFinancialStatus] = useState('');
  const [originType, setOriginType] = useState('');

  // Debounce search
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

  const { data, isLoading } = useGetReservationsQuery({
    property: property ?? undefined,
    page: page + 1,
    search: debouncedSearch || undefined,
    operational_status: operationalStatus || undefined,
    financial_status: financialStatus || undefined,
    origin_type: originType || undefined,
  });

  const columns: Column<ReservationListItem>[] = [
    {
      id: 'confirmation_code',
      label: 'Codigo',
      render: (row) => row.confirmation_code,
      width: 120,
    },
    {
      id: 'guest_name',
      label: 'Huesped',
      render: (row) => row.guest_name,
    },
    {
      id: 'room_type_name',
      label: 'Tipo hab.',
      render: (row) => row.room_type_name,
    },
    {
      id: 'check_in_date',
      label: 'Check-in',
      render: (row) => formatDate(row.check_in_date),
      width: 110,
    },
    {
      id: 'check_out_date',
      label: 'Check-out',
      render: (row) => formatDate(row.check_out_date),
      width: 110,
    },
    {
      id: 'operational_status',
      label: 'Estado Op.',
      render: (row) => (
        <StatusChip statusMap={OPERATIONAL_STATUS} value={row.operational_status} />
      ),
      width: 130,
    },
    {
      id: 'financial_status',
      label: 'Estado Fin.',
      render: (row) => (
        <StatusChip statusMap={FINANCIAL_STATUS} value={row.financial_status} />
      ),
      width: 130,
    },
    {
      id: 'total_amount',
      label: 'Monto',
      render: (row) => formatCurrency(row.total_amount, row.currency),
      align: 'right',
      width: 110,
    },
  ];

  const toolbar = (
    <>
      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel>Estado Op.</InputLabel>
        <Select
          label="Estado Op."
          value={operationalStatus}
          onChange={(e) => {
            setOperationalStatus(e.target.value);
            setPage(0);
          }}
        >
          <MenuItem value="">Todas</MenuItem>
          {Object.entries(OPERATIONAL_STATUS).map(([key, info]) => (
            <MenuItem key={key} value={key}>
              {info.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel>Estado Fin.</InputLabel>
        <Select
          label="Estado Fin."
          value={financialStatus}
          onChange={(e) => {
            setFinancialStatus(e.target.value);
            setPage(0);
          }}
        >
          <MenuItem value="">Todas</MenuItem>
          {Object.entries(FINANCIAL_STATUS).map(([key, info]) => (
            <MenuItem key={key} value={key}>
              {info.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 130 }}>
        <InputLabel>Origen</InputLabel>
        <Select
          label="Origen"
          value={originType}
          onChange={(e) => {
            setOriginType(e.target.value);
            setPage(0);
          }}
        >
          <MenuItem value="">Todas</MenuItem>
          {Object.entries(ORIGIN_TYPE_LABELS).map(([key, label]) => (
            <MenuItem key={key} value={key}>
              {label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => navigate('/reservations/new')}
      >
        Nueva reservacion
      </Button>
    </>
  );

  return (
    <Box>
      <DataTable<ReservationListItem>
        columns={columns}
        rows={data?.results ?? []}
        total={data?.count ?? 0}
        page={page}
        onPageChange={setPage}
        onSearch={handleSearch}
        searchPlaceholder="Buscar por codigo o nombre..."
        rowKey={(row) => row.id}
        onRowClick={(row) => navigate(`/reservations/${row.id}`)}
        toolbar={toolbar}
      />
    </Box>
  );
}
