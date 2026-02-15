import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle,
  MenuItem, TextField, Box,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useCreateInvoiceMutation } from '../../services/billingService';
import { useGetReservationsQuery } from '../../services/reservationService';
import { useAppSelector } from '../../store/hooks';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CreateInvoiceDialog({ open, onClose }: Props) {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const property = useAppSelector((s) => s.auth.activePropertyId);

  const [search, setSearch] = useState('');
  const [reservationId, setReservationId] = useState('');
  const [documentType, setDocumentType] = useState('boleta');

  const { data: reservations } = useGetReservationsQuery(
    { property: property ?? undefined, search: search || undefined, page: 1 },
    { skip: !open },
  );

  const [createInvoice, { isLoading }] = useCreateInvoiceMutation();

  const handleCreate = async () => {
    if (!reservationId) return;
    try {
      const invoice = await createInvoice({
        reservation_id: reservationId,
        document_type: documentType,
      }).unwrap();
      enqueueSnackbar('Comprobante creado', { variant: 'success' });
      onClose();
      navigate(`/billing/invoices/${invoice.id}`);
    } catch {
      enqueueSnackbar('Error al crear comprobante', { variant: 'error' });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Crear comprobante</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Buscar reservacion"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Codigo de confirmacion..."
            size="small"
          />
          <TextField
            select
            label="Reservacion"
            value={reservationId}
            onChange={(e) => setReservationId(e.target.value)}
            fullWidth
          >
            {(reservations?.results ?? []).map((r) => (
              <MenuItem key={r.id} value={r.id}>
                {r.confirmation_code} — {r.guest_name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Tipo de documento"
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            fullWidth
          >
            <MenuItem value="boleta">Boleta</MenuItem>
            <MenuItem value="factura">Factura</MenuItem>
          </TextField>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="contained"
          onClick={handleCreate}
          disabled={!reservationId || isLoading}
        >
          Crear
        </Button>
      </DialogActions>
    </Dialog>
  );
}
