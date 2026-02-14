import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
} from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import TimerIcon from '@mui/icons-material/Timer';
import type { CheckoutFriction } from '../../interfaces/types';

function formatSeconds(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return sec > 0 ? `${min}m ${sec}s` : `${min}m`;
}

interface CheckoutFrictionPanelProps {
  friction: CheckoutFriction;
}

export default function CheckoutFrictionPanel({ friction }: CheckoutFrictionPanelProps) {
  const hasLoginData = friction.guest_lookup_started > 0;
  const hasOtpData = friction.otp_requested > 0;
  const hasTimeData = friction.avg_checkout_seconds !== null;

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Friccion del checkout
        </Typography>

        {/* Login completion */}
        <Box sx={{ mb: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <LoginIcon sx={{ fontSize: 18, color: '#1976D2' }} />
            <Typography variant="body2" color="text.secondary">
              Login completado
            </Typography>
          </Box>
          {hasLoginData ? (
            <>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 0.5 }}>
                <Typography variant="h5" fontWeight={700}>
                  {friction.login_completion_pct}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {friction.guest_login_success} de {friction.guest_lookup_started} sesiones
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={friction.login_completion_pct}
                sx={{ height: 6, borderRadius: 3 }}
              />
            </>
          ) : (
            <Typography variant="body2" color="text.disabled">
              Sin datos de login en este periodo
            </Typography>
          )}
        </Box>

        {/* OTP completion */}
        <Box sx={{ mb: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <LockOpenIcon sx={{ fontSize: 18, color: '#7B1FA2' }} />
            <Typography variant="body2" color="text.secondary">
              OTP completado
            </Typography>
          </Box>
          {hasOtpData ? (
            <>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 0.5 }}>
                <Typography variant="h5" fontWeight={700}>
                  {friction.otp_completion_pct}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {friction.otp_verified} de {friction.otp_requested} solicitudes
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={friction.otp_completion_pct}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  '& .MuiLinearProgress-bar': { backgroundColor: '#7B1FA2' },
                }}
              />
            </>
          ) : (
            <Typography variant="body2" color="text.disabled">
              Sin datos de OTP en este periodo
            </Typography>
          )}
        </Box>

        {/* Average checkout time */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <TimerIcon sx={{ fontSize: 18, color: '#E65100' }} />
            <Typography variant="body2" color="text.secondary">
              Tiempo promedio de checkout
            </Typography>
          </Box>
          {hasTimeData ? (
            <Typography variant="h5" fontWeight={700}>
              {formatSeconds(friction.avg_checkout_seconds!)}
            </Typography>
          ) : (
            <Typography variant="body2" color="text.disabled">
              Sin datos de tiempo en este periodo
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
