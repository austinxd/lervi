import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, Button, Card, CardContent, Divider, Grid, IconButton,
  MenuItem, TextField, Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useForm } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import { useAppSelector } from '../../store/hooks';
import {
  useGetRoomTypeQuery, useCreateRoomTypeMutation, useUpdateRoomTypeMutation,
  useAddBedConfigMutation, useDeleteBedConfigMutation,
  useAddPhotoMutation, useDeletePhotoMutation,
} from '../../services/roomTypeService';

interface FormData {
  name: string;
  slug: string;
  description: string;
  max_adults: number;
  max_children: number;
  base_price: string;
  is_active: boolean;
}

const BED_TYPES = [
  { value: 'single', label: 'Individual' },
  { value: 'double', label: 'Doble' },
  { value: 'queen', label: 'Queen' },
  { value: 'king', label: 'King' },
  { value: 'bunk', label: 'Litera' },
  { value: 'sofa_bed', label: 'Sofá cama' },
];

export default function RoomTypeForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const propertyId = useAppSelector((s) => s.auth.activePropertyId);
  const isEdit = !!id;

  const { data: roomType, refetch } = useGetRoomTypeQuery(id!, { skip: !id });
  const [createRT, { isLoading: creating }] = useCreateRoomTypeMutation();
  const [updateRT, { isLoading: updating }] = useUpdateRoomTypeMutation();
  const [addBedConfig] = useAddBedConfigMutation();
  const [deleteBedConfig] = useDeleteBedConfigMutation();
  const [addPhoto] = useAddPhotoMutation();
  const [deletePhoto] = useDeletePhotoMutation();

  const { register, handleSubmit, reset } = useForm<FormData>();

  // New bed config form
  const [newBedName, setNewBedName] = useState('');
  const [newBedType, setNewBedType] = useState('double');
  const [newBedQty, setNewBedQty] = useState(1);

  // New photo form
  const [newPhotoFile, setNewPhotoFile] = useState<File | null>(null);
  const [newPhotoCaption, setNewPhotoCaption] = useState('');

  useEffect(() => {
    if (roomType) {
      reset({
        name: roomType.name,
        slug: roomType.slug,
        description: roomType.description,
        max_adults: roomType.max_adults,
        max_children: roomType.max_children,
        base_price: roomType.base_price,
        is_active: roomType.is_active,
      });
    }
  }, [roomType, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      if (isEdit) {
        await updateRT({ id: id!, data }).unwrap();
        enqueueSnackbar('Tipo actualizado', { variant: 'success' });
      } else {
        const result = await createRT({ ...data, property: propertyId! } as never).unwrap();
        enqueueSnackbar('Tipo creado', { variant: 'success' });
        navigate(`/room-types/${result.id}/edit`);
        return;
      }
    } catch {
      enqueueSnackbar('Error al guardar', { variant: 'error' });
    }
  };

  const handleAddBedConfig = async () => {
    if (!id || !newBedName) return;
    try {
      await addBedConfig({
        roomTypeId: id,
        data: { name: newBedName, details: [{ bed_type: newBedType, quantity: newBedQty }] },
      }).unwrap();
      setNewBedName('');
      refetch();
      enqueueSnackbar('Configuración agregada', { variant: 'success' });
    } catch {
      enqueueSnackbar('Error', { variant: 'error' });
    }
  };

  const handleDeleteBedConfig = async (configId: string) => {
    if (!id) return;
    try {
      await deleteBedConfig({ roomTypeId: id, configId }).unwrap();
      refetch();
    } catch {
      enqueueSnackbar('Error', { variant: 'error' });
    }
  };

  const handleAddPhoto = async () => {
    if (!id || !newPhotoFile) return;
    try {
      const formData = new FormData();
      formData.append('image', newPhotoFile);
      formData.append('caption', newPhotoCaption);
      formData.append('sort_order', String((roomType?.photos.length ?? 0) + 1));
      await addPhoto({ roomTypeId: id, data: formData }).unwrap();
      setNewPhotoFile(null);
      setNewPhotoCaption('');
      refetch();
      enqueueSnackbar('Foto agregada', { variant: 'success' });
    } catch {
      enqueueSnackbar('Error', { variant: 'error' });
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!id) return;
    try {
      await deletePhoto({ roomTypeId: id, photoId }).unwrap();
      refetch();
    } catch {
      enqueueSnackbar('Error', { variant: 'error' });
    }
  };

  return (
    <Box maxWidth={800}>
      <Typography variant="h5" mb={2}>{isEdit ? 'Editar Tipo de Habitación' : 'Nuevo Tipo de Habitación'}</Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField {...register('name', { required: true })} label="Nombre" fullWidth required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField {...register('slug', { required: true })} label="Slug" fullWidth required />
              </Grid>
              <Grid item xs={12}>
                <TextField {...register('description')} label="Descripción" fullWidth multiline rows={3} />
              </Grid>
              <Grid item xs={4}>
                <TextField {...register('max_adults', { valueAsNumber: true })} label="Máx. adultos" type="number" fullWidth />
              </Grid>
              <Grid item xs={4}>
                <TextField {...register('max_children', { valueAsNumber: true })} label="Máx. niños" type="number" fullWidth />
              </Grid>
              <Grid item xs={4}>
                <TextField {...register('base_price')} label="Precio base" type="number" fullWidth />
              </Grid>
            </Grid>
            <Box display="flex" gap={1} mt={3}>
              <Button type="submit" variant="contained" disabled={creating || updating}>
                {isEdit ? 'Guardar' : 'Crear'}
              </Button>
              <Button onClick={() => navigate('/room-types')}>Cancelar</Button>
            </Box>
          </form>
        </CardContent>
      </Card>

      {isEdit && (
        <>
          {/* Bed Configurations */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" mb={2}>Configuraciones de camas</Typography>
              {roomType?.bed_configurations.map((bc) => (
                <Box key={bc.id} display="flex" alignItems="center" justifyContent="space-between" py={1} borderBottom="1px solid #eee">
                  <Box>
                    <Typography fontWeight={600}>{bc.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {bc.details.map((d) => `${d.quantity}x ${BED_TYPES.find((b) => b.value === d.bed_type)?.label ?? d.bed_type}`).join(', ')}
                    </Typography>
                  </Box>
                  <IconButton size="small" onClick={() => handleDeleteBedConfig(bc.id)}><DeleteIcon fontSize="small" /></IconButton>
                </Box>
              ))}
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" mb={1}>Agregar configuración</Typography>
              <Box display="flex" gap={1} alignItems="flex-end">
                <TextField size="small" label="Nombre" value={newBedName} onChange={(e) => setNewBedName(e.target.value)} />
                <TextField size="small" label="Tipo cama" select value={newBedType} onChange={(e) => setNewBedType(e.target.value)} sx={{ minWidth: 120 }}>
                  {BED_TYPES.map((b) => <MenuItem key={b.value} value={b.value}>{b.label}</MenuItem>)}
                </TextField>
                <TextField size="small" label="Cantidad" type="number" value={newBedQty} onChange={(e) => setNewBedQty(+e.target.value)} sx={{ width: 80 }} />
                <Button variant="outlined" startIcon={<AddIcon />} onClick={handleAddBedConfig} disabled={!newBedName}>Agregar</Button>
              </Box>
            </CardContent>
          </Card>

          {/* Photos */}
          <Card>
            <CardContent>
              <Typography variant="h6" mb={2}>Fotos</Typography>
              <Grid container spacing={1}>
                {roomType?.photos.map((p) => (
                  <Grid item xs={6} sm={4} md={3} key={p.id}>
                    <Box position="relative" sx={{ borderRadius: 1, overflow: 'hidden', border: '1px solid #eee' }}>
                      <Box component="img" src={p.image} alt={p.caption} sx={{ width: '100%', height: 120, objectFit: 'cover' }} />
                      <IconButton
                        size="small"
                        onClick={() => handleDeletePhoto(p.id)}
                        sx={{ position: 'absolute', top: 2, right: 2, bgcolor: 'rgba(255,255,255,0.8)' }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Grid>
                ))}
              </Grid>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" mb={1}>Agregar foto</Typography>
              <Box display="flex" gap={1} alignItems="flex-end" flexWrap="wrap">
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<CloudUploadIcon />}
                  sx={{ minWidth: 160 }}
                >
                  {newPhotoFile ? newPhotoFile.name : 'Seleccionar imagen'}
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => setNewPhotoFile(e.target.files?.[0] ?? null)}
                  />
                </Button>
                <TextField size="small" label="Caption" value={newPhotoCaption} onChange={(e) => setNewPhotoCaption(e.target.value)} />
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddPhoto} disabled={!newPhotoFile}>Subir</Button>
              </Box>
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  );
}
