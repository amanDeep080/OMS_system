import { useEffect, useState } from 'react';
import {
  Box, Paper, Button, Stack, Typography, Table, TableHead, TableRow, TableCell,
  TableBody, Grid, Alert, Divider
} from '@mui/material';
import { Line } from 'react-chartjs-2';
import { useSelector } from 'react-redux';
import PageHeader from '../components/common/PageHeader';
import StatCard from '../components/common/StatCard';
import StatusChip from '../components/common/StatusChip';
import { LoadingScreen } from '../components/common/States';
import { attendanceApi } from '../api/services/attendanceApi';
import { selectCurrentUser } from '../features/auth/authSlice';
import { formatDate, titleCase } from '../utils/formatters';
import {
  EventAvailableOutlined as EventAvailableOutlinedIcon,
  AccessTimeOutlined as AccessTimeOutlinedIcon
} from '@mui/icons-material';

export default function Attendance() {
  const user = useSelector(selectCurrentUser);
  const [records, setRecords] = useState([]);
  const [today, setToday] = useState(null);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState('');
  const isManagerLike = ['super_admin', 'hr', 'manager'].includes(user?.role);

  function load() {
    Promise.all([
      attendanceApi.myAttendance().then(({ data }) => setRecords(data.data)),
      isManagerLike ? attendanceApi.statsToday().then(({ data }) => setToday(data.data)) : Promise.resolve(),
      isManagerLike ? attendanceApi.trends(12).then(({ data }) => setTrends(data.data)) : Promise.resolve(),
    ]).finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  const todayRecord = records.find((r) => r.date === new Date().toISOString().slice(0, 10));

  async function handleCheckIn() {
    try {
      await attendanceApi.checkIn();
      setActionMessage('Checked in successfully.');
      load();
    } catch (err) {
      setActionMessage(err.response?.data?.message || 'Unable to check in.');
    }
  }

  async function handleCheckOut() {
    try {
      await attendanceApi.checkOut();
      setActionMessage('Checked out successfully.');
      load();
    } catch (err) {
      setActionMessage(err.response?.data?.message || 'Unable to check out.');
    }
  }

  if (loading) return <LoadingScreen label="Loading attendance…" />;

  const trendLabels = [...new Set(trends.map(t => t.month))];
  const trendData = trendLabels.map(m => trends.filter(t => t.month === m && (t.status === 'present' || t.status === 'work_from_home')).reduce((acc, curr) => acc + curr.count, 0));

  return (
    <Box>
      <PageHeader title="Attendance" subtitle="Track check-ins, check-outs, and attendance history." />

      {actionMessage && <Alert severity="info" sx={{ mb: 2 }} onClose={() => setActionMessage('')}>{actionMessage}</Alert>}

      <Paper sx={{ p: 2.5, mb: 2.5 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2}>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Today</Typography>
            <Typography variant="body2" color="text.secondary">
              {todayRecord ? `Checked in at ${todayRecord.checkIn || '—'}` : "You haven't checked in yet today."}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1.5}>
            <Button variant="outlined" onClick={handleCheckIn} disabled={Boolean(todayRecord?.checkIn)}>Check in</Button>
            <Button variant="contained" onClick={handleCheckOut} disabled={!todayRecord?.checkIn || Boolean(todayRecord?.checkOut)}>Check out</Button>
          </Stack>
        </Stack>
      </Paper>

      {isManagerLike && today && (
        <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
          <Grid item xs={12} sm={4}>
            <StatCard label="Total active employees" value={today.totalEmployees} icon={<EventAvailableOutlinedIcon fontSize="small" />} />
          </Grid>
          {today.breakdown.slice(0, 2).map((b) => (
            <Grid item xs={12} sm={4} key={b.status}>
              <StatCard label={titleCase(b.status)} value={b.count} icon={<AccessTimeOutlinedIcon fontSize="small" />} accent="secondary.main" />
            </Grid>
          ))}
        </Grid>
      )}

      {isManagerLike && trends.length > 0 && (
        <Paper sx={{ p: 2.5, mb: 2.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Org-wide Attendance Trend (Last 12 Months)</Typography>
          <Box sx={{ height: 200 }}>
            <Line
              data={{
                labels: trendLabels,
                datasets: [{
                  label: 'Present/WFH',
                  data: trendData,
                  borderColor: '#2F855A',
                  backgroundColor: '#2F855A22',
                  fill: true,
                  tension: 0.4
                }]
              }}
              options={{
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true } }
              }}
            />
          </Box>
        </Paper>
      )}

      <Paper>
        <Box sx={{ p: 2.5, pb: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>My attendance history</Typography>
        </Box>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Check-in</TableCell>
              <TableCell>Check-out</TableCell>
              <TableCell>Hours</TableCell>
              <TableCell>Overtime</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {records.slice(0, 20).map((r) => (
              <TableRow key={r.id}>
                <TableCell>{formatDate(r.date)}</TableCell>
                <TableCell><StatusChip status={r.status} /></TableCell>
                <TableCell sx={{ fontFamily: 'mono' }}>{r.checkIn || '—'}</TableCell>
                <TableCell sx={{ fontFamily: 'mono' }}>{r.checkOut || '—'}</TableCell>
                <TableCell sx={{ fontFamily: 'mono' }}>{r.hoursWorked}</TableCell>
                <TableCell sx={{ fontFamily: 'mono' }}>{r.overtimeHours}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
