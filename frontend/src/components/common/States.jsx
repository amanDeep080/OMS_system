import { Box, CircularProgress, Stack, Typography } from '@mui/material';

export function LoadingScreen({ label = 'Loading…' }) {
  return (
    <Stack alignItems="center" justifyContent="center" sx={{ py: 8 }} spacing={2}>
      <CircularProgress size={28} thickness={4} />
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    </Stack>
  );
}

export function EmptyState({ title, description, action }) {
  return (
    <Box sx={{ textAlign: 'center', py: 8, px: 2 }}>
      <Typography variant="h6" sx={{ mb: 0.5 }}>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420, mx: 'auto' }}>
          {description}
        </Typography>
      )}
      {action && <Box sx={{ mt: 2 }}>{action}</Box>}
    </Box>
  );
}
