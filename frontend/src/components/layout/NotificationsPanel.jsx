import { useEffect, useState } from 'react';
import { Menu, Box, Typography, List, ListItemButton, ListItemText, Divider, Button, Stack } from '@mui/material';
import { notificationApi } from '../../api/services/miscApi';
import { formatDate } from '../../utils/formatters';

export default function NotificationsPanel({ anchorEl, onClose }) {
  const [notifications, setNotifications] = useState([]);
  const open = Boolean(anchorEl);

  useEffect(() => {
    if (open) {
      notificationApi.list().then(({ data }) => setNotifications(data.data)).catch(() => setNotifications([]));
    }
  }, [open]);

  async function handleMarkAllRead() {
    await notificationApi.markAllRead().catch(() => {});
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }

  return (
    <Menu anchorEl={anchorEl} open={open} onClose={onClose} PaperProps={{ sx: { width: 360, maxHeight: 420 } }}>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', px: 2, pt: 1.5, pb: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Notifications</Typography>
        <Button size="small" onClick={handleMarkAllRead}>Mark all read</Button>
      </Stack>
      <Divider />
      {notifications.length === 0 ? (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">You're all caught up.</Typography>
        </Box>
      ) : (
        <List dense sx={{ py: 0 }}>
          {notifications.map((n) => (
            <ListItemButton key={n.id} sx={{ opacity: n.isRead ? 0.6 : 1, alignItems: 'flex-start' }}>
              <ListItemText
                primary={n.title}
                secondary={
                  <>
                    <Typography component="span" variant="caption" display="block" color="text.secondary">
                      {n.message}
                    </Typography>
                    <Typography component="span" variant="caption" color="text.disabled">
                      {formatDate(n.createdAt)}
                    </Typography>
                  </>
                }
                primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 600 }}
              />
            </ListItemButton>
          ))}
        </List>
      )}
    </Menu>
  );
}
