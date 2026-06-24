import { Box, Stack, Typography } from '@mui/material';
import { colors } from '../../theme/tokens';

/**
 * The "Company Pulse" — a horizontal ledger-style ribbon that gives the dashboard
 * a single memorable signature element, instead of opening on another generic
 * 4-up stat-card row. Reads as a heartbeat/ticker for the org's daily attendance.
 */
export default function PulseStrip({ percentToday = 0, sparkline = [], totalEmployees = 0, presentToday = 0 }) {
  const points = sparkline.length > 1 ? sparkline : [percentToday, percentToday];
  const max = Math.max(...points, 100);
  const min = Math.min(...points, 0);
  const range = Math.max(max - min, 1);
  const width = 280;
  const height = 56;

  const coords = points.map((v, i) => {
    const x = (i / (points.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const path = `M${coords.join(' L')}`;
  const lastPoint = coords[coords.length - 1]?.split(',');

  return (
    <Box
      sx={{
        borderRadius: 2,
        p: { xs: 2.5, md: 3 },
        background: `linear-gradient(120deg, ${colors.navyDeep} 0%, ${colors.navy} 100%)`,
        color: '#fff',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'center' }}
        spacing={2}
      >
        <Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: colors.bronzeSoft,
                animation: 'pulse-dot 1.8s ease-in-out infinite',
                '@keyframes pulse-dot': {
                  '0%, 100%': { opacity: 1, boxShadow: `0 0 0 0 ${colors.bronzeSoft}66` },
                  '50%': { opacity: 0.6, boxShadow: `0 0 0 6px ${colors.bronzeSoft}00` },
                },
              }}
            />
            <Typography
              variant="caption"
              sx={{ letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.65)', fontFamily: 'mono' }}
            >
              Today's Company Pulse
            </Typography>
          </Stack>
          <Stack direction="row" alignItems="baseline" spacing={1.5} sx={{ mt: 0.5 }}>
            <Typography variant="h3" sx={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
              {percentToday}%
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              attendance · {presentToday} of {totalEmployees} checked in
            </Typography>
          </Stack>
        </Box>

        <Box sx={{ width: { xs: '100%', md: 280 }, flexShrink: 0 }}>
          <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} preserveAspectRatio="none">
            <path d={path} fill="none" stroke={colors.bronzeSoft} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            {lastPoint && <circle cx={lastPoint[0]} cy={lastPoint[1]} r="3.5" fill={colors.bronzeSoft} />}
          </svg>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
            Last {points.length} working days
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}
