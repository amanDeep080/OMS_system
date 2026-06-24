import { useEffect, useState } from 'react';
import { Box, Grid, Paper, Typography, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import PageHeader from '../components/common/PageHeader';
import { LoadingScreen } from '../components/common/States';
import { reportsApi } from '../api/services/miscApi';
import { formatCurrency, titleCase } from '../utils/formatters';
import { colors } from '../theme/tokens';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Reports() {
  const [attendance, setAttendance] = useState([]);
  const [leave, setLeave] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      reportsApi.attendance().then(({ data }) => setAttendance(data.data)),
      reportsApi.leave().then(({ data }) => setLeave(data.data)),
      reportsApi.departments().then(({ data }) => setDepartments(data.data)),
    ]).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingScreen label="Building reports…" />;

  const attendancePie = {
    labels: attendance.map((a) => titleCase(a.status)),
    datasets: [{ data: attendance.map((a) => Number(a.count)), backgroundColor: [colors.success, colors.danger, colors.warning, colors.info, colors.navy, colors.bronze] }],
  };

  const leaveByType = leave.reduce((acc, l) => {
    acc[l.leaveType] = (acc[l.leaveType] || 0) + Number(l.count);
    return acc;
  }, {});

  return (
    <Box>
      <PageHeader title="Reports" subtitle="Attendance, leave, and department-level analytics." />

      <Grid container spacing={2.5}>
        <Grid xs={12} md={5}>
          <Paper sx={{ p: 2.5, height: '100%' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Attendance Breakdown (this period)</Typography>
            <Pie data={attendancePie} options={{ plugins: { legend: { position: 'bottom', labels: { boxWidth: 12 } } } }} height={240} />
          </Paper>
        </Grid>

        <Grid xs={12} md={7}>
          <Paper sx={{ p: 2.5, height: '100%' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Leave Requests by Type</Typography>
            <Table size="small">
              <TableHead>
                <TableRow><TableCell>Leave type</TableCell><TableCell align="right">Requests</TableCell></TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(leaveByType).map(([type, count]) => (
                  <TableRow key={type}>
                    <TableCell>{titleCase(type)}</TableCell>
                    <TableCell align="right" sx={{ fontFamily: 'mono' }}>{count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Grid>

        <Grid xs={12}>
          <Paper sx={{ p: 0 }}>
            <Box sx={{ p: 2.5, pb: 1.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Department Report</Typography>
            </Box>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Department</TableCell>
                  <TableCell align="right">Active Employees</TableCell>
                  <TableCell align="right">Monthly Payroll Cost</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {departments.map((d) => (
                  <TableRow key={d.department}>
                    <TableCell>{d.department}</TableCell>
                    <TableCell align="right" sx={{ fontFamily: 'mono' }}>{d.employeeCount}</TableCell>
                    <TableCell align="right" sx={{ fontFamily: 'mono' }}>{formatCurrency(d.monthlyPayrollCost)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
