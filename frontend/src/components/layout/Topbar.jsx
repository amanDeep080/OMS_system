import { useState } from 'react';
import {
  AppBar, Toolbar, IconButton, InputBase, Box, Stack, Avatar, Menu, MenuItem,
  Typography, Badge, Tooltip, Divider, ListItemIcon,
} from '@mui/material';
import {
  MenuOutlined as MenuOutlinedIcon,
  SearchOutlined as SearchOutlinedIcon,
  DarkModeOutlined as DarkModeOutlinedIcon,
  LightModeOutlined as LightModeOutlinedIcon,
  NotificationsOutlined as NotificationsOutlinedIcon,
  LogoutOutlined as LogoutOutlinedIcon,
  PersonOutlineOutlined as PersonOutlineOutlinedIcon
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toggleTheme, selectThemeMode, toggleSidebar } from '../../features/ui/uiSlice';
import { selectCurrentUser } from '../../features/auth/authSlice';
import { useAuth } from '../../hooks/useAuth';
import { initials, titleCase } from '../../utils/formatters';
import NotificationsPanel from './NotificationsPanel';

export default function Topbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const themeMode = useSelector(selectThemeMode);
  const user = useSelector(selectCurrentUser);
  const { logout } = useAuth();

  const [profileAnchor, setProfileAnchor] = useState(null);
  const [notifAnchor, setNotifAnchor] = useState(null);

  // Safely extract name info
  const firstName = user?.employee?.firstName || '';
  const lastName = user?.employee?.lastName || '';
  const fullName = user?.employee?.fullName || (firstName ? `${firstName} ${lastName}`.trim() : (user?.email || 'User'));
  const initialsText = firstName ? initials(firstName, lastName) : (user?.email ? user.email.substring(0, 2).toUpperCase() : '??');

  return (
    <AppBar
      position="sticky"
      color="transparent"
      sx={{ bgcolor: 'background.paper', backdropFilter: 'blur(6px)', zIndex: (theme) => theme.zIndex.drawer + 1 }}
    >
      <Toolbar sx={{ gap: 1.5 }}>
        <IconButton onClick={() => dispatch(toggleSidebar())} size="small">
          <MenuOutlinedIcon fontSize="small" />
        </IconButton>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            bgcolor: 'action.hover',
            borderRadius: 2,
            px: 1.5,
            py: 0.6,
            width: { xs: 160, sm: 320 },
          }}
        >
          <SearchOutlinedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
          <InputBase placeholder="Search people, tasks…" fullWidth sx={{ fontSize: '0.875rem' }} />
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        <Tooltip title={themeMode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}>
          <IconButton onClick={() => dispatch(toggleTheme())} size="small">
            {themeMode === 'light' ? <DarkModeOutlinedIcon fontSize="small" /> : <LightModeOutlinedIcon fontSize="small" />}
          </IconButton>
        </Tooltip>

        <Tooltip title="Notifications">
          <IconButton size="small" onClick={(e) => setNotifAnchor(e.currentTarget)}>
            <Badge color="secondary" variant="dot">
              <NotificationsOutlinedIcon fontSize="small" />
            </Badge>
          </IconButton>
        </Tooltip>
        <NotificationsPanel anchorEl={notifAnchor} onClose={() => setNotifAnchor(null)} />

        <Stack
          direction="row"
          spacing={1}
          onClick={(e) => setProfileAnchor(e.currentTarget)}
          sx={{ cursor: 'pointer', pl: 0.5, alignItems: 'center' }}
        >
          <Avatar
            src={user?.employee?.profilePicture}
            sx={{ width: 32, height: 32, fontSize: '0.8rem', bgcolor: 'primary.main', border: '1.5px solid', borderColor: 'divider' }}
          >
            {initialsText}
          </Avatar>
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              {fullName}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              {titleCase(user?.role || 'Guest')}
            </Typography>
          </Box>
        </Stack>

        <Menu
          anchorEl={profileAnchor}
          open={Boolean(profileAnchor)}
          onClose={() => setProfileAnchor(null)}
          PaperProps={{ sx: { minWidth: 200, mt: 1.5, borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' } }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle2" fontWeight={700}>{fullName}</Typography>
            <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
          </Box>
          <Divider />
          <MenuItem onClick={() => { setProfileAnchor(null); navigate('/settings'); }}>
            <ListItemIcon><PersonOutlineOutlinedIcon fontSize="small" /></ListItemIcon>
            My Profile
          </MenuItem>
          <MenuItem onClick={logout}>
            <ListItemIcon><LogoutOutlinedIcon fontSize="small" /></ListItemIcon>
            Sign Out
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
