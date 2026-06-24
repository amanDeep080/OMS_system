import { useEffect, useState } from 'react';
import {
  Grid, Paper, Typography, Stack, Box, Chip, List, ListItem, ListItemText,
  Skeleton, Avatar, ListItemAvatar, Divider, Card, CardContent, Button,
  LinearProgress, IconButton, Table, TableBody, TableCell, TableHead, TableRow
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  ArcElement, BarElement, Tooltip as ChartTooltip, Legend, Filler,
} from 'chart.js';
import {
  PeopleAltOutlined as PeopleAltOutlinedIcon,
  EventAvailableOutlined as EventAvailableOutlinedIcon,
  BeachAccessOutlined as BeachAccessOutlinedIcon,
  PaymentsOutlined as PaymentsOutlinedIcon,
  PersonAddOutlined as PersonAddOutlinedIcon,
  CakeOutlined as CakeOutlinedIcon,
  CampaignOutlined as CampaignOutlinedIcon,
  HistoryOutlined as HistoryOutlinedIcon,
  EmojiEventsOutlined as EmojiEventsOutlinedIcon,
  SchoolOutlined as SchoolOutlinedIcon,
  TrendingUpOutlined as TrendingUpOutlinedIcon,
  ArrowForwardOutlined as ArrowForwardOutlinedIcon,
  RocketLaunchOutlined as RocketLaunchOutlinedIcon
} from '@mui/icons-material';

import PageHeader from '../components/common/PageHeader';
import StatCard from '../components/common/StatCard';
import { dashboardApi } from '../api/services/miscApi';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../features/auth/authSlice';
import { formatCurrency, formatDate, titleCase, initials } from '../utils/formatters';
import { colors, departmentColors } from '../theme/tokens';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  ArcElement, BarElement, ChartTooltip, Legend, Filler
);

