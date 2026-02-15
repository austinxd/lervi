import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Avatar, Box, Button, Card, CardContent, Chip, CircularProgress,
  FormControl, Grid, IconButton, InputLabel, MenuItem, Select,
  TextField, Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import UploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import AddPhotoIcon from '@mui/icons-material/AddPhotoAlternate';
import { useForm, Controller } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import {
  useGetOrganizationQuery,
  useGetPropertyQuery,
  useUpdatePropertyMutation,
  useUploadPropertyLogoMutation,
  useUploadPropertyHeroMutation,
  useGetPropertyPhotosQuery,
  useAddPropertyPhotoMutation,
  useDeletePropertyPhotoMutation,
} from '../../services/organizationService';
import {
  useGetPropertyBankAccountsQuery,
  useCreatePropertyBankAccountMutation,
  useUpdatePropertyBankAccountMutation,
  useDeletePropertyBankAccountMutation,
} from '../../services/bankAccountService';
import BankAccountTable from './BankAccountSettings';

interface BasicFormData {
  name: string;
  address: string;
  city: string;
  country: string;
  check_in_time: string;
  check_out_time: string;
  contact_phone: string;
  contact_email: string;
  whatsapp: string;
  stars: number | '';
}

interface ContentFormData {
  tagline: string;
  description: string;
}

