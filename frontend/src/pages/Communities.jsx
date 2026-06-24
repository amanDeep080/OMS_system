import {
  Box, Paper, Typography, Grid, Card, CardHeader, Avatar, Button, Stack, Chip, Divider,
  List, ListItem, ListItemText, CardContent
} from '@mui/material';
import { Groups as GroupsIcon } from '@mui/icons-material';
import PageHeader from '../components/common/PageHeader';

const MOCK_CLUBS = [
  { id: 1, name: "React Enthusiasts", members: 450, category: "Tech", description: "Sharing the latest and greatest in the React ecosystem." },
  { id: 2, name: "Spreetail Runners", members: 120, category: "Fitness", description: "Weekly runs and marathon prep for all levels." },
  { id: 3, name: "Photography Club", members: 85, category: "Hobby", description: "Monthly photo walks and equipment sharing." },
  { id: 4, name: "AI & ML Community", members: 320, category: "Tech", description: "Exploring real-world applications of Generative AI." }
];

export default function Communities() {
  return (
    <Box sx={{ pb: 4 }}>
      <PageHeader title="Communities & Clubs" subtitle="Join groups with shared interests and grow your network." />

      <Grid container spacing={3}>
        {MOCK_CLUBS.map(club => (
          <Grid key={club.id} xs={12} sm={6} md={4}>
            <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardHeader
                avatar={<Avatar sx={{ bgcolor: 'primary.main' }}><GroupsIcon /></Avatar>}
                title={club.name}
                subheader={`${club.members} Members`}
                titleTypographyProps={{ fontWeight: 700 }}
              />
              <CardContent sx={{ pt: 0, flexGrow: 1 }}>
                <Chip label={club.category} size="small" variant="outlined" sx={{ mb: 1.5 }} />
                <Typography variant="body2" color="text.secondary">{club.description}</Typography>
              </CardContent>
              <Divider />
              <Box sx={{ p: 2 }}>
                <Button fullWidth variant="outlined">Join Community</Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Typography variant="h6" sx={{ fontWeight: 700, mt: 5, mb: 2 }}>Upcoming Community Events</Typography>
      <Paper sx={{ p: 0, borderRadius: 2 }}>
        <List sx={{ py: 0 }}>
          <ListItem
            divider
            secondaryAction={<Button variant="contained" size="small">RSVP</Button>}
            sx={{ py: 2 }}
          >
            <ListItemText
              primary="React 19 Workshop"
              secondary="Tomorrow · 3:00 PM · Online"
              primaryTypographyProps={{ fontWeight: 700 }}
            />
          </ListItem>
          <ListItem
            secondaryAction={<Button variant="contained" size="small">RSVP</Button>}
            sx={{ py: 2 }}
          >
            <ListItemText
              primary="Lincoln Park Run"
              secondary="Saturday · 8:00 AM · Lincoln Park"
              primaryTypographyProps={{ fontWeight: 700 }}
            />
          </ListItem>
        </List>
      </Paper>
    </Box>
  );
}
