import { useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import { useAddPaymentMutation, useConfirmPaymentMutation, useRefundPaymentMutation } from '../../services/reservationService';
import { PAYMENT_METHOD_LABELS } from '../../utils/statusLabels';

interface Props {
  open: boolean;
  onClose: () => void;
  reservationId: string;
  mode: 'payment' | 'refund' | 'confirm';
  paymentId?: string;
  maxAmount?: number;
  defaultAmount?: string;
  onSuccess?: () => void;
}

interface FormValues {
  amount: string;
  method: string;
  notes: string;
  isPending: boolean;
}

export default function PaymentDialog({
  open,
  onClose,
  reservationId,
  mode,
  paymentId,
  maxAmount,
  defaultAmount,
  onSuccess,
}: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const [addPayment, { isLoading: isAdding }] = useAddPaymentMutation();
  const [confirmPayment, { isLoading: isConfirming }] = useConfirmPaymentMutation();
  const [refundPayment, { isLoading: isRefunding }] = useRefundPaymentMutation();

  const isPayment = mode === 'payment';
  const isConfirm = mode === 'confirm';
  const isLoading = isAdding || isConfirming || isRefunding;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      amount: '',
      method: 'cash',
      notes: '',
      isPending: false,
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        amount: defaultAmount || '',
        method: 'cash',
        notes: '',
        isPending: false,
      });
    }
  }, [open, reset, isConfirm, defaultAmount]);

  const onSubmit = async (values: FormValues) => {
    try {
      if (isPayment) {
        await addPayment({
          reservationId,
          data: {
            amount: values.amount,
            method: values.method,
            status: values.isPending ? 'pending' : 'completed',
            notes: values.notes || undefined,
          },
        }).unwrap();
        enqueueSnackbar(
          values.isPending ? 'Pago pendiente registrado' : 'Pago registrado correctamente',
          { variant: 'success' },
        );
      } else if (isConfirm) {
        if (!paymentId) return;
        await confirmPayment({
          reservationId,
          paymentId,
          amount: values.amount,
          notes: values.notes || undefined,
        }).unwrap();
        enqueueSnackbar('Pago confirmado correctamente', { variant: 'success' });
      } else {
        if (!paymentId) return;
        await refundPayment({
          reservationId,
          paymentId,
          amount: values.amount,
          notes: values.notes || undefined,
        }).unwrap();
        enqueueSnackbar('Reembolso procesado correctamente', { variant: 'success' });
      }
      onClose();
      onSuccess?.();
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'data' in err
          ? JSON.stringify((err as { data: unknown }).data)
          : 'Ocurrio un error';
      enqueueSnackbar(message, { variant: 'error' });
    }
  };

  const title = isPayment
    ? 'Agregar Pago'
    : isConfirm
      ? 'Confirmar Pago'
      : 'Reembolsar Pago';

  const submitLabel = isPayment
    ? 'Registrar Pago'
    : isConfirm
      ? 'Confirmar Pago'
      : 'Procesar Reembolso';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
          <TextField
            label="Monto"
            type="number"
            fullWidth
            inputProps={{
              step: '0.01',
              min: '0.01',
              ...(maxAmount != null ? { max: maxAmount } : {}),
            }}
            {...register('amount', {
              required: 'El monto es requerido',
              min: { value: 0.01, message: 'El monto debe ser mayor a 0' },
              ...(maxAmount != null
                ? { max: { value: maxAmount, message: `El monto maximo es ${maxAmount}` } }
                : {}),
            })}
            error={!!errors.amount}
            helperText={errors.amount?.message}
          />

          {isPayment && (
            <FormControl fullWidth>
              <InputLabel>Metodo de pago</InputLabel>
              <Controller
                name="method"
                control={control}
                rules={{ required: 'El metodo es requerido' }}
                render={({ field }) => (
                  <Select {...field} label="Metodo de pago">
                    {Object.entries(PAYMENT_METHOD_LABELS).map(([key, label]) => (
                      <MenuItem key={key} value={key}>
                        {label}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
            </FormControl>
          )}

          {isPayment && (
            <Controller
              name="isPending"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Switch
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  }
                  label="Registrar como pendiente"
                />
              )}
            />
          )}

          <TextField
            label="Notas"
            multiline
            rows={2}
            fullWidth
            {...register('notes')}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={isLoading}>
            {submitLabel}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
