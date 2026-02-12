import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Button, Card, CardContent, Chip, Grid, IconButton,
  MenuItem, Select, ToggleButton, ToggleButtonGroup, Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import TableViewIcon from '@mui/icons-material/TableChart';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import { useAppSelector } from '../../store/hooks';
import { useGetRoomsQuery, useChangeRoomStatusMutation } from '../../services/roomService';
import DataTable, { Column } from '../../components/DataTable';
import StatusChip from '../../components/StatusChip';
import { ROOM_STATUS, ROOM_STATUS_TRANSITIONS } from '../../utils/statusLabels';
import type { Room } from '../../interfaces/types';
import { useSnackbar } from 'notistack';

export default function RoomList() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const propertyId = useAppSelector((s) => s.auth.activePropertyId);
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'board'>('table');

  const { data, isLoading } = useGetRoomsQuery({
    property: propertyId ?? undefined,
    page: page + 1,
    ...(statusFilter && { status: statusFilter }),
  });
  const [changeStatus] = useChangeRoomStatusMutation();

  const rooms = data?.results ?? [];

  const handleTransition = async (roomId: string, newStatus: string) => {
    try {
      await changeStatus({ id: roomId, new_status: newStatus }).unwrap();
      enqueueSnackbar('Estado actualizado', { variant: 'success' });
    } catch {
      enqueueSnackbar('Error al cambiar estado', { variant: 'error' });
    }
  };

  const columns: Column<Room>[] = [
    { id: 'number', label: 'Número', render: (r) => r.number },
    { id: 'floor', label: 'Piso', render: (r) => r.floor || '—' },
    { id: 'type', label: 'Tipos', render: (r) => r.room_type_names.join(', ') || '—' },
    { id: 'status', label: 'Estado', render: (r) => <StatusChip statusMap={ROOM_STATUS} value={r.status} /> },
    { id: 'bed', label: 'Config. Camas', render: (r) => r.active_bed_configuration_name || '—' },
    {
      id: 'actions', label: 'Transiciones', render: (r) => {
        const transitions = ROOM_STATUS_TRANSITIONS[r.status] ?? [];
        return (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {transitions.map((t) => (
              <Chip
                key={t}
                label={ROOM_STATUS[t]?.label ?? t}
                size="small"
                variant="outlined"
                onClick={(e) => { e.stopPropagation(); handleTransition(r.id, t); }}
                clickable
              />
            ))}
          </Box>
        );
      },
    },
  ];

  const statusColors: Record<string, string> = {
    available: '#4caf50', occupied: '#1976d2', dirty: '#ff9800',
    cleaning: '#03a9f4', inspection: '#9c27b0', blocked: '#f44336', maintenance: '#757575',
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Habitaciones</Typography>
        <Box display="flex" gap={1}>
          <ToggleButtonGroup size="small" value={viewMode} exclusive onChange={(_, v) => v && setViewMode(v)}>
            <ToggleButton value="table"><TableViewIcon fontSize="small" /></ToggleButton>
            <ToggleButton value="board"><ViewModuleIcon fontSize="small" /></ToggleButton>
          </ToggleButtonGroup>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/rooms/new')}>
            Nueva
          </Button>
        </Box>
      </Box>

      {viewMode === 'table' ? (
        <DataTable
          columns={columns}
          rows={rooms}
          total={data?.count ?? 0}
          page={page}
          onPageChange={setPage}
          rowKey={(r) => r.id}
          onRowClick={(r) => navigate(`/rooms/${r.id}/edit`)}
          toolbar={
            <Select size="small" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }} displayEmpty sx={{ minWidth: 150 }}>
              <MenuItem value="">Todos los estados</MenuItem>
              {Object.entries(ROOM_STATUS).map(([k, v]) => (
                <MenuItem key={k} value={k}>{v.label}</MenuItem>
              ))}
            </Select>
          }
        />
      ) : (
        <Grid container spacing={2}>
          {rooms.map((room) => (
            <Grid item xs={6} sm={4} md={3} lg={2} key={room.id}>
              <Card
                sx={{
                  cursor: 'pointer',
                  borderLeft: `4px solid ${statusColors[room.status] ?? '#ccc'}`,
                  '&:hover': { boxShadow: 3 },
                }}
                onClick={() => navigate(`/rooms/${room.id}/edit`)}
              >
                <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                  <Typography variant="h6" fontWeight={700}>{room.number}</Typography>
                  <Typography variant="caption" color="text.secondary">{room.room_type_names.join(', ')}</Typography>
                  <Box mt={0.5}>
                    <StatusChip statusMap={ROOM_STATUS} value={room.status} />
                  </Box>
                  <Box mt={1} display="flex" gap={0.5} flexWrap="wrap">
                    {(ROOM_STATUS_TRANSITIONS[room.status] ?? []).map((t) => (
                      <Chip
                        key={t}
                        label={ROOM_STATUS[t]?.label ?? t}
                        size="small"
                        variant="outlined"
                        onClick={(e) => { e.stopPropagation(); handleTransition(room.id, t); }}
                        clickable
                        sx={{ fontSize: '0.65rem', height: 20 }}
                      />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
