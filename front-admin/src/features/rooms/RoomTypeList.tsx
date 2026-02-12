import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useSnackbar } from 'notistack';
import { useAppSelector } from '../../store/hooks';
import { useGetRoomTypesQuery, useDeleteRoomTypeMutation } from '../../services/roomTypeService';
import DataTable, { Column } from '../../components/DataTable';
import ConfirmDialog from '../../components/ConfirmDialog';
import { formatCurrency } from '../../utils/formatters';
import type { RoomType } from '../../interfaces/types';

const BED_LABELS: Record<string, string> = {
  single: 'Individual', double: 'Doble', queen: 'Queen', king: 'King', bunk: 'Litera', sofa_bed: 'Sofá cama',
};

export default function RoomTypeList() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const propertyId = useAppSelector((s) => s.auth.activePropertyId);
  const [page, setPage] = useState(0);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data } = useGetRoomTypesQuery({
    property: propertyId ?? undefined,
    page: page + 1,
  });
  const [deleteRoomType] = useDeleteRoomTypeMutation();

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteRoomType(deleteId).unwrap();
      enqueueSnackbar('Tipo de habitación eliminado', { variant: 'success' });
      setDeleteId(null);
    } catch {
      enqueueSnackbar('Error al eliminar', { variant: 'error' });
    }
  };

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
    {
      id: 'actions', label: '', render: (r) => (
        <Button size="small" color="error" onClick={(e) => { e.stopPropagation(); setDeleteId(r.id); }}>
          Eliminar
        </Button>
      ),
    },
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
      <ConfirmDialog
        open={!!deleteId}
        title="Eliminar tipo de habitación"
        message="¿Eliminar este tipo de habitación? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </Box>
  );
}
