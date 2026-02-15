import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Button, Card, CardContent, Chip, CircularProgress, Divider,
  Grid, Link, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import BlockIcon from '@mui/icons-material/Block';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ReplayIcon from '@mui/icons-material/Replay';
import { useSnackbar } from 'notistack';
import StatusChip from '../../components/StatusChip';
import {
  useGetInvoiceQuery,
  useEmitInvoiceMutation,
  useVoidInvoiceMutation,
} from '../../services/billingService';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { INVOICE_STATUS, INVOICE_DOC_TYPE } from '../../utils/statusLabels';

export default function InvoiceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const { data: invoice, isLoading } = useGetInvoiceQuery(id!);
  const [emitInvoice, { isLoading: emitting }] = useEmitInvoiceMutation();
  const [voidInvoice, { isLoading: voiding }] = useVoidInvoiceMutation();

  if (isLoading) {
    return <Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box>;
  }

  if (!invoice) {
    return <Typography>Comprobante no encontrado</Typography>;
  }

  const canEmit = ['draft', 'error', 'rejected'].includes(invoice.status);
  const canVoid = ['accepted', 'rejected', 'error', 'draft'].includes(invoice.status);

  const handleEmit = async () => {
    try {
      await emitInvoice(id!).unwrap();
      enqueueSnackbar('Comprobante emitido', { variant: 'success' });
    } catch {
      enqueueSnackbar('Error al emitir', { variant: 'error' });
    }
  };

  const handleVoid = async () => {
    try {
      await voidInvoice(id!).unwrap();
      enqueueSnackbar('Comprobante anulado', { variant: 'success' });
    } catch {
      enqueueSnackbar('Error al anular', { variant: 'error' });
    }
  };

  return (
    <Box maxWidth={900}>
      {/* Header */}
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/billing')}>
          Volver
        </Button>
        <Typography variant="h5" sx={{ flexGrow: 1 }}>
          {invoice.numero_completo}
        </Typography>
        <StatusChip statusMap={INVOICE_STATUS} value={invoice.status} size="medium" />
        <Chip label={INVOICE_DOC_TYPE[invoice.document_type] ?? invoice.document_type} variant="outlined" />
      </Box>

      {/* Actions */}
      <Box display="flex" gap={1} mb={3}>
        {canEmit && (
          <Button
            variant="contained"
            startIcon={invoice.status === 'error' || invoice.status === 'rejected' ? <ReplayIcon /> : <SendIcon />}
            onClick={handleEmit}
            disabled={emitting}
          >
            {invoice.status === 'error' || invoice.status === 'rejected' ? 'Reintentar' : 'Emitir'}
          </Button>
        )}
        {canVoid && (
          <Button
            variant="outlined"
            color="error"
            startIcon={<BlockIcon />}
            onClick={handleVoid}
            disabled={voiding}
          >
            Anular
          </Button>
        )}
        {invoice.provider_document_url && (
          <Button
            variant="outlined"
            startIcon={<PictureAsPdfIcon />}
            component={Link}
            href={invoice.provider_document_url}
            target="_blank"
          >
            Descargar PDF
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        {/* Client info */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} mb={1}>Cliente</Typography>
              <InfoRow label="Tipo doc." value={invoice.cliente_tipo_documento} />
              <InfoRow label="Numero" value={invoice.cliente_numero_documento} />
              <InfoRow label="Razon social" value={invoice.cliente_razon_social} />
              <InfoRow label="Direccion" value={invoice.cliente_direccion} />
              <InfoRow label="Email" value={invoice.cliente_email} />
              {invoice.reservation_code && (
                <InfoRow label="Reservacion" value={invoice.reservation_code} />
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Tax breakdown */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} mb={1}>Desglose fiscal</Typography>
              <InfoRow label="Gravado" value={formatCurrency(invoice.total_gravado, invoice.currency)} />
              <InfoRow label="IGV" value={formatCurrency(invoice.total_igv, invoice.currency)} />
              <InfoRow label="Exonerado" value={formatCurrency(invoice.total_exonerado, invoice.currency)} />
              <InfoRow label="Inafecto" value={formatCurrency(invoice.total_inafecto, invoice.currency)} />
              <InfoRow label="Descuentos" value={formatCurrency(invoice.total_descuentos, invoice.currency)} />
              <Divider sx={{ my: 1 }} />
              <Box display="flex" justifyContent="space-between">
                <Typography fontWeight={700}>Total</Typography>
                <Typography fontWeight={700}>{formatCurrency(invoice.total, invoice.currency)}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Items table */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} mb={1}>Items</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Descripcion</TableCell>
                      <TableCell align="right">Cant.</TableCell>
                      <TableCell align="right">P. Unit.</TableCell>
                      <TableCell align="right">Subtotal</TableCell>
                      <TableCell align="right">IGV</TableCell>
                      <TableCell align="right">Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {invoice.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">{formatCurrency(item.unit_price, invoice.currency)}</TableCell>
                        <TableCell align="right">{formatCurrency(item.subtotal, invoice.currency)}</TableCell>
                        <TableCell align="right">{formatCurrency(item.igv, invoice.currency)}</TableCell>
                        <TableCell align="right">{formatCurrency(item.total, invoice.currency)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* SUNAT status */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} mb={1}>Estado SUNAT</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <InfoRow label="Ticket SUNAT" value={invoice.sunat_ticket || '—'} />
                  <InfoRow label="HTTP Status" value={invoice.provider_http_status ? String(invoice.provider_http_status) : '—'} />
                  <InfoRow label="Latencia" value={invoice.provider_latency_ms ? `${invoice.provider_latency_ms}ms` : '—'} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoRow label="Intentos" value={String(invoice.retry_count)} />
                  <InfoRow label="Ultimo intento" value={invoice.last_attempt_at ? formatDateTime(invoice.last_attempt_at) : '—'} />
                  <InfoRow label="Ultimo error" value={invoice.last_error || '—'} />
                </Grid>
              </Grid>
              {invoice.observaciones && (
                <>
                  <Divider sx={{ my: 1 }} />
                  <InfoRow label="Observaciones" value={invoice.observaciones} />
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <Box display="flex" justifyContent="space-between" py={0.5}>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
      <Typography variant="body2">{value || '—'}</Typography>
    </Box>
  );
}
