import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Sidebar, { SIDEBAR_WIDTH } from './Sidebar';
import Topbar from './Topbar';
import { selectSidebarOpen } from '../../features/ui/uiSlice';

export default function AppLayout() {
  const sidebarOpen = useSelector(selectSidebarOpen);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Sidebar open={sidebarOpen} />

      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          // Removed manual margin/width as Sidebar variant="persistent"
          // already manages its own width in the flex container.
        }}
      >
        <Topbar />

        <Box
          component="main"
          sx={{
            p: { xs: 2, md: 3 },
            flexGrow: 1,
            overflowX: 'hidden',
            overflowY: 'auto'
          }}
        >
          <Box sx={{ maxWidth: 1600, mx: 'auto', width: '100%' }}>
            <Outlet />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