export default function Dashboard() {
  const user = useSelector(selectCurrentUser);
  const navigate = useNavigate();
  const isHR = ['super_admin', 'hr'].includes(user?.role);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi
      .overview()
      .then(({ data }) => setData(data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <Box sx={{ p: 1 }}>
        <Skeleton variant="text" width="40%" height={40} sx={{ mb: 1 }} />
        <Grid container spacing={2.5}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Grid key={i} xs={12} sm={6} md={4} lg={2}><Skeleton variant="rounded" height={100} /></Grid>
          ))}
          <Grid xs={12} md={8}><Skeleton variant="rounded" height={400} /></Grid>
          <Grid xs={12} md={4}><Skeleton variant="rounded" height={400} /></Grid>
        </Grid>
      </Box>
    );
  }

  const deptStats = (data.departmentStats || []).filter((d) => d.departmentId);
  const deptDoughnutData = {
    labels: deptStats.map((d) => d['department.name'] || 'Unassigned'),
    datasets: [{
      data: deptStats.map((d) => d.count),
      backgroundColor: Object.values(departmentColors),
      borderWidth: 1, borderColor: '#ffffff',
    }],
  };

  const hiringLabels = (data.hiringTrends || []).map((h) => h.month);
  const hiringValues = (data.hiringTrends || []).map((h) => Number(h.hires));
  const taskStatsMap = (data.taskStats || []).reduce((acc, curr) => ({ ...acc, [curr.status]: Number(curr.count) }), {});
  const assetStatsMap = (data.assetStats || []).reduce((acc, curr) => ({ ...acc, [curr.status]: Number(curr.count) }), {});

  return (
    <Box sx={{ pb: 6 }}>
      <PageHeader
        title={`Enterprise Dashboard`}
        subtitle={`Welcome back, ${user?.employee?.firstName || 'Admin'}. Here is your global workforce overview.`}
        actions={isHR && (
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Button variant="outlined" size="small" onClick={() => navigate('/employees')}>Manage Directory</Button>
            <Button variant="contained" size="small" onClick={() => navigate('/payroll')}>Run Monthly Payroll</Button>
          </Stack>
        )}
      />

      {/* Top row - KPI Stats */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid xs={12} sm={6} md={4} lg={2}>
          <StatCard label="Total Employees" value={data.totalEmployees} icon={<PeopleAltOutlinedIcon fontSize="small" />} accent={colors.navy} />
        </Grid>
        <Grid xs={12} sm={6} md={4} lg={2}>
          <StatCard label="Active Status" value={data.activeEmployees} icon={<EventAvailableOutlinedIcon fontSize="small" />} accent={colors.success} />
        </Grid>
        <Grid xs={12} sm={6} md={4} lg={2}>
          <StatCard label="Attendance" value={data.attendanceToday} icon={<EventAvailableOutlinedIcon fontSize="small" />} accent={colors.info} />
        </Grid>
        <Grid xs={12} sm={6} md={4} lg={2}>
          <StatCard label="On Leave" value={data.onLeaveToday} icon={<BeachAccessOutlinedIcon fontSize="small" />} accent={colors.danger} />
        </Grid>
        <Grid xs={12} sm={6} md={4} lg={2}>
          <StatCard label="New Hires" value={data.newHiresThisMonth} icon={<PersonAddOutlinedIcon fontSize="small" />} accent="#6B46C1" />
        </Grid>
        <Grid xs={12} sm={6} md={4} lg={2}>
          <StatCard label="Total Payroll" value={formatCurrency(data.monthlyPayroll)} icon={<PaymentsOutlinedIcon fontSize="small" />} accent={colors.warning} />
        </Grid>
      </Grid>

      {/* Main row - Analytics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid xs={12} lg={8}>
          <Paper sx={{ p: 3, height: 480 }}>
            <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 3 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Workforce Expansion Trend</Typography>
                <Typography variant="caption" color="text.secondary">Net hiring growth over the last 12 months</Typography>
              </Box>
              <Chip label="+12.5% Growth" color="success" size="small" variant="outlined" />
            </Stack>
            <Box sx={{ height: 360 }}>
              <Line
                data={{
                  labels: hiringLabels,
                  datasets: [{
                    label: 'Hires', data: hiringValues,
                    borderColor: colors.bronze, backgroundColor: `${colors.bronze}15`,
                    fill: true, tension: 0.4, pointRadius: 4, pointHoverRadius: 6
                  }]
                }}
                options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }}
              />
            </Box>
          </Paper>
        </Grid>

        <Grid xs={12} lg={4}>
          <Paper sx={{ p: 3, height: 480, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Org Composition</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 3 }}>Department-wise headcount distribution</Typography>
            <Box sx={{ height: 240, display: 'flex', justifyContent: 'center' }}>
              <Doughnut
                data={deptDoughnutData}
                options={{ maintainAspectRatio: false, cutout: '75%', plugins: { legend: { display: true, position: 'bottom', labels: { boxWidth: 10, padding: 8, font: { size: 10 } } } } }}
              />
            </Box>
            <Stack spacing={2.5} sx={{ mt: 'auto' }}>
              <Box>
                <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>Project Delivery Rate</Typography>
                  <Typography variant="caption" color="text.secondary">88%</Typography>
                </Stack>
                <LinearProgress variant="determinate" value={88} sx={{ height: 6, borderRadius: 3 }} />
              </Box>
              <Box>
                <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>IT Asset Compliance</Typography>
                  <Typography variant="caption" color="text.secondary">94%</Typography>
                </Stack>
                <LinearProgress variant="determinate" value={94} color="secondary" sx={{ height: 6, borderRadius: 3 }} />
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* Third row - People & Social */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid xs={12} md={6}>
          <Card variant="outlined" sx={{ height: '100%', borderRadius: 2 }}>
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'action.hover' }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <EmojiEventsOutlinedIcon color="primary" fontSize="small" />
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Peer-to-Peer Recognition</Typography>
              </Stack>
              <Button size="small" onClick={() => navigate('/social')}>Social Hub</Button>
            </Box>
            <List sx={{ py: 0 }}>
              {(data.recentKudos || []).map((k) => (
                <ListItem key={k.id} divider sx={{ py: 2 }}>
                  <ListItemAvatar>
                    <Avatar src={k.receiver?.profilePicture} sx={{ width: 44, height: 44, border: '2px solid', borderColor: 'secondary.light' }}>
                      {initials(k.receiver?.firstName || '', k.receiver?.lastName || '')}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={<Typography variant="body2" sx={{ fontWeight: 700 }}>{k.receiver?.firstName} received {k.type} Kudos</Typography>}
                    secondary={<Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>"{k.message}" — from {k.giver?.firstName}</Typography>}
                  />
                </ListItem>
              ))}
            </List>
          </Card>
        </Grid>

        <Grid xs={12} md={6}>
          <Card variant="outlined" sx={{ height: '100%', borderRadius: 2 }}>
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'action.hover' }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <RocketLaunchOutlinedIcon color="primary" fontSize="small" />
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Top Performers (Current Quarter)</Typography>
              </Stack>
              <Button size="small" onClick={() => navigate('/performance')}>View Rankings</Button>
            </Box>
            <List sx={{ py: 0 }}>
              {(data.topPerformers || []).map((p) => (
                <ListItem key={p.id} divider sx={{ py: 2 }}>
                  <ListItemAvatar>
                    <Avatar src={p.employee?.profilePicture} sx={{ width: 44, height: 44 }}>{initials(p.employee?.firstName || '', p.employee?.lastName || '')}</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={<Typography variant="body2" sx={{ fontWeight: 700 }}>{p.employee?.firstName} {p.employee?.lastName}</Typography>}
                    secondary={<Typography variant="caption" color="text.secondary">{p.employee?.designation}</Typography>}
                  />
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="h6" color="secondary.dark" sx={{ fontWeight: 800 }}>{p.rating}.0</Typography>
                    <Typography variant="caption" sx={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: 1 }}>Rating</Typography>
                  </Box>
                </ListItem>
              ))}
            </List>
          </Card>
        </Grid>
      </Grid>

      {/* Fourth row - Operational Details */}
      <Grid container spacing={3}>
        <Grid xs={12} md={4}>
          <Paper sx={{ p: 0, borderRadius: 2 }}>
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1 }}>
              <HistoryOutlinedIcon color="primary" fontSize="small" />
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>System Audit Logs</Typography>
            </Box>
            <List dense sx={{ py: 0 }}>
              {(data.recentActivity || []).map((log) => (
                <ListItem key={log.id} divider sx={{ py: 1.5 }}>
                  <ListItemText
                    primary={<Typography variant="caption" sx={{ fontWeight: 700 }}>{log.action}</Typography>}
                    secondary={`${log.user?.email || 'System'} · ${formatDate(log.createdAt)}`}
                  />
                  <Chip size="small" label={log.module} sx={{ fontSize: '0.6rem', height: 16 }} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid xs={12} md={4}>
          <Paper sx={{ p: 0, borderRadius: 2 }}>
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1 }}>
              <CakeOutlinedIcon color="primary" fontSize="small" />
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Upcoming Celebrations</Typography>
            </Box>
            <List sx={{ py: 0 }}>
              {(data.upcomingBirthdays || []).map((e) => (
                <ListItem key={e.id} divider sx={{ py: 1.5 }}>
                  <ListItemAvatar>
                    <Avatar src={e.profilePicture} sx={{ width: 36, height: 36 }}>{initials(e.firstName || '', e.lastName || '')}</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={<Typography variant="body2" sx={{ fontWeight: 700 }}>{e.firstName} {e.lastName}</Typography>}
                    secondary={formatDate(e.dateOfBirth)}
                  />
                  <Typography variant="caption" color="primary.main" sx={{ fontWeight: 700 }}>BDAY 🎂</Typography>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Stack spacing={3}>
              <Box>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 2 }}>
                  <SchoolOutlinedIcon color="primary" fontSize="small" />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Skill Matrix Progress</Typography>
                </Stack>
                <Grid container spacing={1.5}>
                  <Grid xs={6}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'action.hover', borderRadius: 1.5 }}>
                      <Typography variant="h4" sx={{ fontWeight: 800 }} color="success.main">{data.learning?.completed || 0}</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>Certified</Typography>
                    </Box>
                  </Grid>
                  <Grid xs={6}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'action.hover', borderRadius: 1.5 }}>
                      <Typography variant="h4" sx={{ fontWeight: 800 }} color="warning.main">{data.learning?.ongoing || 0}</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>Ongoing</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Resource Allocation</Typography>
                <Stack spacing={2}>
                  <Box>
                    <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption">Hardware (Laptops/Phones)</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>{assetStatsMap['assigned'] || 0}</Typography>
                    </Stack>
                    <LinearProgress variant="determinate" value={assetStatsMap['assigned'] ? (assetStatsMap['assigned'] / 1500) * 100 : 0} color="secondary" />
                  </Box>
                  <Box>
                    <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption">Pending Compliance Tasks</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>{taskStatsMap['pending'] || 0}</Typography>
                    </Stack>
                    <LinearProgress variant="determinate" value={22} color="error" />
                  </Box>
                </Stack>
              </Box>

              <Button fullWidth variant="outlined" size="large" onClick={() => navigate('/learning')}>Launch Learning Hub</Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
