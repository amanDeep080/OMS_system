import { Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Stack, Typography, Divider } from '@mui/material';
import { NavLink, useLocation } from 'react-router-dom';
import {
  DashboardOutlined as DashboardOutlinedIcon,
  PeopleAltOutlined as PeopleAltOutlinedIcon,
  EventAvailableOutlined as EventAvailableOutlinedIcon,
  BeachAccessOutlined as BeachAccessOutlinedIcon,
  PaymentsOutlined as PaymentsOutlinedIcon,
  TrendingUpOutlined as TrendingUpOutlinedIcon,
  CampaignOutlined as CampaignOutlinedIcon,
  BarChartOutlined as BarChartOutlinedIcon,
  WorkOutlineOutlined as WorkOutlineOutlinedIcon,
  FolderOutlined as FolderOutlinedIcon,
  SettingsOutlined as SettingsOutlinedIcon,
  AssignmentOutlined as AssignmentOutlinedIcon,
  AccountTreeOutlined as AccountTreeOutlinedIcon,
  DevicesOtherOutlined as DevicesOtherOutlinedIcon,
  SecurityOutlined as SecurityOutlinedIcon,
  ReceiptLongOutlined as ReceiptLongOutlinedIcon,
  ForumOutlined as ForumOutlinedIcon,
  AutoGraphOutlined as AutoGraphOutlinedIcon,
  LoyaltyOutlined as LoyaltyOutlinedIcon,
  SchoolOutlined as SchoolOutlinedIcon,
  GroupsOutlined as GroupsOutlinedIcon
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../features/auth/authSlice';

export const SIDEBAR_WIDTH = 248;

const NAV_ITEMS = [
  { label: 'Dashboard', icon: DashboardOutlinedIcon, path: '/dashboard', roles: ['super_admin', 'hr', 'manager', 'employee'] },
  { label: 'Employees', icon: PeopleAltOutlinedIcon, path: '/employees', roles: ['super_admin', 'hr', 'manager', 'employee'] },
  { label: 'Social Hub', icon: ForumOutlinedIcon, path: '/social', roles: ['super_admin', 'hr', 'manager', 'employee'] },
  { label: 'Org Chart', icon: AccountTreeOutlinedIcon, path: '/org-chart', roles: ['super_admin', 'hr', 'manager', 'employee'] },
  { label: 'Career Path', icon: AutoGraphOutlinedIcon, path: '/career', roles: ['super_admin', 'hr', 'manager', 'employee'] },
  { label: 'Rewards', icon: LoyaltyOutlinedIcon, path: '/rewards', roles: ['super_admin', 'hr', 'manager', 'employee'] },
  { label: 'Learning', icon: SchoolOutlinedIcon, path: '/learning', roles: ['super_admin', 'hr', 'manager', 'employee'] },
  { label: 'Communities', icon: GroupsOutlinedIcon, path: '/communities', roles: ['super_admin', 'hr', 'manager', 'employee'] },
  { label: 'Tasks', icon: AssignmentOutlinedIcon, path: '/tasks', roles: ['super_admin', 'hr', 'manager', 'employee'] },
  { label: 'Assets', icon: DevicesOtherOutlinedIcon, path: '/assets', roles: ['super_admin', 'hr'] },
  { label: 'Expenses', icon: ReceiptLongOutlinedIcon, path: '/expenses', roles: ['super_admin', 'hr', 'manager', 'employee'] },
  { label: 'Attendance', icon: EventAvailableOutlinedIcon, path: '/attendance', roles: ['super_admin', 'hr', 'manager', 'employee'] },
  { label: 'Leave', icon: BeachAccessOutlinedIcon, path: '/leave', roles: ['super_admin', 'hr', 'manager', 'employee'] },
  { label: 'Payroll', icon: PaymentsOutlinedIcon, path: '/payroll', roles: ['super_admin', 'hr', 'manager', 'employee'] },
  { label: 'Performance', icon: TrendingUpOutlinedIcon, path: '/performance', roles: ['super_admin', 'hr', 'manager', 'employee'] },
  { label: 'Recruitment', icon: WorkOutlineOutlinedIcon, path: '/recruitment', roles: ['super_admin', 'hr'] },
  { label: 'Documents', icon: FolderOutlinedIcon, path: '/documents', roles: ['super_admin', 'hr', 'manager', 'employee'] },
  { label: 'Announcements', icon: CampaignOutlinedIcon, path: '/announcements', roles: ['super_admin', 'hr', 'manager', 'employee'] },
  { label: 'Audit Logs', icon: SecurityOutlinedIcon, path: '/audit-logs', roles: ['super_admin'] },
  { label: 'Reports', icon: BarChartOutlinedIcon, path: '/reports', roles: ['super_admin', 'hr', 'manager'] },
  { label: 'Settings', icon: SettingsOutlinedIcon, path: '/settings', roles: ['super_admin', 'hr', 'manager', 'employee'] },
];

export default function Sidebar({ open }) {
  const user = useSelector(selectCurrentUser);
  const location = useLocation();
  const role = user?.role || 'employee';

  const items = NAV_ITEMS.filter((item) => item.roles.includes(role));

  return (
    <Drawer
      variant="persistent"
      open={open}
      sx={{
        width: open ? SIDEBAR_WIDTH : 0,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: SIDEBAR_WIDTH,
          boxSizing: 'border-box',
          borderRight: (theme) => `1px solid ${theme.palette.divider}`,
        },
      }}
    >
      <Stack sx={{ px: 2.5, py: 2.5 }} direction="row" spacing={1.2} sx={{ alignItems: 'center' }}>
        <Box
          component="img"
          src="https://media.licdn.com/dms/image/v2/D4E0BAQGu7uBQZxfc4Q/company-logo_200_200/B4EZ4sWoVYHcAE-/0/1778860590652/spreetail_logo?e=2147483647&v=beta&t=FyphvtiY39aEz_OtaeDlqvptLaUqlQmqq4Kf4Zomong"
          sx={{
            width: 32,
            height: 32,
            borderRadius: '6px',
            objectFit: 'contain'
          }}
        />
        <Typography variant="subtitle1" sx={{ fontWeight: 700, letterSpacing: '-0.01em' }}>
          Spreetail
        </Typography>
      </Stack>

      <Divider />

      <List sx={{ px: 1.5, py: 1.5 }}>
        {items.map((item) => {
          const Icon = item.icon;
          const active = location.pathname.startsWith(item.path);
          return (
            <ListItemButton
              key={item.path}
              component={NavLink}
              to={item.path}
              selected={active}
              sx={{
                borderRadius: 1.5,
                mb: 0.5,
                position: 'relative',
                '&.Mui-selected': {
                  bgcolor: 'action.selected',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: 8,
                    bottom: 8,
                    width: 3,
                    borderRadius: 2,
                    bgcolor: 'secondary.main',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: active ? 'secondary.main' : 'text.secondary' }}>
                <Icon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: active ? 600 : 500 }}
              />
            </ListItemButton>
          );
        })}
      </List>
    </Drawer>
  );
}
