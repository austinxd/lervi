import { useState } from 'react';
import {
  Box, Button, Card, CardContent, Chip, Dialog, DialogActions,
  DialogContent, DialogTitle, IconButton, MenuItem, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, TextField, Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useForm, Controller } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import ConfirmDialog from '../../components/ConfirmDialog';
import type { BankAccount } from '../../interfaces/types';

interface FormData {
  bank_name: string;
  account_holder: string;
  account_number: string;
  cci: string;
  currency: string;
  is_active: boolean;
  sort_order: number;
}

const CURRENCY_OPTIONS = [
  { value: 'PEN', label: 'Soles (PEN)' },
  { value: 'USD', label: 'Dolares (USD)' },
];

interface BankAccountTableProps {
  accounts: BankAccount[];
  isLoading: boolean;
  onCreate: (data: FormData) => Promise<void>;
  onUpdate: (id: string, data: FormData) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  title: string;
  emptyMessage: string;
}

export default function BankAccountTable({
  accounts,
  isLoading,
  onCreate,
  onUpdate,
  onDelete,
  title,
  emptyMessage,
}: BankAccountTableProps) {
  const { enqueueSnackbar } = useSnackbar();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string }>({
    open: false,
    id: '',
  });

  const { control, handleSubmit, reset } = useForm<FormData>({
    defaultValues: {
      bank_name: '',
      account_holder: '',
      account_number: '',
      cci: '',
      currency: 'PEN',
      is_active: true,
      sort_order: 0,
    },
  });

  const openCreate = () => {
    setEditingAccount(null);
    reset({
      bank_name: '',
      account_holder: '',
      account_number: '',
      cci: '',
      currency: 'PEN',
      is_active: true,
      sort_order: 0,
    });
    setDialogOpen(true);
  };

  const openEdit = (account: BankAccount) => {
    setEditingAccount(account);
    reset({
      bank_name: account.bank_name,
      account_holder: account.account_holder,
      account_number: account.account_number,
      cci: account.cci,
      currency: account.currency,
      is_active: account.is_active,
      sort_order: account.sort_order,
    });
    setDialogOpen(true);
  };

  const onSubmit = async (data: FormData) => {
    try {
      if (editingAccount) {
        await onUpdate(editingAccount.id, data);
        enqueueSnackbar('Cuenta bancaria actualizada', { variant: 'success' });
      } else {
        await onCreate(data);
        enqueueSnackbar('Cuenta bancaria creada', { variant: 'success' });
      }
      setDialogOpen(false);
    } catch {
      enqueueSnackbar('Error al guardar la cuenta bancaria', { variant: 'error' });
    }
  };

  const handleDelete = async () => {
    try {
      await onDelete(deleteDialog.id);
      enqueueSnackbar('Cuenta bancaria eliminada', { variant: 'success' });
    } catch {
      enqueueSnackbar('Error al eliminar', { variant: 'error' });
    }
    setDeleteDialog({ open: false, id: '' });
  };

  return (
    <>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">{title}</Typography>
            <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={openCreate}>
              Agregar
            </Button>
          </Box>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Banco</TableCell>
                  <TableCell>Titular</TableCell>
                  <TableCell>N° Cuenta</TableCell>
                  <TableCell>CCI</TableCell>
                  <TableCell>Moneda</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {accounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell>{account.bank_name}</TableCell>
                    <TableCell>{account.account_holder}</TableCell>
                    <TableCell sx={{ fontFamily: 'monospace' }}>{account.account_number}</TableCell>
                    <TableCell sx={{ fontFamily: 'monospace' }}>{account.cci || '---'}</TableCell>
                    <TableCell>{account.currency}</TableCell>
                    <TableCell>
                      <Chip
                        label={account.is_active ? 'Activa' : 'Inactiva'}
                        color={account.is_active ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => openEdit(account)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => setDeleteDialog({ open: true, id: account.id })}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {!isLoading && accounts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                      {emptyMessage}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>
            {editingAccount ? 'Editar Cuenta Bancaria' : 'Nueva Cuenta Bancaria'}
          </DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
            <Controller
              name="bank_name"
              control={control}
              rules={{ required: 'Requerido' }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Nombre del banco"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  placeholder="BCP, Interbank, BBVA..."
                  fullWidth
                />
              )}
            />
            <Controller
              name="account_holder"
              control={control}
              rules={{ required: 'Requerido' }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Titular de la cuenta"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  fullWidth
                />
              )}
            />
            <Controller
              name="account_number"
              control={control}
              rules={{ required: 'Requerido' }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Numero de cuenta"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  fullWidth
                />
              )}
            />
            <Controller
              name="cci"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="CCI (interbancario)" fullWidth />
              )}
            />
            <Controller
              name="currency"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Moneda" select fullWidth>
                  {CURRENCY_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                  ))}
                </TextField>
              )}
            />
            <Controller
              name="sort_order"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Orden" type="number" fullWidth />
              )}
            />
            <Controller
              name="is_active"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  value={field.value ? 'true' : 'false'}
                  onChange={(e) => field.onChange(e.target.value === 'true')}
                  label="Estado"
                  select
                  fullWidth
                >
                  <MenuItem value="true">Activa</MenuItem>
                  <MenuItem value="false">Inactiva</MenuItem>
                </TextField>
              )}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button type="submit" variant="contained">Guardar</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete confirm */}
      <ConfirmDialog
        open={deleteDialog.open}
        title="Eliminar cuenta bancaria"
        message="Esta seguro de que desea eliminar esta cuenta bancaria? Esta accion no se puede deshacer."
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialog({ open: false, id: '' })}
      />
    </>
  );
}
