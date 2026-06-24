import { Box, Paper, Typography, Grid, LinearProgress, Stack, Chip, Card, CardContent, Divider, Button, List, ListItem, ListItemAvatar, Avatar, ListItemText } from '@mui/material';
import { TrendingUp as TrendingUpIcon, School as SchoolIcon, WorkspacePremium as WorkspacePremiumIcon } from '@mui/icons-material';
import PageHeader from '../components/common/PageHeader';

export default function CareerGrowth() {
  return (
    <Box>
      <PageHeader title="Career & Growth" subtitle="Map your path to the next level at Spreetail." />

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>Current Progression</Typography>
            <Box sx={{ mt: 2 }}>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography variant="body2" fontWeight={600}>Associate → Senior Associate</Typography>
                <Typography variant="body2" color="primary" fontWeight={700}>75% Ready</Typography>
              </Stack>
              <LinearProgress variant="determinate" value={75} sx={{ height: 10, borderRadius: 5 }} />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                You have completed 3/4 required certifications for the next level.
              </Typography>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography variant="subtitle1" fontWeight={700} gutterBottom>Required Skills for Next Level</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
              <Chip label="Advanced React" color="success" size="small" />
              <Chip label="System Design" color="success" size="small" />
              <Chip label="Project Management" variant="outlined" size="small" />
              <Chip label="Cloud Architecture" variant="outlined" size="small" />
            </Stack>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>Personal OKRs (Q3)</Typography>
            <Stack spacing={2} sx={{ mt: 2 }}>
              <OKRItem title="Complete the AWS Solutions Architect Certification" progress={80} />
              <OKRItem title="Lead 2 team-wide knowledge sharing sessions" progress={50} />
              <OKRItem title="Improve unit test coverage by 15% in Project X" progress={100} />
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, mb: 3, bgcolor: 'primary.main', color: 'white' }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>Mentorship</Typography>
            <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>Connect with experienced leaders to accelerate your growth.</Typography>
            <Stack direction="row" alignItems="center" spacing={2}>
              <TrendingUpIcon />
              <Box>
                <Typography variant="body2" fontWeight={600}>Active Program</Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>Mentee of Michael Manager</Typography>
              </Box>
            </Stack>
            <Button fullWidth variant="contained" color="secondary" sx={{ mt: 2, fontWeight: 700 }}>Find a Mentor</Button>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>Top Learning Resources</Typography>
            <List>
              <LearningItem icon={<SchoolIcon />} title="Advanced Backend Patterns" type="Course" />
              <LearningItem icon={<WorkspacePremiumIcon />} title="Spreetail Leadership Program" type="Certification" />
              <LearningItem icon={<SchoolIcon />} title="Full Stack Performance Tuning" type="Video Series" />
            </List>
            <Button fullWidth variant="outlined" sx={{ mt: 1 }}>View LMS</Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

function OKRItem({ title, progress }) {
  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
        <Typography variant="body2">{title}</Typography>
        <Typography variant="caption" fontWeight={700}>{progress}%</Typography>
      </Stack>
      <LinearProgress variant="determinate" value={progress} sx={{ height: 4 }} />
    </Box>
  );
}

function LearningItem({ icon, title, type }) {
  return (
    <ListItem sx={{ px: 0 }}>
      <ListItemAvatar>
        <Avatar sx={{ bgcolor: 'action.hover', color: 'primary.main' }}>{icon}</Avatar>
      </ListItemAvatar>
      <ListItemText primary={title} secondary={type} primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }} />
    </ListItem>
  );
}
