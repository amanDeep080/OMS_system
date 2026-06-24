import { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Stack, Avatar, TextField, Button, IconButton,
  Card, CardHeader, CardContent, CardActions, Divider, List, ListItem,
  ListItemAvatar, ListItemText, Chip, Grid, CircularProgress
} from '@mui/material';
import {
  ThumbUp as ThumbUpIcon,
  ChatBubble as ChatBubbleIcon,
  EmojiEvents as EmojiEventsIcon
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../features/auth/authSlice';
import PageHeader from '../components/common/PageHeader';
import { socialApi } from '../api/services/socialApi';
import { growthApi } from '../api/services/growthApi';
import { initials, formatDate } from '../utils/formatters';

export default function SocialFeed() {
  const user = useSelector(selectCurrentUser);
  const [posts, setPosts] = useState([]);
  const [recognitions, setRecognitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');

  const loadData = async () => {
    try {
      const [postRes, recRes] = await Promise.all([
        socialApi.listPosts(),
        growthApi.listRecognitions()
      ]);
      setPosts(postRes.data.data);
      setRecognitions(recRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePost = async () => {
    if (!newPost.trim()) return;
    try {
      await socialApi.createPost({ content: newPost, type: 'update' });
      setNewPost('');
      loadData();
    } catch (err) {
      alert('Failed to post');
    }
  };

  if (loading) return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>;

  return (
    <Box sx={{ pb: 8 }}>
      <PageHeader title="Social Hub" subtitle="Stay connected with your colleagues across the globe." />

      <Grid container spacing={3}>
        <Grid xs={12} md={8}>
          <Paper sx={{ p: 2.5, mb: 3, borderRadius: 2 }}>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
              <Avatar src={user?.employee?.profilePicture} sx={{ width: 44, height: 44 }}>
                {initials(user?.employee?.firstName || '', user?.employee?.lastName || '')}
              </Avatar>
              <TextField
                fullWidth
                placeholder={`What's on your mind, ${user?.employee?.firstName || 'User'}?`}
                variant="outlined"
                size="small"
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 4, bgcolor: 'action.hover' } }}
              />
              <Button variant="contained" onClick={handlePost} sx={{ borderRadius: 4, px: 3 }}>Post</Button>
            </Stack>
          </Paper>

          <Stack spacing={3}>
            {posts.map(post => (
              <Card key={post.id} variant="outlined" sx={{ borderRadius: 2 }}>
                <CardHeader
                  avatar={<Avatar src={post.author?.profilePicture}>{initials(post.author?.firstName || '', post.author?.lastName || '')}</Avatar>}
                  title={
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {post.author?.firstName} {post.author?.lastName}
                    </Typography>
                  }
                  subheader={formatDate(post.createdAt)}
                />
                <CardContent sx={{ pt: 0 }}>
                  <Typography variant="body1" sx={{ color: 'text.primary' }}>{post.content}</Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap' }}>
                    {(post.hashtags || []).map(h => <Chip key={h} label={`#${h}`} size="small" variant="outlined" color="primary" sx={{ borderRadius: 1.5 }} />)}
                  </Stack>
                </CardContent>
                <Divider />
                <CardActions sx={{ px: 2, py: 1 }}>
                  <Button size="small" startIcon={<ThumbUpIcon fontSize="small" />} color="inherit">
                    {post.reactions?.length || 0} Likes
                  </Button>
                  <Button size="small" startIcon={<ChatBubbleIcon fontSize="small" />} color="inherit">
                    {post.comments?.length || 0} Comments
                  </Button>
                </CardActions>
                {post.comments?.length > 0 && (
                  <Box sx={{ bgcolor: 'action.hover', p: 2 }}>
                    <List dense sx={{ py: 0 }}>
                      {post.comments.slice(0, 3).map(c => (
                        <ListItem key={c.id} sx={{ px: 0, py: 1, alignItems: 'flex-start' }}>
                          <ListItemAvatar sx={{ minWidth: 40 }}>
                            <Avatar sx={{ width: 28, height: 28, fontSize: '0.7rem' }}>{initials(c.author?.firstName || '', c.author?.lastName || '')}</Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={<Typography variant="caption" sx={{ fontWeight: 800 }}>{c.author?.firstName} {c.author?.lastName}</Typography>}
                            secondary={<Typography variant="body2" sx={{ color: 'text.primary' }}>{c.content}</Typography>}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
              </Card>
            ))}
          </Stack>
        </Grid>

        <Grid xs={12} md={4}>
          <Paper sx={{ p: 2.5, mb: 3, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Kudos Wall 🏆</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Celebrate your teammates' achievements.</Typography>
            <List sx={{ py: 0 }}>
              {(recognitions || []).map(r => (
                <ListItem key={r.id} divider sx={{ px: 0, py: 2 }}>
                  <ListItemAvatar>
                    <Avatar src={r.receiver?.profilePicture} sx={{ border: '2px solid', borderColor: 'secondary.main' }}>
                      {initials(r.receiver?.firstName || '', r.receiver?.lastName || '')}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {r.receiver?.firstName} received Kudos
                      </Typography>
                    }
                    secondary={r.message}
                  />
                </ListItem>
              ))}
            </List>
            <Button fullWidth variant="outlined" sx={{ mt: 2, borderRadius: 2 }}>Give Kudos</Button>
          </Paper>

          <Paper sx={{ p: 2.5, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Active Communities</Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap' }}>
              <Chip label="#Engineering" clickable sx={{ borderRadius: 1.5 }} />
              <Chip label="#ReactDevs" clickable sx={{ borderRadius: 1.5 }} />
              <Chip label="#ProductStrategy" clickable sx={{ borderRadius: 1.5 }} />
              <Chip label="#Wellness" clickable sx={{ borderRadius: 1.5 }} />
            </Stack>
            <Button fullWidth size="small" color="primary" sx={{ mt: 2 }}>Explore All</Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
