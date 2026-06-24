import { useEffect, useState } from 'react';
import { Box, Paper, Typography, Grid, Chip, Stack, LinearProgress } from '@mui/material';
import PageHeader from '../components/common/PageHeader';
import { LoadingScreen, EmptyState } from '../components/common/States';
import { performanceApi } from '../api/services/performanceApi';
import { titleCase } from '../utils/formatters';

export default function Performance() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    performanceApi.myReviews().then(({ data }) => setReviews(data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingScreen label="Loading performance reviews…" />;

  return (
    <Box>
      <PageHeader title="Performance" subtitle="Quarterly reviews, KPI scores, and manager feedback." />

      {reviews.length === 0 ? (
        <EmptyState title="No reviews yet" description="Your quarterly performance reviews will appear here." />
      ) : (
        <Grid container spacing={2.5}>
          {reviews.map((r) => (
            <Grid item xs={12} md={6} key={r.id}>
              <Paper sx={{ p: 2.5 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{r.quarter} {r.year}</Typography>
                  <Chip label={`${r.rating} / 5 ★`} color="secondary" size="small" />
                </Stack>

                <Typography variant="caption" color="text.secondary">KPI Score</Typography>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                  <LinearProgress
                    variant="determinate"
                    value={Number(r.kpiScore)}
                    sx={{ flex: 1, height: 8, borderRadius: 4 }}
                  />
                  <Typography variant="body2" sx={{ fontFamily: 'mono', fontWeight: 700 }}>{r.kpiScore}</Typography>
                </Stack>

                {r.goals?.map((g, i) => (
                  <Stack key={i} direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
                    <Typography variant="body2" color="text.secondary">{g.title}</Typography>
                    <Chip label={titleCase(g.status)} size="small" variant="outlined" />
                  </Stack>
                ))}

                <Typography variant="body2" sx={{ mt: 1.5, fontStyle: 'italic' }} color="text.secondary">
                  "{r.managerFeedback}"
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
