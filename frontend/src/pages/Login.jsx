import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Paper, Stack, Typography, TextField, Button, Alert, Divider, Chip,
} from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { colors } from '../theme/tokens';

const DEMO_ACCOUNTS = [
  { label: 'Super Admin', email: 'admin@spreetail.com', password: 'Admin@123' },
  { label: 'HR', email: 'hr@spreetail.com', password: 'Hr@123' },
  { label: 'Manager', email: 'manager@spreetail.com', password: 'Manager@123' },
  { label: 'Employee', email: 'employee@spreetail.com', password: 'Employee@123' },
];

export default function Login() {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(values) {
    setSubmitting(true);
    setServerError('');
    const result = await login(values.email, values.password);
    setSubmitting(false);
    if (result.success) {
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
    } else {
      setServerError(result.message);
    }
  }

  function fillDemo(account) {
    setValue('email', account.email);
    setValue('password', account.password);
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${colors.navyDeep} 0%, ${colors.navy} 55%, #2A4A75 100%)`,
        p: 2,
      }}
    >
      <Paper sx={{ width: '100%', maxWidth: 920, display: 'flex', overflow: 'hidden', borderRadius: 3 }}>
        {/* Left brand panel */}
        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            justifyContent: 'space-between',
            width: 360,
            p: 4,
            color: '#fff',
            background: `linear-gradient(160deg, ${colors.navyDeep} 0%, ${colors.ink} 100%)`,
          }}
        >
          <Box>
            <Stack direction="row" spacing={1.2} alignItems="center" sx={{ mb: 5 }}>
              <Box
                component="img"
                src="https://media.licdn.com/dms/image/v2/D4E0BAQGu7uBQZxfc4Q/company-logo_200_200/B4EZ4sWoVYHcAE-/0/1778860590652/spreetail_logo?e=2147483647&v=beta&t=FyphvtiY39aEz_OtaeDlqvptLaUqlQmqq4Kf4Zomong"
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '7px',
                  objectFit: 'contain'
                }}
              />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Spreetail</Typography>
            </Stack>
            <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1.25, mb: 2 }}>
              One system of record for every person at Spreetail.
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.65)' }}>
              Attendance, leave, payroll, and performance — all in one place,
              built for the way HR actually works.
            </Typography>
          </Box>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>
            © {new Date().getFullYear()} Spreetail, Inc. Internal use only.
          </Typography>
        </Box>

        {/* Right form panel */}
        <Box sx={{ flex: 1, p: { xs: 3, md: 5 } }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>Sign in</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Welcome back. Enter your credentials to continue.
          </Typography>

          {serverError && <Alert severity="error" sx={{ mb: 2 }}>{serverError}</Alert>}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <Stack spacing={2}>
              <TextField
                label="Work email"
                fullWidth
                size="small"
                error={Boolean(errors.email)}
                helperText={errors.email?.message}
                {...register('email', { required: 'Email is required' })}
              />
              <TextField
                label="Password"
                type="password"
                fullWidth
                size="small"
                error={Boolean(errors.password)}
                helperText={errors.password?.message}
                {...register('password', { required: 'Password is required' })}
              />
              <Stack direction="row" justifyContent="flex-end">
                <Typography
                  variant="caption"
                  color="secondary.dark"
                  sx={{ cursor: 'pointer', fontWeight: 600 }}
                  onClick={() => navigate('/forgot-password')}
                >
                  Forgot password?
                </Typography>
              </Stack>
              <Button type="submit" variant="contained" size="large" disabled={submitting} sx={{ py: 1.1 }}>
                {submitting ? 'Signing in…' : 'Sign in'}
              </Button>
            </Stack>
          </Box>

          <Divider sx={{ my: 3 }}>
            <Typography variant="caption" color="text.secondary">DEMO ACCOUNTS</Typography>
          </Divider>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {DEMO_ACCOUNTS.map((acc) => (
              <Chip
                key={acc.email}
                label={acc.label}
                size="small"
                variant="outlined"
                onClick={() => fillDemo(acc)}
                sx={{ cursor: 'pointer' }}
              />
            ))}
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}
