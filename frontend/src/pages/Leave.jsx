import { useEffect, useState } from 'react';
import {
  Box, Paper, Button, Stack, Table, TableHead, TableRow, TableCell,
  TableBody, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  Tabs, Tab, IconButton, Tooltip,
} from '@mui/material';
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import { useForm, Controller } from 'react-hook-form';
import { useSelector } from 'react-redux';
import PageHeader from '../components/common/PageHeader';
import StatusChip from '../components/common/StatusChip';
import { LoadingScreen, EmptyState } from '../components/common/States';
import { leaveApi } from '../api/services/leaveApi';
import { selectCurrentUser } from '../features/auth/authSlice';
import { formatDate, titleCase } from '../utils/formatters';

const LEAVE_TYPES = ['sick_leave', 'casual_leave', 'earned_leave', 'maternity_leave', 'paternity_leave', 'unpaid_leave'];

export default function Leave() {
  const user = useSelector(selectCurrentUser);
  const canDecide = ['super_admin', 'hr', 'manager'].includes(user?.role);

  const [tab, setTab] = useState(0);
  const [myLeaves, setMyLeaves] = useState([]);
  const [teamLeaves, setTeamLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm();

  function loadMine() {
    return leaveApi.myLeaves().then(({ data }) => setMyLeaves(data.data));
  }
  function loadTeam() {
    return canDecide ? leaveApi.list().then(({ data }) => setTeamLeaves(data.data)) : Promise.resolve();
  }

  useEffect(() => {
    Promise.all([loadMine(), loadTeam()]).finally(() => setLoading(false));
  }, []);

  async function onApply(values) {
    await leaveApi.apply(values);
    reset();
    setDialogOpen(false);
    loadMine();
  }

  async function decide(id, status) {
    await leaveApi.decide(id, status);
    loadTeam();
  }

  if (loading) return <LoadingScreen label="Loading leave records…" />;

  const rows = tab === 0 ? myLeaves : teamLeaves;

  return (
    <Box>
      <PageHeader
        title="Leave Management"
        subtitle="Apply for leave and track approvals."
        actions={<Button variant="contained" onClick={() => setDialogOpen(true)}>Apply for leave</Button>}
      />

      <Paper>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2 }}>
          <Tab label="My Leave" />
          {canDecide && <Tab label="Team Requests" />}
        </Tabs>

        {rows.length === 0 ? (
          <EmptyState title="No leave requests yet" description="Apply for leave using the button above." />
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                {tab === 1 && <TableCell>Employee</TableCell>}
                <TableCell>Type</TableCell>
                <TableCell>From</TableCell>
                <TableCell>To</TableCell>
                <TableCell>Days</TableCell>
                <TableCell>Status</TableCell>
                {tab === 1 && <TableCell align="right">Action</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((l) => (
                <TableRow key={l.id}>
                  {tab === 1 && (
                    <TableCell>{l.employee?.firstName} {l.employee?.lastName}</TableCell>
                  )}
                  <TableCell>{titleCase(l.leaveType)}</TableCell>
                  <TableCell>{formatDate(l.startDate)}</TableCell>
                  <TableCell>{formatDate(l.endDate)}</TableCell>
                  <TableCell sx={{ fontFamily: 'mono' }}>{l.totalDays}</TableCell>
                  <TableCell><StatusChip status={l.status} /></TableCell>
                  {tab === 1 && (
                    <TableCell align="right">
                      {l.status === 'pending' && (
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          <Tooltip title="Approve">
                            <IconButton size="small" color="success" onClick={() => decide(l.id, 'approved')}>
                              <CheckOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject">
                            <IconButton size="small" color="error" onClick={() => decide(l.id, 'rejected')}>
                              <CloseOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Apply for leave</DialogTitle>
        <Box component="form" onSubmit={handleSubmit(onApply)}>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 0.5 }}>
              <Controller
                name="leaveType"
                control={control}
                defaultValue="casual_leave"
                render={({ field }) => (
                  <TextField select label="Leave type" {...field}>
                    {LEAVE_TYPES.map((t) => <MenuItem key={t} value={t}>{titleCase(t)}</MenuItem>)}
                  </TextField>
                )}
              />
              <TextField
                label="Start date"
                type="date"
                InputLabelProps={{ shrink: true }}
                error={Boolean(errors.startDate)}
                {...register('startDate', { required: true })}
              />
              <TextField
                label="End date"
                type="date"
                InputLabelProps={{ shrink: true }}
                error={Boolean(errors.endDate)}
                {...register('endDate', { required: true })}
              />
              <TextField label="Reason" multiline rows={3} {...register('reason')} />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Submit request</Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
