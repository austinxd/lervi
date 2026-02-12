import { useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import { useAddPaymentMutation, useRefundPaymentMutation } from '../../services/reservationService';
import { PAYMENT_METHOD_LABELS } from '../../utils/statusLabels';

interface Props {
  open: boolean;
  onClose: () => void;
  reservationId: string;
  mode: 'payment' | 'refund';
  paymentId?: string;
  maxAmount?: number;
}

interface PaymentFormValues {
  amount: string;
  method: string;
  notes: string;
}

interface RefundFormValues {
  amount: string;
  notes: string;
}

export default function PaymentDialog({
  open,
  onClose,
  reservationId,
  mode,
  paymentId,
  maxAmount,
}: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const [addPayment, { isLoading: isAdding }] = useAddPaymentMutation();
  const [refundPayment, { isLoading: isRefunding }] = useRefundPaymentMutation();

  const isPayment = mode === 'payment';
  const isLoading = isAdding || isRefunding;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<PaymentFormValues & RefundFormValues>({
    defaultValues: {
      amount: '',
      method: 'cash',
      notes: '',
    },
  });

  useEffect(() => {
    if (open) {
      reset({ amount: '', method: 'cash', notes: '' });
    }
  }, [open, reset]);

  const onSubmit = async (values: PaymentFormValues & RefundFormValues) => {
    try {
      if (isPayment) {
        await addPayment({
          reservationId,
          data: {
            amount: values.amount,
            method: values.method,
            notes: values.notes || undefined,
          },
        }).unwrap();
        enqueueSnackbar('Pago registrado correctamente', { variant: 'success' });
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
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'data' in err
          ? JSON.stringify((err as { data: unknown }).data)
          : 'Ocurrio un error';
      enqueueSnackbar(message, { variant: 'error' });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>
          {isPayment ? 'Agregar Pago' : 'Reembolsar Pago'}
        </DialogTitle>
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
            {isPayment ? 'Registrar Pago' : 'Procesar Reembolso'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
