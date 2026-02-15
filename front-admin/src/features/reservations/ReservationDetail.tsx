import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
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
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useSnackbar } from 'notistack';
import StatusChip from '../../components/StatusChip';
import ConfirmDialog from '../../components/ConfirmDialog';
import CheckInDialog from './CheckInDialog';
import PaymentDialog from './PaymentDialog';
import {
  useGetReservationQuery,
  useConfirmReservationMutation,
  useCheckInReservationMutation,
  useCheckOutReservationMutation,
  useCancelReservationMutation,
  useNoShowReservationMutation,
  useUploadVoucherMutation,
  useDeleteReservationMutation,
} from '../../services/reservationService';
import { formatDate, formatDateTime, formatCurrency } from '../../utils/formatters';
import {
  OPERATIONAL_STATUS,
  FINANCIAL_STATUS,
  ORIGIN_TYPE_LABELS,
  PAYMENT_METHOD_LABELS,
} from '../../utils/statusLabels';
import type { Payment } from '../../interfaces/types';

type ActionKey = 'confirm' | 'cancel' | 'check_out' | 'no_show' | 'delete';

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
  const [uploadVoucher] = useUploadVoucherMutation();
  const [deleteReservation] = useDeleteReservationMutation();

  const [voucherFile, setVoucherFile] = useState<File | null>(null);
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [voucherOpen, setVoucherOpen] = useState(false);

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
    mode: 'payment' | 'refund' | 'confirm';
    paymentId?: string;
    maxAmount?: number;
    defaultAmount?: string;
    autoConfirmReservation?: boolean;
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
        case 'check_out':
          await checkOutReservation(reservation.id).unwrap();
          enqueueSnackbar('Check-out realizado', { variant: 'success' });
          break;
        case 'no_show':
          await noShowReservation(reservation.id).unwrap();
          enqueueSnackbar('Marcada como no-show', { variant: 'success' });
          break;
        case 'delete':
          await deleteReservation(reservation.id).unwrap();
          enqueueSnackbar('Reservacion eliminada', { variant: 'success' });
          navigate('/reservations');
          return;
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

  const openConfirmPaymentDialog = (payment: Payment) => {
    setPaymentDialog({
      open: true,
      mode: 'confirm',
      paymentId: payment.id,
      defaultAmount: payment.amount,
    });
  };

  const openVoucherPaymentDialog = () => {
    if (!reservation) return;
    setPaymentDialog({
      open: true,
      mode: 'payment',
      defaultAmount: reservation.total_amount,
      autoConfirmReservation: true,
    });
  };

  const handlePaymentSuccess = async () => {
    if (!reservation || !paymentDialog.autoConfirmReservation) return;
    if (!['pending', 'incomplete'].includes(reservation.operational_status)) return;
    try {
      await confirmReservation(reservation.id).unwrap();
      enqueueSnackbar('Reservacion confirmada', { variant: 'success' });
    } catch {
      // Payment was created, reservation confirmation failed — user can confirm manually
    }
  };

  const handleUploadVoucher = async () => {
    if (!reservation || !voucherFile) return;
    try {
      await uploadVoucher({ reservationId: reservation.id, file: voucherFile }).unwrap();
      enqueueSnackbar('Comprobante subido exitosamente', { variant: 'success' });
      setVoucherFile(null);
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'data' in err
          ? JSON.stringify((err as { data: unknown }).data)
          : 'Error al subir comprobante';
      enqueueSnackbar(message, { variant: 'error' });
    }
  };

  const handleCheckIn = async (roomId?: string) => {
    if (!reservation) return;
    setCheckInOpen(false);
    try {
      const result = await checkInReservation({ id: reservation.id, room_id: roomId }).unwrap();
      const roomNumber = result.room_number;
      enqueueSnackbar(
        roomNumber
          ? `Check-in realizado - Habitacion ${roomNumber}`
          : 'Check-in realizado',
        { variant: 'success' },
      );
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'data' in err
          ? JSON.stringify((err as { data: unknown }).data)
          : 'Error al realizar check-in';
      enqueueSnackbar(message, { variant: 'error' });
    }
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
      {['incomplete', 'pending', 'confirmed', 'check_in', 'cancelled'].includes(status) && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Acciones
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {status === 'incomplete' && (
                <>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() =>
                      openAction(
                        'confirm',
                        'Confirmar reservacion',
                        'Esta seguro de que desea confirmar esta reservacion directamente?',
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
                        'Esta seguro de que desea cancelar esta reservacion incompleta?',
                      )
                    }
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() =>
                      openAction(
                        'delete',
                        'Eliminar reservacion',
                        'Esta accion es irreversible. Esta seguro de que desea eliminar esta reservacion?',
                      )
                    }
                  >
                    Eliminar
                  </Button>
                </>
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
                    onClick={() => setCheckInOpen(true)}
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
              {status === 'cancelled' && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() =>
                    openAction(
                      'delete',
                      'Eliminar reservacion',
                      'Esta accion es irreversible. Esta seguro de que desea eliminar esta reservacion?',
                    )
                  }
                >
                  Eliminar
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Voucher section */}
      {(reservation.voucher_image || reservation.payment_deadline || ['incomplete', 'pending'].includes(status) || ['pending_payment', 'partial'].includes(reservation.financial_status)) && (
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
                  onClick={() => setVoucherOpen(true)}
                  sx={{ maxWidth: 400, maxHeight: 400, objectFit: 'contain', borderRadius: 1, border: '1px solid', borderColor: 'divider', mb: 2, cursor: 'pointer', '&:hover': { opacity: 0.85 } }}
                />
                {['pending', 'incomplete'].includes(status) && (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={openVoucherPaymentDialog}
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
                {['pending_payment', 'partial'].includes(reservation.financial_status) && !['incomplete', 'pending'].includes(status) && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Pago parcial. Puede subir un nuevo comprobante para el saldo pendiente.
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                      <Button
                        variant="outlined"
                        component="label"
                        startIcon={<CloudUploadIcon />}
                      >
                        Subir nuevo comprobante
                        <input
                          type="file"
                          accept="image/*"
                          hidden
                          onChange={(e) => setVoucherFile(e.target.files?.[0] ?? null)}
                        />
                      </Button>
                      {voucherFile && (
                        <Typography variant="body2" color="text.secondary">
                          {voucherFile.name}
                        </Typography>
                      )}
                    </Box>
                    {voucherFile && (
                      <Box sx={{ mt: 2 }}>
                        <Box
                          component="img"
                          src={URL.createObjectURL(voucherFile)}
                          alt="Preview"
                          sx={{ maxWidth: 300, maxHeight: 300, objectFit: 'contain', borderRadius: 1, border: '1px solid', borderColor: 'divider', mb: 2 }}
                        />
                        <Box>
                          <Button variant="contained" onClick={handleUploadVoucher}>
                            Subir comprobante
                          </Button>
                        </Box>
                      </Box>
                    )}
                  </Box>
                )}
              </Box>
            ) : ['incomplete', 'pending'].includes(status) || ['pending_payment', 'partial'].includes(reservation.financial_status) ? (
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  El huesped aun no ha subido el comprobante. Puede subirlo manualmente.
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<CloudUploadIcon />}
                  >
                    Seleccionar archivo
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => setVoucherFile(e.target.files?.[0] ?? null)}
                    />
                  </Button>
                  {voucherFile && (
                    <Typography variant="body2" color="text.secondary">
                      {voucherFile.name}
                    </Typography>
                  )}
                </Box>
                {voucherFile && (
                  <Box sx={{ mt: 2 }}>
                    <Box
                      component="img"
                      src={URL.createObjectURL(voucherFile)}
                      alt="Preview"
                      sx={{ maxWidth: 300, maxHeight: 300, objectFit: 'contain', borderRadius: 1, border: '1px solid', borderColor: 'divider', mb: 2 }}
                    />
                    <Box>
                      <Button variant="contained" onClick={handleUploadVoucher}>
                        Subir comprobante
                      </Button>
                    </Box>
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

          {/* Balance summary */}
          {(() => {
            const totalPaid = reservation.payments
              .filter((p) => p.status === 'completed')
              .reduce((sum, p) => sum + parseFloat(p.amount), 0);
            const totalPending = reservation.payments
              .filter((p) => p.status === 'pending')
              .reduce((sum, p) => sum + parseFloat(p.amount), 0);
            const total = parseFloat(reservation.total_amount);
            const remaining = total - totalPaid;
            const currency = reservation.currency;

            return (
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                <Chip label={`Total: ${formatCurrency(total.toString(), currency)}`} variant="outlined" />
                <Chip label={`Pagado: ${formatCurrency(totalPaid.toString(), currency)}`} color="success" variant="outlined" />
                {totalPending > 0 && (
                  <Chip label={`Pendiente: ${formatCurrency(totalPending.toString(), currency)}`} color="warning" variant="outlined" />
                )}
                <Chip
                  label={`Por pagar: ${formatCurrency(remaining > 0 ? remaining.toString() : '0', currency)}`}
                  color={remaining > 0 ? 'error' : 'default'}
                  variant="outlined"
                />
              </Box>
            );
          })()}

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
                      {payment.status === 'pending' && (
                        <Button
                          size="small"
                          color="success"
                          onClick={() => openConfirmPaymentDialog(payment)}
                        >
                          Confirmar
                        </Button>
                      )}
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

      {/* Voucher lightbox */}
      {reservation.voucher_image && (
        <Dialog open={voucherOpen} onClose={() => setVoucherOpen(false)} maxWidth="lg">
          <Box
            component="img"
            src={reservation.voucher_image}
            alt="Voucher de pago"
            onClick={() => setVoucherOpen(false)}
            sx={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', cursor: 'pointer' }}
          />
        </Dialog>
      )}

      {/* Check-in dialog */}
      <CheckInDialog
        open={checkInOpen}
        reservationId={reservation.id}
        onConfirm={handleCheckIn}
        onCancel={() => setCheckInOpen(false)}
      />

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
        defaultAmount={paymentDialog.defaultAmount}
        onSuccess={handlePaymentSuccess}
      />
    </Box>
  );
}
