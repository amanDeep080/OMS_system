import { Box, Paper, Typography, Stack, Chip } from '@mui/material';
import PageHeader from '../components/common/PageHeader';
import { WorkOutlineOutlined as WorkOutlineOutlinedIcon } from '@mui/icons-material';

const OPEN_ROLES = [
  { title: 'Senior Software Engineer', department: 'Engineering', location: 'Lincoln, NE (Hybrid)' },
  { title: 'Product Marketing Manager', department: 'Marketing', location: 'Remote (US)' },
  { title: 'Logistics Coordinator', department: 'Logistics', location: 'Lincoln, NE (On-site)' },
  { title: 'Customer Success Associate', department: 'Customer Support', location: 'Remote (US)' },
];

export default function Recruitment() {
  return (
    <Box>
      <PageHeader title="Recruitment" subtitle="Open requisitions across Spreetail." />
      <Paper sx={{ p: 3 }}>
        <Stack spacing={2}>
          {OPEN_ROLES.map((role) => (
            <Stack
              key={role.title}
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                <WorkOutlineOutlinedIcon fontSize="small" color="secondary" />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{role.title}</Typography>
                  <Typography variant="caption" color="text.secondary">{role.location}</Typography>
                </Box>
              </Stack>
              <Chip size="small" label={role.department} variant="outlined" />
            </Stack>
          ))}
        </Stack>
        <Typography variant="caption" color="text.disabled" sx={{ mt: 3, display: 'block' }}>
          Full applicant tracking (candidate pipelines, interview scheduling, offer management) is on the
          roadmap for this module — this view shows current open requisitions.
        </Typography>
      </Paper>
    </Box>
  );
}
