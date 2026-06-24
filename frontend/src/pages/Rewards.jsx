import { useState } from 'react';
import { Box, Paper, Typography, Grid, Card, CardMedia, CardContent, CardActions, Button, Chip, Stack } from '@mui/material';
import { CardGiftcard as CardGiftcardIcon } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../features/auth/authSlice';
import PageHeader from '../components/common/PageHeader';

const MOCK_REWARDS = [
  { id: 1, title: "Amazon Gift Card $50", cost: 500, category: "Gift Card", image: "https://images.unsplash.com/photo-1549463591-14763f116a4c?auto=format&fit=crop&w=300&q=80" },
  { id: 2, title: "Spreetail Branded Hoodie", cost: 800, category: "Swag", image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=300&q=80" },
  { id: 3, title: "Extra Day of PTO", cost: 2000, category: "Leave", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&q=80" },
  { id: 4, title: "Tech Equipment Credit $100", cost: 1200, category: "Equipment", image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=300&q=80" }
];

export default function Rewards() {
  const user = useSelector(selectCurrentUser);
  const points = user?.employee?.rewardPoints || 1250; // Mock points

  return (
    <Box>
      <PageHeader title="Rewards Marketplace" subtitle="Redeem your hard-earned points for swag, gift cards, and more." />

      <Paper sx={{ p: 3, mb: 4, bgcolor: 'secondary.main', color: 'secondary.contrastText' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" fontWeight={800}>{points}</Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>Available Reward Points</Typography>
          </Box>
          <Button variant="contained" color="primary" startIcon={<CardGiftcardIcon />}>View Transactions</Button>
        </Stack>
      </Paper>

      <Grid container spacing={3}>
        {MOCK_REWARDS.map(reward => (
          <Grid item xs={12} sm={6} md={3} key={reward.id}>
            <Card variant="outlined">
              <CardMedia component="img" height="140" image={reward.image} alt={reward.title} />
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} noWrap>{reward.title}</Typography>
                <Chip label={reward.category} size="small" sx={{ mt: 1, mb: 2 }} />
                <Typography variant="h6" color="primary" fontWeight={800}>{reward.cost} pts</Typography>
              </CardContent>
              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button fullWidth variant="outlined" disabled={points < reward.cost}>Redeem</Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
