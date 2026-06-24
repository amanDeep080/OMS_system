import { useEffect, useState } from 'react';
import {
  Box, Paper, Typography, Table, TableHead, TableRow, TableCell, TableBody,
  Grid, Button, Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { useSelector } from 'react-redux';
import PageHeader from '../components/common/PageHeader';
import StatusChip from '../components/common/StatusChip';
import { LoadingScreen, EmptyState } from '../components/common/States';
import { payrollApi } from '../api/services/payrollApi';
import { selectCurrentUser } from '../features/auth/authSlice';
import { formatCurrency, formatMonthYear } from '../utils/formatters';
import { colors } from '../theme/tokens';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function Payroll() {
  const user = useSelector(selectCurrentUser);
  const canManage = ['super_admin', 'hr'].includes(user?.role);

  const [payslips, setPayslips] = useState([]);
  const [monthlyCost, setMonthlyCost] = useState([]);
  const [loading, setLoading] = useState(true);
  const [genOpen, setGenOpen] = useState(false);
  const [genStatus, setGenStatus] = useState('');

  function load() {
    Promise.all([
      payrollApi.myPayroll().then(({ data }) => setPayslips(data.data)),
      canManage ? payrollApi.monthlyCost(12).then(({ data }) => setMonthlyCost(data.data)) : Promise.resolve(),
    ]).finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function handleGenerate() {
    const now = new Date();
    setGenStatus('Generating…');
    try {
      const { data } = await payrollApi.generate(now.getMonth() + 1, now.getFullYear());
      setGenStatus(data.message);
      load();
    } catch (err) {
      setGenStatus(err.response?.data?.message || 'Failed to generate payroll.');
    }
  }

  if (loading) return <LoadingScreen label="Loading payroll…" />;

  return (
    <Box>
      <PageHeader
        title="Payroll"
        subtitle="View payslips and track company-wide payroll cost."
        actions={canManage && <Button variant="contained" onClick={() => setGenOpen(true)}>Run payroll</Button>}
      />

      {canManage && monthlyCost.length > 0 && (
        <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
          <Grid item xs={12}>
            <Paper sx={{ p: 2.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Monthly Payroll Cost</Typography>
              <Bar
                data={{
                  labels: monthlyCost.map((m) => formatMonthYear(m.month, m.year)),
                  datasets: [{
                    label: 'Net pay',
                    data: monthlyCost.map((m) => Number(m.totalNetPay)),
                    backgroundColor: colors.navy,
                    borderRadius: 4,
                  }],
                }}
                options={{ plugins: { legend: { display: false } }, scales: { y: { ticks: { callback: (v) => `$${v / 1000}k` } } } }}
                height={220}
              />
            </Paper>
          </Grid>
        </Grid>
      )}

      <Paper>
        <Box sx={{ p: 2.5, pb: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>My Payslips</Typography>
        </Box>
        {payslips.length === 0 ? (
          <EmptyState title="No payslips yet" description="Payslips will appear here once payroll has been processed." />
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Period</TableCell>
                <TableCell>Basic</TableCell>
                <TableCell>Bonus</TableCell>
                <TableCell>Deductions</TableCell>
                <TableCell>Net Pay</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payslips.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{formatMonthYear(p.month, p.year)}</TableCell>
                  <TableCell sx={{ fontFamily: 'mono' }}>{formatCurrency(p.basic)}</TableCell>
                  <TableCell sx={{ fontFamily: 'mono' }}>{formatCurrency(p.bonus)}</TableCell>
                  <TableCell sx={{ fontFamily: 'mono' }}>{formatCurrency(Number(p.tax) + Number(p.providentFund) + Number(p.otherDeductions))}</TableCell>
                  <TableCell sx={{ fontFamily: 'mono', fontWeight: 700 }}>{formatCurrency(p.netPay)}</TableCell>
                  <TableCell><StatusChip status={p.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      <Dialog open={genOpen} onClose={() => setGenOpen(false)}>
        <DialogTitle>Run payroll for current month</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            This generates payslips for all active employees who haven't been paid for the current month yet.
          </Typography>
          {genStatus && <Typography variant="body2" sx={{ mt: 2, fontWeight: 600 }}>{genStatus}</Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGenOpen(false)}>Close</Button>
          <Button variant="contained" onClick={handleGenerate}>Run payroll</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
