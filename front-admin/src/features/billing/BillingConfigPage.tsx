import { useEffect, useState } from 'react';
import {
  Box, Button, Card, CardContent, Divider, FormControlLabel,
  Grid, MenuItem, Switch, TextField, Typography,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import {
  useGetBillingConfigQuery,
  useUpdateBillingConfigMutation,
  useGetPropertyBillingConfigQuery,
  useUpdatePropertyBillingConfigMutation,
} from '../../services/billingService';
import { useGetPropertiesQuery } from '../../services/organizationService';
import { BILLING_PROVIDER_LABELS } from '../../utils/statusLabels';
import type { BillingConfig, PropertyBillingConfig } from '../../interfaces/types';

type OrgFormData = Partial<BillingConfig> & { api_key?: string; tasa_igv?: number };
type PropFormData = Partial<PropertyBillingConfig> & { api_key?: string };

export default function BillingConfigPage() {
  const { enqueueSnackbar } = useSnackbar();
  const { data: config } = useGetBillingConfigQuery();
  const [updateConfig, { isLoading: savingOrg }] = useUpdateBillingConfigMutation();
  const { data: propertiesData } = useGetPropertiesQuery({});
  const properties = propertiesData?.results ?? [];

  const [selectedPropertyId, setSelectedPropertyId] = useState('');

  const { register, handleSubmit, reset, control } = useForm<OrgFormData>();

  useEffect(() => {
    if (config) {
      const igv = (config.configuracion_tributaria as Record<string, unknown>)?.tasa_igv;
      reset({ ...config, tasa_igv: (igv as number) ?? 18 });
    }
  }, [config, reset]);

  const onSubmitOrg = async (data: OrgFormData) => {
    try {
      const { tasa_igv, ...rest } = data;
      await updateConfig({
        ...rest,
        configuracion_tributaria: { tasa_igv: tasa_igv ?? 18 },
      }).unwrap();
      enqueueSnackbar('Configuracion guardada', { variant: 'success' });
    } catch {
      enqueueSnackbar('Error al guardar', { variant: 'error' });
    }
  };

  return (
    <Box maxWidth={800}>
      <Typography variant="h5" mb={3}>Configuracion de Facturacion</Typography>

      {/* Organization config */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" mb={2}>Configuracion de la organizacion</Typography>
          <form onSubmit={handleSubmit(onSubmitOrg)}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="emission_mode"
                  control={control}
                  defaultValue="disabled"
                  render={({ field }) => (
                    <TextField {...field} select label="Modo de emision" fullWidth>
                      <MenuItem value="disabled">Deshabilitado</MenuItem>
                      <MenuItem value="manual">Manual</MenuItem>
                      <MenuItem value="automatic">Automatico</MenuItem>
                    </TextField>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField {...register('ruc')} label="RUC" fullWidth />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField {...register('razon_social')} label="Razon social" fullWidth />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField {...register('direccion_fiscal')} label="Direccion fiscal" fullWidth />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2" color="text.secondary" mb={1}>Proveedor de facturacion</Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="proveedor"
                  control={control}
                  defaultValue="nubefact"
                  render={({ field }) => (
                    <TextField {...field} select label="Proveedor" fullWidth>
                      {Object.entries(BILLING_PROVIDER_LABELS).map(([key, label]) => (
                        <MenuItem key={key} value={key}>{label}</MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="ambiente"
                  control={control}
                  defaultValue="beta"
                  render={({ field }) => (
                    <TextField {...field} select label="Ambiente" fullWidth>
                      <MenuItem value="beta">Beta (pruebas)</MenuItem>
                      <MenuItem value="produccion">Produccion</MenuItem>
                    </TextField>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField {...register('api_endpoint')} label="Endpoint API" fullWidth />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField {...register('api_key')} label="API Key" type="password" fullWidth />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2" color="text.secondary" mb={1}>Configuracion tributaria</Typography>
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  {...register('tasa_igv', { valueAsNumber: true })}
                  label="Tasa IGV (%)"
                  type="number"
                  fullWidth
                />
              </Grid>
            </Grid>
            <Box mt={3}>
              <Button type="submit" variant="contained" disabled={savingOrg}>Guardar</Button>
            </Box>
          </form>
        </CardContent>
      </Card>

      {/* Property config */}
      <Card>
        <CardContent>
          <Typography variant="h6" mb={2}>Configuracion por propiedad</Typography>
          {properties.length > 0 ? (
            <>
              <TextField
                select
                label="Seleccionar propiedad"
                value={selectedPropertyId}
                onChange={(e) => setSelectedPropertyId(e.target.value)}
                fullWidth
                sx={{ mb: 3 }}
              >
                {properties.map((p) => (
                  <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                ))}
              </TextField>
              {selectedPropertyId && (
                <PropertyBillingForm propertyId={selectedPropertyId} />
              )}
            </>
          ) : (
            <Typography color="text.secondary">No hay propiedades configuradas</Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

function PropertyBillingForm({ propertyId }: { propertyId: string }) {
  const { enqueueSnackbar } = useSnackbar();
  const { data: propConfig } = useGetPropertyBillingConfigQuery(propertyId);
  const [updatePropConfig, { isLoading }] = useUpdatePropertyBillingConfigMutation();

  const { register, handleSubmit, reset, control, watch } = useForm<PropFormData>();
  const usaPropia = watch('usa_configuracion_propia');

  useEffect(() => {
    if (propConfig) reset(propConfig);
  }, [propConfig, reset]);

  const onSubmit = async (data: PropFormData) => {
    try {
      await updatePropConfig({ propertyId, data }).unwrap();
      enqueueSnackbar('Configuracion de propiedad guardada', { variant: 'success' });
    } catch {
      enqueueSnackbar('Error al guardar', { variant: 'error' });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Controller
            name="usa_configuracion_propia"
            control={control}
            defaultValue={false}
            render={({ field }) => (
              <FormControlLabel
                control={<Switch checked={!!field.value} onChange={field.onChange} />}
                label="Usar configuracion propia"
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="emission_mode"
            control={control}
            defaultValue="inherit"
            render={({ field }) => (
              <TextField {...field} select label="Modo de emision" fullWidth>
                <MenuItem value="inherit">Heredar de organizacion</MenuItem>
                <MenuItem value="disabled">Deshabilitado</MenuItem>
                <MenuItem value="manual">Manual</MenuItem>
                <MenuItem value="automatic">Automatico</MenuItem>
              </TextField>
            )}
          />
        </Grid>

        {usaPropia && (
          <>
            <Grid item xs={12} sm={6}>
              <Controller
                name="proveedor"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <TextField {...field} select label="Proveedor" fullWidth>
                    <MenuItem value="">Heredar</MenuItem>
                    {Object.entries(BILLING_PROVIDER_LABELS).map(([key, label]) => (
                      <MenuItem key={key} value={key}>{label}</MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField {...register('api_endpoint')} label="Endpoint API" fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField {...register('api_key')} label="API Key" type="password" fullWidth />
            </Grid>
          </>
        )}

        <Grid item xs={12}>
          <Divider sx={{ my: 1 }} />
          <Typography variant="subtitle2" color="text.secondary" mb={1}>Series</Typography>
        </Grid>

        <Grid item xs={12} sm={3}>
          <TextField {...register('serie_boleta')} label="Serie boleta" fullWidth placeholder="B001" />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField {...register('serie_factura')} label="Serie factura" fullWidth placeholder="F001" />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField {...register('establecimiento_codigo')} label="Cod. establecimiento" fullWidth />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField {...register('punto_emision')} label="Punto de emision" fullWidth />
        </Grid>

        {propConfig?.resolved_config && (
          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle2" color="text.secondary" mb={1}>Configuracion resuelta (solo lectura)</Typography>
            <Box
              sx={{
                bgcolor: 'grey.100',
                p: 2,
                borderRadius: 1,
                fontFamily: 'monospace',
                fontSize: 13,
                maxHeight: 200,
                overflow: 'auto',
              }}
            >
              <pre style={{ margin: 0 }}>{JSON.stringify(propConfig.resolved_config, null, 2)}</pre>
            </Box>
          </Grid>
        )}
      </Grid>
      <Box mt={3}>
        <Button type="submit" variant="contained" disabled={isLoading}>Guardar</Button>
      </Box>
    </form>
  );
}
