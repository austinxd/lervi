import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Chip, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useGetUsersQuery } from '../../services/userService';
import DataTable, { Column } from '../../components/DataTable';
import { getRoleLabel } from '../../utils/roles';
import type { User } from '../../interfaces/types';

export default function UserList() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);

  const { data } = useGetUsersQuery({ page: page + 1 });

  const columns: Column<User>[] = [
    { id: 'name', label: 'Nombre', render: (r) => `${r.first_name} ${r.last_name}` },
    { id: 'email', label: 'Email', render: (r) => r.email },
    { id: 'role', label: 'Rol', render: (r) => <Chip label={getRoleLabel(r.role)} size="small" /> },
    { id: 'props', label: 'Propiedades', render: (r) => r.properties.length },
    {
      id: 'active', label: 'Estado', render: (r) => (
        r.is_active
          ? <Chip label="Activo" size="small" color="success" />
          : <Chip label="Inactivo" size="small" color="default" />
      ),
    },
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Usuarios</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/users/new')}>
          Nuevo usuario
        </Button>
      </Box>
      <DataTable
        columns={columns}
        rows={data?.results ?? []}
        total={data?.count ?? 0}
        page={page}
        onPageChange={setPage}
        rowKey={(r) => r.id}
        onRowClick={(r) => navigate(`/users/${r.id}/edit`)}
      />
    </Box>
  );
}
