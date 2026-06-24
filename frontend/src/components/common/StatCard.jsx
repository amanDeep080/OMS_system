import { Box, Paper, Stack, Typography } from '@mui/material';

export default function StatCard({ label, value, delta, deltaLabel, icon, accent = 'primary.main' }) {
  return (
    <Paper sx={{ p: 2.5, height: '100%' }}>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Stack spacing={0.5}>
          <Typography
            variant="caption"
            sx={{
              fontFamily: 'mono',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'text.secondary',
              display: 'block'
            }}
          >
            {label}
          </Typography>
          <Typography variant="h4" sx={{ fontFamily: 'inherit', fontVariantNumeric: 'tabular-nums', fontWeight: 700 }}>
            {value}
          </Typography>
          {delta !== undefined && (
            <Typography variant="caption" sx={{ color: delta >= 0 ? 'success.main' : 'error.main', fontWeight: 600, display: 'block' }}>
              {delta >= 0 ? '▲' : '▼'} {Math.abs(delta)}% {deltaLabel}
            </Typography>
          )}
        </Stack>
        {icon && (
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: accent,
              color: '#fff',
              opacity: 0.9,
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
        )}
      </Stack>
    </Paper>
  );
}
