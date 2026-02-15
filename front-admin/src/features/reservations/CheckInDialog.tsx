import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
} from '@mui/material';
import { useGetAvailableRoomsQuery } from '../../services/reservationService';

interface Props {
  open: boolean;
  reservationId: string;
  onConfirm: (roomId?: string) => void;
  onCancel: () => void;
}

export default function CheckInDialog({ open, reservationId, onConfirm, onCancel }: Props) {
  const { data: rooms, isLoading, isError } = useGetAvailableRoomsQuery(reservationId, {
    skip: !open,
  });
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');

  const handleConfirm = () => {
    onConfirm(selectedRoomId || undefined);
  };

  const handleAutoAssign = () => {
    onConfirm(undefined);
  };

  const noRooms = !isLoading && rooms && rooms.length === 0;

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
      <DialogTitle>Seleccionar habitacion para check-in</DialogTitle>
      <DialogContent>
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {isError && (
          <Alert severity="error" sx={{ mt: 1 }}>
            Error al cargar habitaciones disponibles.
          </Alert>
        )}

        {noRooms && (
          <Alert severity="warning" sx={{ mt: 1 }}>
            No hay habitaciones disponibles del tipo solicitado.
          </Alert>
        )}

        {rooms && rooms.length > 0 && (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Seleccione una habitacion o use la asignacion automatica.
            </Typography>
            <RadioGroup
              value={selectedRoomId}
              onChange={(e) => setSelectedRoomId(e.target.value)}
            >
              {rooms.map((room) => (
                <FormControlLabel
                  key={room.id}
                  value={room.id}
                  control={<Radio />}
                  label={
                    <Box>
                      <Typography variant="body1" component="span" sx={{ fontWeight: 500 }}>
                        Habitacion {room.number}
                      </Typography>
                      {room.floor && (
                        <Typography variant="body2" component="span" color="text.secondary" sx={{ ml: 1 }}>
                          Piso {room.floor}
                        </Typography>
                      )}
                      {room.active_bed_configuration_name && (
                        <Typography variant="body2" component="span" color="text.secondary" sx={{ ml: 1 }}>
                          - {room.active_bed_configuration_name}
                        </Typography>
                      )}
                    </Box>
                  }
                />
              ))}
            </RadioGroup>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancelar</Button>
        {rooms && rooms.length > 0 && (
          <>
            <Button onClick={handleAutoAssign} variant="outlined">
              Asignar automaticamente
            </Button>
            <Button
              onClick={handleConfirm}
              variant="contained"
              color="success"
              disabled={!selectedRoomId}
            >
              Confirmar check-in
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
