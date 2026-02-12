import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useSnackbar } from 'notistack';
import StatusChip from '../../components/StatusChip';
import ConfirmDialog from '../../components/ConfirmDialog';
import PaymentDialog from './PaymentDialog';
import {
  useGetReservationQuery,
  useConfirmReservationMutation,
  useCheckInReservationMutation,
  useCheckOutReservationMutation,
  useCancelReservationMutation,
  useNoShowReservationMutation,
} from '../../services/reservationService';
import { formatDate, formatDateTime, formatCurrency } from '../../utils/formatters';
import {
  OPERATIONAL_STATUS,
  FINANCIAL_STATUS,
  ORIGIN_TYPE_LABELS,
  PAYMENT_METHOD_LABELS,
} from '../../utils/statusLabels';
import type { Payment } from '../../interfaces/types';

type ActionKey = 'confirm' | 'cancel' | 'check_in' | 'check_out' | 'no_show';

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  completed: 'Completado',
  refunded: 'Reembolsado',
  failed: 'Fallido',
};

export default function ReservationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const { data: reservation, isLoading, isError } = useGetReservationQuery(id!);

  const [confirmReservation] = useConfirmReservationMutation();
  const [checkInReservation] = useCheckInReservationMutation();
  const [checkOutReservation] = useCheckOutReservationMutation();
  const [cancelReservation] = useCancelReservationMutation();
  const [noShowReservation] = useNoShowReservationMutation();

  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: ActionKey | null;
    title: string;
    message: string;
  }>({ open: false, action: null, title: '', message: '' });

  // Payment dialog state
  const [paymentDialog, setPaymentDialog] = useState<{
    open: boolean;
    mode: 'payment' | 'refund';
    paymentId?: string;
    maxAmount?: number;
  }>({ open: false, mode: 'payment' });

  const openAction = (action: ActionKey, title: string, message: string) => {
    setConfirmDialog({ open: true, action, title, message });
  };

  const executeAction = async () => {
    if (!reservation || !confirmDialog.action) return;
    const action = confirmDialog.action;
    setConfirmDialog((prev) => ({ ...prev, open: false }));

    try {
      switch (action) {
        case 'confirm':
          await confirmReservation(reservation.id).unwrap();
          enqueueSnackbar('Reservacion confirmada', { variant: 'success' });
          break;
        case 'cancel':
          await cancelReservation(reservation.id).unwrap();
          enqueueSnackbar('Reservacion cancelada', { variant: 'success' });
          break;
        case 'check_in':
          await checkInReservation({ id: reservation.id }).unwrap();
          enqueueSnackbar('Check-in realizado', { variant: 'success' });
          break;
        case 'check_out':
          await checkOutReservation(reservation.id).unwrap();
          enqueueSnackbar('Check-out realizado', { variant: 'success' });
          break;
        case 'no_show':
          await noShowReservation(reservation.id).unwrap();
          enqueueSnackbar('Marcada como no-show', { variant: 'success' });
          break;
      }
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'data' in err
          ? JSON.stringify((err as { data: unknown }).data)
          : 'Ocurrio un error';
      enqueueSnackbar(message, { variant: 'error' });
    }
  };

  const openPaymentDialog = () => {
    setPaymentDialog({ open: true, mode: 'payment' });
  };

  const openRefundDialog = (payment: Payment) => {
    setPaymentDialog({
      open: true,
      mode: 'refund',
      paymentId: payment.id,
      maxAmount: parseFloat(payment.amount),
    });
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !reservation) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">No se pudo cargar la reservacion.</Alert>
      </Box>
    );
  }

  const status = reservation.operational_status;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate(-1)}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          {reservation.confirmation_code}
        </Typography>
        <StatusChip statusMap={OPERATIONAL_STATUS} value={reservation.operational_status} />
        <StatusChip statusMap={FINANCIAL_STATUS} value={reservation.financial_status} />
      </Box>

      {/* Info section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Informacion de la reservacion
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="caption" color="text.secondary">
                Huesped
              </Typography>
              <Typography>{reservation.guest_name}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="caption" color="text.secondary">
                Propiedad
              </Typography>
              <Typography>{reservation.property_name}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="caption" color="text.secondary">
                Tipo de habitacion
              </Typography>
              <Typography>{reservation.room_type_name}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="caption" color="text.secondary">
                Habitacion
              </Typography>
              <Typography>{reservation.room_number ?? 'Sin asignar'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="caption" color="text.secondary">
                Check-in
              </Typography>
              <Typography>{formatDate(reservation.check_in_date)}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="caption" color="text.secondary">
                Check-out
              </Typography>
              <Typography>{formatDate(reservation.check_out_date)}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="caption" color="text.secondary">
                Adultos / Ninos
              </Typography>
              <Typography>
                {reservation.adults} adultos, {reservation.children} ninos
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="caption" color="text.secondary">
                Origen
              </Typography>
              <Typography>
                {ORIGIN_TYPE_LABELS[reservation.origin_type] ?? reservation.origin_type}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="caption" color="text.secondary">
                Monto total
              </Typography>
              <Typography sx={{ fontWeight: 600 }}>
                {formatCurrency(reservation.total_amount, reservation.currency)}
              </Typography>
            </Grid>
            {reservation.special_requests && (
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">
                  Solicitudes especiales
                </Typography>
                <Typography>{reservation.special_requests}</Typography>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Actions bar */}
      {['incomplete', 'pending', 'confirmed', 'check_in'].includes(status) && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Acciones
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {status === 'incomplete' && (
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() =>
                    openAction(
                      'cancel',
                      'Cancelar reservacion',
                      'Esta seguro de que desea cancelar esta reservacion incompleta?',
                    )
                  }
                >
                  Cancelar
                </Button>
              )}
              {status === 'pending' && (
                <>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() =>
                      openAction(
                        'confirm',
                        'Confirmar reservacion',
                        'Esta seguro de que desea confirmar esta reservacion?',
                      )
                    }
                  >
                    Confirmar
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() =>
                      openAction(
                        'cancel',
                        'Cancelar reservacion',
                        'Esta seguro de que desea cancelar esta reservacion?',
                      )
                    }
                  >
                    Cancelar
                  </Button>
                </>
              )}
              {status === 'confirmed' && (
                <>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() =>
                      openAction(
                        'check_in',
                        'Realizar check-in',
                        'Esta seguro de que desea realizar el check-in?',
                      )
                    }
                  >
                    Check-in
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() =>
                      openAction(
                        'cancel',
                        'Cancelar reservacion',
                        'Esta seguro de que desea cancelar esta reservacion?',
                      )
                    }
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="outlined"
                    color="warning"
                    onClick={() =>
                      openAction(
                        'no_show',
                        'Marcar como no-show',
                        'Esta seguro de que desea marcar esta reservacion como no-show?',
                      )
                    }
                  >
                    No-show
                  </Button>
                </>
              )}
              {status === 'check_in' && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() =>
                    openAction(
                      'check_out',
                      'Realizar check-out',
                      'Esta seguro de que desea realizar el check-out?',
                    )
                  }
                >
                  Check-out
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Voucher section */}
      {(reservation.voucher_image || reservation.payment_deadline) && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Comprobante de pago
            </Typography>
            {reservation.payment_deadline && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Fecha limite: {formatDateTime(reservation.payment_deadline)}
              </Typography>
            )}
            {reservation.voucher_image ? (
              <Box>
                <Box
                  component="img"
                  src={reservation.voucher_image}
                  alt="Voucher de pago"
                  sx={{ maxWidth: 400, maxHeight: 400, objectFit: 'contain', borderRadius: 1, border: '1px solid', borderColor: 'divider', mb: 2 }}
                />
                {status === 'pending' && (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() =>
                        openAction(
                          'confirm',
                          'Confirmar reservacion',
                          'El comprobante de pago ha sido verificado. Confirmar esta reservacion?',
                        )
                      }
                    >
                      Confirmar pago
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() =>
                        openAction(
                          'cancel',
                          'Rechazar pago',
                          'El comprobante no es valido. Cancelar esta reservacion?',
                        )
                      }
                    >
                      Rechazar pago
                    </Button>
                  </Box>
                )}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                El huesped aun no ha subido el comprobante.
              </Typography>
            )}
          </CardContent>
        </Card>
      )}

      {/* Payments section */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Pagos</Typography>
            <Button variant="contained" size="small" onClick={openPaymentDialog}>
              Agregar pago
            </Button>
          </Box>
          <Divider sx={{ mb: 2 }} />
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Monto</TableCell>
                  <TableCell>Metodo</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Notas</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reservation.payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      {formatCurrency(payment.amount, payment.currency)}
                    </TableCell>
                    <TableCell>
                      {PAYMENT_METHOD_LABELS[payment.method] ?? payment.method}
                    </TableCell>
                    <TableCell>
                      {PAYMENT_STATUS_LABELS[payment.status] ?? payment.status}
                    </TableCell>
                    <TableCell>{formatDateTime(payment.processed_at)}</TableCell>
                    <TableCell>{payment.notes || '---'}</TableCell>
                    <TableCell align="right">
                      {payment.status === 'completed' && (
                        <Button
                          size="small"
                          color="warning"
                          onClick={() => openRefundDialog(payment)}
                        >
                          Reembolsar
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {reservation.payments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                      Sin pagos registrados
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Confirm dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={executeAction}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, open: false }))}
      />

      {/* Payment dialog */}
      <PaymentDialog
        open={paymentDialog.open}
        onClose={() => setPaymentDialog((prev) => ({ ...prev, open: false }))}
        reservationId={reservation.id}
        mode={paymentDialog.mode}
        paymentId={paymentDialog.paymentId}
        maxAmount={paymentDialog.maxAmount}
      />
    </Box>
  );
}
