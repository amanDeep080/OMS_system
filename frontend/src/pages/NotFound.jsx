import { Typography, Button, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <Stack alignItems="center" justifyContent="center" sx={{ minHeight: '100vh', textAlign: 'center', px: 2 }} spacing={2}>
      <Typography variant="h1" sx={{ fontWeight: 700, fontSize: '4rem' }}>404</Typography>
      <Typography variant="h6">This page doesn't exist.</Typography>
      <Typography variant="body2" color="text.secondary">The page you're looking for may have been moved or removed.</Typography>
      <Button variant="contained" onClick={() => navigate('/dashboard')}>Back to dashboard</Button>
    </Stack>
  );
}
