import { useEffect, useState } from 'react';
import {
  Box, Paper, Typography, Chip, Stack, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, MenuItem,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { PushPinOutlined as PushPinOutlinedIcon } from '@mui/icons-material';
import PageHeader from '../components/common/PageHeader';
import { LoadingScreen } from '../components/common/States';
import { announcementApi } from '../api/services/announcementApi';
import { selectCurrentUser } from '../features/auth/authSlice';
import { formatDate, titleCase } from '../utils/formatters';

const CATEGORIES = ['hiring', 'results', 'event', 'office_update', 'holiday', 'recognition', 'general'];

export default function Announcements() {
  const user = useSelector(selectCurrentUser);
  const canPost = ['super_admin', 'hr'].includes(user?.role);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, control, reset } = useForm();

  function load() {
    announcementApi.list({ limit: 30 }).then(({ data }) => setItems(data.data)).finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function onSubmit(values) {
    await announcementApi.create(values);
    reset();
    setOpen(false);
    load();
  }

  if (loading) return <LoadingScreen label="Loading announcements…" />;

  return (
    <Box>
      <PageHeader
        title="Company Announcements"
        subtitle="Updates, results, and recognition from across Spreetail."
        actions={canPost && <Button variant="contained" onClick={() => setOpen(true)}>New announcement</Button>}
      />

      <Stack spacing={2}>
        {items.map((a) => (
          <Paper key={a.id} sx={{ p: 2.5 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Stack direction="row" spacing={1} alignItems="center">
                {a.isPinned && <PushPinOutlinedIcon fontSize="small" sx={{ color: 'secondary.main' }} />}
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{a.title}</Typography>
              </Stack>
              <Chip size="small" label={titleCase(a.category)} variant="outlined" />
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{a.body}</Typography>
            <Typography variant="caption" color="text.disabled" sx={{ mt: 1, display: 'block' }}>
              {formatDate(a.postedAt)}{a.author ? ` · ${a.author.firstName} ${a.author.lastName}` : ''}
            </Typography>
          </Paper>
        ))}
      </Stack>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>New announcement</DialogTitle>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 0.5 }}>
              <TextField label="Title" {...register('title', { required: true })} />
              <TextField label="Message" multiline rows={4} {...register('body', { required: true })} />
              <Controller
                name="category"
                control={control}
                defaultValue="general"
                render={({ field }) => (
                  <TextField select label="Category" {...field}>
                    {CATEGORIES.map((c) => <MenuItem key={c} value={c}>{titleCase(c)}</MenuItem>)}
                  </TextField>
                )}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Post</Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
