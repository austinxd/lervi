import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Avatar, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  Divider, Grid, IconButton, TextField, Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import UploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import { useForm } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import {
  useGetPropertiesQuery,
  useCreatePropertyMutation,
  useUpdatePropertyMutation,
  useUploadPropertyLogoMutation,
} from '../../services/organizationService';
import DataTable, { Column } from '../../components/DataTable';
import type { Property } from '../../interfaces/types';

interface FormData {
  name: string;
  slug: string;
  address: string;
  city: string;
  country: string;
  check_in_time: string;
  check_out_time: string;
  contact_phone: string;
  contact_email: string;
}

export default function PropertySettings() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [page, setPage] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [currentLogo, setCurrentLogo] = useState<string>('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data } = useGetPropertiesQuery({ page: page + 1 });
  const [create] = useCreatePropertyMutation();
  const [update] = useUpdatePropertyMutation();
  const [uploadLogo] = useUploadPropertyLogoMutation();

  const { register, handleSubmit, reset } = useForm<FormData>();

  const openCreate = () => {
    reset({});
    setEditId(null);
    setCurrentLogo('');
    setLogoFile(null);
    setLogoPreview('');
    setDialogOpen(true);
  };

  const openEdit = (p: Property) => {
    reset(p);
    setEditId(p.id);
    setCurrentLogo(p.logo || '');
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
    setCurrentLogo('');
  };

  const onSubmit = async (formData: FormData) => {
    try {
      // Strip file fields — logo is uploaded separately via uploadLogo
      const { logo, hero_image, ...cleanData } = formData as FormData & Record<string, unknown>;
      let propertyId = editId;
      if (editId) {
        await update({ id: editId, data: cleanData }).unwrap();
      } else {
        const created = await create(cleanData).unwrap();
        propertyId = created.id;
      }
      if (logoFile && propertyId) {
        await uploadLogo({ id: propertyId, file: logoFile }).unwrap();
      }
      enqueueSnackbar('Guardado', { variant: 'success' });
      setDialogOpen(false);
    } catch {
      enqueueSnackbar('Error al guardar', { variant: 'error' });
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
        <Button size="small" onClick={(e) => { e.stopPropagation(); openEdit(r); }}>Editar</Button>
      ),
    },
  ];

  const displayLogo = logoPreview || currentLogo;

  return (
    <Box maxWidth={900}>
      <Typography variant="h5" mb={2}>Configuración</Typography>
      <Box display="flex" gap={1} mb={3}>
        <Button variant="outlined" onClick={() => navigate('/settings')}>Organización</Button>
        <Button variant="contained">Propiedades</Button>
      </Box>
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>Nueva propiedad</Button>
      </Box>
      <DataTable columns={columns} rows={data?.results ?? []} total={data?.count ?? 0} page={page} onPageChange={setPage} rowKey={(r) => r.id} />

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editId ? 'Editar Propiedad' : 'Nueva Propiedad'}</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Grid container spacing={2}>
              {/* Basic info */}
              <Grid item xs={8}><TextField {...register('name')} label="Nombre" fullWidth required /></Grid>
              <Grid item xs={4}><TextField {...register('slug')} label="Slug" fullWidth required /></Grid>
              <Grid item xs={12}><TextField {...register('address')} label="Dirección" fullWidth /></Grid>
              <Grid item xs={6}><TextField {...register('city')} label="Ciudad" fullWidth /></Grid>
              <Grid item xs={6}><TextField {...register('country')} label="País" fullWidth /></Grid>
              <Grid item xs={6}><TextField {...register('check_in_time')} label="Hora check-in" type="time" fullWidth InputLabelProps={{ shrink: true }} /></Grid>
              <Grid item xs={6}><TextField {...register('check_out_time')} label="Hora check-out" type="time" fullWidth InputLabelProps={{ shrink: true }} /></Grid>
              <Grid item xs={6}><TextField {...register('contact_phone')} label="Teléfono contacto" fullWidth /></Grid>
              <Grid item xs={6}><TextField {...register('contact_email')} label="Email contacto" type="email" fullWidth /></Grid>

              {/* Logo */}
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2" color="text.secondary" mb={1}>Logo</Typography>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar
                    src={displayLogo || undefined}
                    sx={{ width: 64, height: 64, bgcolor: 'grey.200' }}
                    variant="rounded"
                  >
                    {!displayLogo && 'Logo'}
                  </Avatar>
                  <Box>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={handleLogoSelect}
                    />
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<UploadIcon />}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {displayLogo ? 'Cambiar' : 'Subir logo'}
                    </Button>
                    {displayLogo && (
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
            <Button type="submit" variant="contained">Guardar</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
