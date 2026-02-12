import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Avatar, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  Grid, TextField, Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import UploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import { IconButton } from '@mui/material';
import { useForm } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import {
  useGetPropertiesQuery,
  useCreatePropertyMutation,
  useUploadPropertyLogoMutation,
} from '../../services/organizationService';
import DataTable, { Column } from '../../components/DataTable';
import type { Property } from '../../interfaces/types';

interface CreateFormData {
  name: string;
  slug: string;
}

export default function PropertySettings() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [page, setPage] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data } = useGetPropertiesQuery({ page: page + 1 });
  const [create] = useCreatePropertyMutation();
  const [uploadLogo] = useUploadPropertyLogoMutation();

  const { register, handleSubmit, reset } = useForm<CreateFormData>();

  const openCreate = () => {
    reset({});
    setLogoFile(null);
    setLogoPreview('');
    setDialogOpen(true);
  };

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleLogoRemove = () => {
    setLogoFile(null);
    setLogoPreview('');
  };

  const onSubmit = async (formData: CreateFormData) => {
    try {
      const created = await create(formData).unwrap();
      if (logoFile) {
        await uploadLogo({ id: created.id, file: logoFile }).unwrap();
      }
      enqueueSnackbar('Propiedad creada', { variant: 'success' });
      setDialogOpen(false);
    } catch {
      enqueueSnackbar('Error al crear propiedad', { variant: 'error' });
    }
  };

  const columns: Column<Property>[] = [
    {
      id: 'name', label: 'Nombre', render: (r) => (
        <Box display="flex" alignItems="center" gap={1}>
          <Avatar src={r.logo || undefined} sx={{ width: 28, height: 28, fontSize: 14, bgcolor: 'primary.main' }}>
            {r.name.charAt(0)}
          </Avatar>
          {r.name}
        </Box>
      ),
    },
    { id: 'slug', label: 'Slug', render: (r) => r.slug },
    { id: 'city', label: 'Ciudad', render: (r) => r.city || '—' },
    { id: 'active', label: 'Activa', render: (r) => r.is_active ? 'Sí' : 'No' },
    {
      id: 'actions', label: '', render: (r) => (
        <Button size="small" onClick={(e) => { e.stopPropagation(); navigate(`/settings/properties/${r.id}`); }}>Editar</Button>
      ),
    },
  ];

  return (
    <Box maxWidth={900}>
      <Typography variant="h5" mb={2}>Configuración</Typography>
      <Box display="flex" gap={1} mb={3}>
        <Button variant="outlined" onClick={() => navigate('/settings')}>Organización</Button>
        <Button variant="contained">Propiedades</Button>
        <Button variant="outlined" onClick={() => navigate('/settings/bank-accounts')}>Cuentas Bancarias</Button>
      </Box>
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>Nueva propiedad</Button>
      </Box>
      <DataTable columns={columns} rows={data?.results ?? []} total={data?.count ?? 0} page={page} onPageChange={setPage} rowKey={(r) => r.id} />

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Nueva Propiedad</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}><TextField {...register('name')} label="Nombre" fullWidth required /></Grid>
              <Grid item xs={12}><TextField {...register('slug')} label="Slug" fullWidth required /></Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary" mb={1}>Logo (opcional)</Typography>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar
                    src={logoPreview || undefined}
                    sx={{ width: 48, height: 48, bgcolor: 'grey.200' }}
                    variant="rounded"
                  >
                    {!logoPreview && 'Logo'}
                  </Avatar>
                  <Box>
                    <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleLogoSelect} />
                    <Button size="small" variant="outlined" startIcon={<UploadIcon />} onClick={() => fileInputRef.current?.click()}>
                      {logoPreview ? 'Cambiar' : 'Subir'}
                    </Button>
                    {logoPreview && (
                      <IconButton size="small" color="error" onClick={handleLogoRemove} sx={{ ml: 1 }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button type="submit" variant="contained">Crear</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
