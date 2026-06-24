import { Box, Paper, Stack, Typography, Switch, Avatar, Divider, Button } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme, selectThemeMode } from '../features/ui/uiSlice';
import { selectCurrentUser } from '../features/auth/authSlice';
import PageHeader from '../components/common/PageHeader';
import { initials, titleCase } from '../utils/formatters';
import { useAuth } from '../hooks/useAuth';

export default function Settings() {
  const dispatch = useDispatch();
  const themeMode = useSelector(selectThemeMode);
  const user = useSelector(selectCurrentUser);
  const { logout } = useAuth();
  const nameParts = (user?.employee?.fullName || '').split(' ');

  return (
    <Box>
      <PageHeader title="Settings" subtitle="Manage your profile and app preferences." />

      <Paper sx={{ p: 3, mb: 2.5 }}>
        <Stack direction="row" spacing={2.5} alignItems="center">
          <Avatar src={user?.employee?.profilePicture} sx={{ width: 64, height: 64 }}>
            {initials(nameParts[0], nameParts[1])}
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>{user?.employee?.fullName || user?.email}</Typography>
            <Typography variant="body2" color="text.secondary">{user?.email}</Typography>
            <Typography variant="caption" color="secondary.dark" sx={{ fontWeight: 700 }}>{titleCase(user?.role)}</Typography>
          </Box>
        </Stack>
      </Paper>

      <Paper sx={{ p: 3, mb: 2.5 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Appearance</Typography>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Dark mode</Typography>
            <Typography variant="caption" color="text.secondary">Switch between light and dark themes.</Typography>
          </Box>
          <Switch checked={themeMode === 'dark'} onChange={() => dispatch(toggleTheme())} />
        </Stack>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Session</Typography>
        <Divider sx={{ mb: 2 }} />
        <Button variant="outlined" color="error" onClick={logout}>Sign out</Button>
      </Paper>
    </Box>
  );
}
