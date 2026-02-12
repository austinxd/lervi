import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useAppSelector } from '../../store/hooks';
import { useGetRoomTypesQuery } from '../../services/roomTypeService';
import DataTable, { Column } from '../../components/DataTable';
import { formatCurrency } from '../../utils/formatters';
import type { RoomType } from '../../interfaces/types';

const BED_LABELS: Record<string, string> = {
  single: 'Individual', double: 'Doble', queen: 'Queen', king: 'King', bunk: 'Litera', sofa_bed: 'Sofá cama',
};

export default function RoomTypeList() {
  const navigate = useNavigate();
  const propertyId = useAppSelector((s) => s.auth.activePropertyId);
  const [page, setPage] = useState(0);

  const { data } = useGetRoomTypesQuery({
    property: propertyId ?? undefined,
    page: page + 1,
  });

  const columns: Column<RoomType>[] = [
    { id: 'name', label: 'Nombre', render: (r) => r.name },
    { id: 'price', label: 'Precio base', render: (r) => formatCurrency(r.base_price) },
    { id: 'capacity', label: 'Capacidad', render: (r) => `${r.max_adults} ad. / ${r.max_children} niños` },
    { id: 'beds', label: 'Camas', render: (r) => {
      const bc = r.bed_configurations[0];
      if (!bc) return '—';
      return bc.details.map((d) => `${d.quantity}x ${BED_LABELS[d.bed_type] ?? d.bed_type}`).join(', ');
    }},
    { id: 'photos', label: 'Fotos', render: (r) => r.photos.length },
    { id: 'active', label: 'Activo', render: (r) => r.is_active ? 'Sí' : 'No' },
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Tipos de Habitación</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/room-types/new')}>
          Nuevo tipo
        </Button>
      </Box>
      <DataTable
        columns={columns}
        rows={data?.results ?? []}
        total={data?.count ?? 0}
        page={page}
        onPageChange={setPage}
        rowKey={(r) => r.id}
        onRowClick={(r) => navigate(`/room-types/${r.id}/edit`)}
      />
    </Box>
  );
}
