import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Box, Paper, Stack, Typography, TextField, Button, Alert } from '@mui/material';
import { Link } from 'react-router-dom';
import { authApi } from '../api/services/authApi';
import { colors } from '../theme/tokens';

export default function ForgotPassword() {
  const { register, handleSubmit } = useForm();
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(values) {
    setSubmitting(true);
    try {
      const { data } = await authApi.forgotPassword(values.email);
      setMessage(data.message);
    } catch {
      setMessage('If that email exists, a reset link has been sent.');
    }
    setSubmitting(false);
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${colors.navyDeep} 0%, ${colors.navy} 100%)`,
        p: 2,
      }}
    >
      <Paper sx={{ p: 4, width: '100%', maxWidth: 420, borderRadius: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>Reset your password</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Enter your work email and we'll send you a reset link.
        </Typography>
        {message && <Alert severity="info" sx={{ mb: 2 }}>{message}</Alert>}
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={2}>
            <TextField label="Work email" size="small" fullWidth {...register('email', { required: true })} />
            <Button type="submit" variant="contained" disabled={submitting}>
              {submitting ? 'Sending…' : 'Send reset link'}
            </Button>
            <Button component={Link} to="/login" variant="text">
              Back to sign in
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}