export default function PropertyDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const { data: org } = useGetOrganizationQuery();
  const { data: property, isLoading } = useGetPropertyQuery(id!);
  const { data: photos = [] } = useGetPropertyPhotosQuery(id!);
  const [updateProperty] = useUpdatePropertyMutation();
  const [uploadLogo] = useUploadPropertyLogoMutation();
  const [uploadHero] = useUploadPropertyHeroMutation();
  const [addPhoto] = useAddPropertyPhotoMutation();
  const [deletePhoto] = useDeletePropertyPhotoMutation();
  const { data: propertyAccounts = [], isLoading: accountsLoading } = useGetPropertyBankAccountsQuery(id!);
  const [createPropertyAccount] = useCreatePropertyBankAccountMutation();
  const [updatePropertyAccount] = useUpdatePropertyBankAccountMutation();
  const [deletePropertyAccount] = useDeletePropertyBankAccountMutation();

  // Refs for file inputs
  const logoInputRef = useRef<HTMLInputElement>(null);
  const heroInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Chips state
  const [amenityInput, setAmenityInput] = useState('');
  const [paymentInput, setPaymentInput] = useState('');
  const [languageInput, setLanguageInput] = useState('');

  // Photo upload
  const [photoCaption, setPhotoCaption] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Basic info form
  const basicForm = useForm<BasicFormData>();
  const contentForm = useForm<ContentFormData>();

  // Reset forms when property loads
  useEffect(() => {
    if (property) {
      basicForm.reset({
        name: property.name,
        address: property.address,
        city: property.city,
        country: property.country,
        check_in_time: property.check_in_time,
        check_out_time: property.check_out_time,
        contact_phone: property.contact_phone,
        contact_email: property.contact_email,
        whatsapp: property.whatsapp,
        stars: property.stars ?? '',
      });
      contentForm.reset({
        tagline: property.tagline,
        description: property.description,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [property?.id]);

  if (isLoading || !property) {
    return <Box display="flex" justifyContent="center" mt={6}><CircularProgress /></Box>;
  }

  const saveBasic = async (data: BasicFormData) => {
    try {
      await updateProperty({
        id: property.id,
        data: { ...data, stars: data.stars === '' ? null : data.stars },
      }).unwrap();
      enqueueSnackbar('Información guardada', { variant: 'success' });
    } catch {
      enqueueSnackbar('Error al guardar', { variant: 'error' });
    }
  };

  const saveContent = async (data: ContentFormData) => {
    try {
      await updateProperty({ id: property.id, data }).unwrap();
      enqueueSnackbar('Contenido guardado', { variant: 'success' });
    } catch {
      enqueueSnackbar('Error al guardar', { variant: 'error' });
    }
  };

  const handleChipAdd = async (
    field: 'amenities' | 'payment_methods' | 'languages',
    value: string,
    clearFn: (v: string) => void,
  ) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    const current = property[field] as string[];
    if (current.includes(trimmed)) return;
    try {
      await updateProperty({ id: property.id, data: { [field]: [...current, trimmed] } }).unwrap();
      clearFn('');
    } catch {
      enqueueSnackbar('Error al guardar', { variant: 'error' });
    }
  };

  const handleChipDelete = async (
    field: 'amenities' | 'payment_methods' | 'languages',
    value: string,
  ) => {
    const current = property[field] as string[];
    try {
      await updateProperty({ id: property.id, data: { [field]: current.filter((v) => v !== value) } }).unwrap();
    } catch {
      enqueueSnackbar('Error al eliminar', { variant: 'error' });
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await uploadLogo({ id: property.id, file }).unwrap();
      enqueueSnackbar('Logo actualizado', { variant: 'success' });
    } catch {
      enqueueSnackbar('Error al subir logo', { variant: 'error' });
    }
  };

  const handleHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await uploadHero({ id: property.id, file }).unwrap();
      enqueueSnackbar('Hero image actualizada', { variant: 'success' });
    } catch {
      enqueueSnackbar('Error al subir hero image', { variant: 'error' });
    }
  };

  const handleHeroRemove = async () => {
    try {
      await updateProperty({ id: property.id, data: { hero_image: '' } }).unwrap();
      enqueueSnackbar('Hero image eliminada', { variant: 'success' });
    } catch {
      enqueueSnackbar('Error al eliminar', { variant: 'error' });
    }
  };

  const handlePhotoUpload = async () => {
    if (!photoFile) return;
    setUploadingPhoto(true);
    try {
      await addPhoto({ id: property.id, file: photoFile, caption: photoCaption }).unwrap();
      setPhotoFile(null);
      setPhotoCaption('');
      if (photoInputRef.current) photoInputRef.current.value = '';
      enqueueSnackbar('Foto agregada', { variant: 'success' });
    } catch {
      enqueueSnackbar('Error al subir foto', { variant: 'error' });
    }
    setUploadingPhoto(false);
  };

  const handlePhotoDelete = async (photoId: string) => {
    try {
      await deletePhoto({ propertyId: property.id, photoId }).unwrap();
      enqueueSnackbar('Foto eliminada', { variant: 'success' });
    } catch {
      enqueueSnackbar('Error al eliminar foto', { variant: 'error' });
    }
  };

  const ChipEditor = ({
    label,
    items,
    field,
    inputValue,
    setInputValue,
  }: {
    label: string;
    items: string[];
    field: 'amenities' | 'payment_methods' | 'languages';
    inputValue: string;
    setInputValue: (v: string) => void;
  }) => (
    <Box>
      <Typography variant="subtitle2" color="text.secondary" mb={1}>{label}</Typography>
      <Box display="flex" flexWrap="wrap" gap={0.5} mb={1}>
        {items.map((item) => (
          <Chip key={item} label={item} size="small" onDelete={() => handleChipDelete(field, item)} />
        ))}
      </Box>
      <Box display="flex" gap={1}>
        <TextField
          size="small"
          placeholder={`Agregar ${label.toLowerCase()}`}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleChipAdd(field, inputValue, setInputValue);
            }
          }}
        />
        <Button
          size="small"
          variant="outlined"
          onClick={() => handleChipAdd(field, inputValue, setInputValue)}
        >
          Agregar
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box maxWidth={900}>
      <Box mb={3}>
        {org && (
          <Typography variant="body2" color="text.secondary" mb={0.5}>
            {org.name}
          </Typography>
        )}
        <Box display="flex" alignItems="center" gap={1}>
          <IconButton onClick={() => navigate('/settings/properties')}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5">{property.name}</Typography>
          <Chip label={property.slug} size="small" variant="outlined" sx={{ ml: 1 }} />
        </Box>
      </Box>

      {/* Card 1: Información básica */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" mb={2}>Sucursal</Typography>
          <form onSubmit={basicForm.handleSubmit(saveBasic)}>
            <Grid container spacing={2}>
              <Grid item xs={8}>
                <TextField {...basicForm.register('name')} label="Nombre" fullWidth required />
              </Grid>
              <Grid item xs={4}>
                <TextField label="Slug" fullWidth disabled value={property.slug} />
              </Grid>
              <Grid item xs={12}>
                <TextField {...basicForm.register('address')} label="Dirección" fullWidth />
              </Grid>
              <Grid item xs={6}>
                <TextField {...basicForm.register('city')} label="Ciudad" fullWidth />
              </Grid>
              <Grid item xs={6}>
                <TextField {...basicForm.register('country')} label="País" fullWidth />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  {...basicForm.register('check_in_time')}
                  label="Hora check-in"
                  type="time"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  {...basicForm.register('check_out_time')}
                  label="Hora check-out"
                  type="time"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField {...basicForm.register('contact_phone')} label="Teléfono" fullWidth />
              </Grid>
              <Grid item xs={4}>
                <TextField {...basicForm.register('contact_email')} label="Email" type="email" fullWidth />
              </Grid>
              <Grid item xs={4}>
                <TextField {...basicForm.register('whatsapp')} label="WhatsApp" fullWidth />
              </Grid>
              <Grid item xs={4}>
                <Controller
                  name="stars"
                  control={basicForm.control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Estrellas</InputLabel>
                      <Select {...field} label="Estrellas">
                        <MenuItem value="">Sin definir</MenuItem>
                        {[1, 2, 3, 4, 5].map((n) => (
                          <MenuItem key={n} value={n}>{n}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Box display="flex" justifyContent="flex-end">
                  <Button type="submit" variant="contained">Guardar</Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      {/* Card 2: Contenido web */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" mb={2}>Contenido web</Typography>
          <form onSubmit={contentForm.handleSubmit(saveContent)}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField {...contentForm.register('tagline')} label="Tagline" fullWidth />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  {...contentForm.register('description')}
                  label="Descripción"
                  fullWidth
                  multiline
                  rows={4}
                />
              </Grid>
              <Grid item xs={12}>
                <Box display="flex" justifyContent="flex-end">
                  <Button type="submit" variant="contained">Guardar</Button>
                </Box>
              </Grid>
            </Grid>
          </form>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <ChipEditor
                label="Amenidades"
                items={property.amenities}
                field="amenities"
                inputValue={amenityInput}
                setInputValue={setAmenityInput}
              />
            </Grid>
            <Grid item xs={12}>
              <ChipEditor
                label="Métodos de pago"
                items={property.payment_methods}
                field="payment_methods"
                inputValue={paymentInput}
                setInputValue={setPaymentInput}
              />
            </Grid>
            <Grid item xs={12}>
              <ChipEditor
                label="Idiomas"
                items={property.languages}
                field="languages"
                inputValue={languageInput}
                setInputValue={setLanguageInput}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Card 3: Imágenes */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" mb={2}>Imágenes</Typography>
          <Grid container spacing={3}>
            {/* Logo */}
            <Grid item xs={12} sm={4}>
              <Typography variant="subtitle2" color="text.secondary" mb={1}>Logo</Typography>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar
                  src={property.logo || undefined}
                  sx={{ width: 64, height: 64, bgcolor: 'grey.200' }}
                  variant="rounded"
                >
                  {!property.logo && 'Logo'}
                </Avatar>
                <Box>
                  <input ref={logoInputRef} type="file" accept="image/*" hidden onChange={handleLogoUpload} />
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<UploadIcon />}
                    onClick={() => logoInputRef.current?.click()}
                  >
                    {property.logo ? 'Cambiar' : 'Subir'}
                  </Button>
                </Box>
              </Box>
            </Grid>

            {/* Hero image */}
            <Grid item xs={12} sm={8}>
              <Typography variant="subtitle2" color="text.secondary" mb={1}>Hero Image</Typography>
              {property.hero_image ? (
                <Box>
                  <Box
                    component="img"
                    src={property.hero_image}
                    alt="Hero"
                    sx={{
                      width: '100%',
                      maxHeight: 200,
                      objectFit: 'cover',
                      borderRadius: 1,
                      mb: 1,
                    }}
                  />
                  <Box display="flex" gap={1}>
                    <input ref={heroInputRef} type="file" accept="image/*" hidden onChange={handleHeroUpload} />
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<UploadIcon />}
                      onClick={() => heroInputRef.current?.click()}
                    >
                      Cambiar
                    </Button>
                    <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={handleHeroRemove}>
                      Eliminar
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Box>
                  <input ref={heroInputRef} type="file" accept="image/*" hidden onChange={handleHeroUpload} />
                  <Button
                    variant="outlined"
                    startIcon={<UploadIcon />}
                    onClick={() => heroInputRef.current?.click()}
                    sx={{ height: 100, width: '100%', border: '2px dashed', borderColor: 'grey.400' }}
                  >
                    Subir hero image
                  </Button>
                </Box>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Card 4: Cuentas bancarias propias */}
      <Box sx={{ mb: 3 }}>
        <BankAccountTable
          accounts={propertyAccounts}
          isLoading={accountsLoading}
          title="Cuentas bancarias (solo esta propiedad)"
          emptyMessage="Sin cuentas propias — usa las de la organizacion"
          onCreate={async (data) => { await createPropertyAccount({ propertyId: property.id, data }).unwrap(); }}
          onUpdate={async (accountId, data) => { await updatePropertyAccount({ propertyId: property.id, id: accountId, data }).unwrap(); }}
          onDelete={async (accountId) => { await deletePropertyAccount({ propertyId: property.id, id: accountId }).unwrap(); }}
        />
      </Box>

      {/* Card 5: Galería de fotos */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" mb={2}>Galería de fotos</Typography>
          <Grid container spacing={2}>
            {photos.map((photo) => (
              <Grid item xs={6} sm={4} md={3} key={photo.id}>
                <Box sx={{ position: 'relative', borderRadius: 1, overflow: 'hidden' }}>
                  <Box
                    component="img"
                    src={photo.image}
                    alt={photo.caption || 'Foto'}
                    sx={{ width: '100%', height: 140, objectFit: 'cover' }}
                  />
                  <IconButton
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      bgcolor: 'rgba(0,0,0,0.5)',
                      color: 'white',
                      '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
                    }}
                    onClick={() => handlePhotoDelete(photo.id)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                  {photo.caption && (
                    <Typography variant="caption" sx={{ display: 'block', p: 0.5, textAlign: 'center' }}>
                      {photo.caption}
                    </Typography>
                  )}
                </Box>
              </Grid>
            ))}
          </Grid>

          {/* Agregar foto */}
          <Box sx={{ mt: 2, p: 2, border: '1px dashed', borderColor: 'grey.400', borderRadius: 1 }}>
            <Typography variant="subtitle2" color="text.secondary" mb={1}>Agregar foto</Typography>
            <Box display="flex" gap={2} alignItems="flex-end" flexWrap="wrap">
              <Box>
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
                />
                <Button
                  variant="outlined"
                  startIcon={<AddPhotoIcon />}
                  onClick={() => photoInputRef.current?.click()}
                >
                  {photoFile ? photoFile.name : 'Seleccionar imagen'}
                </Button>
              </Box>
              <TextField
                size="small"
                label="Caption (opcional)"
                value={photoCaption}
                onChange={(e) => setPhotoCaption(e.target.value)}
              />
              <Button
                variant="contained"
                onClick={handlePhotoUpload}
                disabled={!photoFile || uploadingPhoto}
                startIcon={uploadingPhoto ? <CircularProgress size={16} /> : <UploadIcon />}
              >
                Subir
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
