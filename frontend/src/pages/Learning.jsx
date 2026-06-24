import { useState } from 'react';
import {
  Box, Paper, Typography, Grid, Card, CardContent, LinearProgress,
  Stack, Button, Chip, TextField, InputAdornment
} from '@mui/material';
import { Search as SearchIcon, PlayCircle as PlayCircleIcon } from '@mui/icons-material';
import PageHeader from '../components/common/PageHeader';

const MOCK_COURSES = [
  { id: 1, title: "Modern Leadership Essentials", category: "Leadership", progress: 45, duration: "4h 30m" },
  { id: 2, title: "Advanced Distributed Systems", category: "Technical", progress: 0, duration: "12h 15m" },
  { id: 3, title: "Data-Driven Decision Making", category: "Analytics", progress: 100, duration: "3h 45m" },
  { id: 4, title: "Effective Communication in Remote Teams", category: "Soft Skills", progress: 10, duration: "2h 00m" }
];

export default function Learning() {
  const [search, setSearch] = useState('');

  return (
    <Box>
      <PageHeader title="Learning Management System" subtitle="Grow your skills with curated internal courses and training paths." />

      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search for courses, certifications, or skills..."
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>
          }}
        />
      </Paper>

      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Your Enrollments</Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {MOCK_COURSES.filter(c => c.progress > 0 && c.progress < 100).map(course => (
          <Grid item xs={12} sm={6} md={4} key={course.id}>
            <Card variant="outlined">
              <CardContent>
                <Chip label={course.category} size="small" color="primary" variant="outlined" sx={{ mb: 1.5 }} />
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>{course.title}</Typography>
                <Stack direction="row" justifyContent="space-between" sx={{ mt: 2, mb: 1 }}>
                  <Typography variant="caption" color="text.secondary">Progress</Typography>
                  <Typography variant="caption" fontWeight={700}>{course.progress}%</Typography>
                </Stack>
                <LinearProgress variant="determinate" value={course.progress} sx={{ height: 6, borderRadius: 3 }} />
                <Button fullWidth variant="contained" sx={{ mt: 2 }} startIcon={<PlayCircleIcon />}>Continue</Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Explore New Courses</Typography>
      <Grid container spacing={3}>
        {MOCK_COURSES.map(course => (
          <Grid item xs={12} sm={6} md={3} key={course.id}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" fontWeight={700} noWrap>{course.title}</Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>{course.duration} · {course.category}</Typography>
                <Button fullWidth variant="outlined" size="small" sx={{ mt: 2 }}>View Details</Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
