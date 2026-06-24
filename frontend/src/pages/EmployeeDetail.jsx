import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Paper, Avatar, Typography, Stack, Tabs, Tab, Grid, Chip, Table, TableHead,
  TableRow, TableCell, TableBody, Divider, IconButton, Menu, MenuItem, ListItemIcon,
  List, ListItem, ListItemText, LinearProgress, Button
} from '@mui/material';
import {
  ArrowBackOutlined as ArrowBackOutlinedIcon,
  MoreVert as MoreVertIcon,
  EditOutlined as EditOutlinedIcon,
  DeleteOutlined as DeleteOutlineIcon,
  VerifiedOutlined as VerifiedOutlinedIcon,
  WorkspacePremiumOutlined as WorkspacePremiumOutlinedIcon
} from '@mui/icons-material';
import { employeeApi } from '../api/services/employeeApi';
import { attendanceApi } from '../api/services/attendanceApi';
import { leaveApi } from '../api/services/leaveApi';
import { payrollApi } from '../api/services/payrollApi';
import { performanceApi } from '../api/services/performanceApi';
import StatusChip from '../components/common/StatusChip';
import { LoadingScreen } from '../components/common/States';
import { initials, formatDate, formatCurrency, formatMonthYear, titleCase } from '../utils/formatters';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../features/auth/authSlice';

export default function EmployeeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = useSelector(selectCurrentUser);
  const isHR = ['super_admin', 'hr'].includes(currentUser?.role);

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);

  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [payroll, setPayroll] = useState([]);
  const [performance, setPerformance] = useState([]);

  useEffect(() => {
    employeeApi.getById(id)
      .then(({ data }) => setEmployee(data.data))
      .catch(() => setEmployee(null))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!employee) return;
    if (tab === 1) attendanceApi.employeeAttendance(id, { limit: 15 }).then(({ data }) => setAttendance(data.data)).catch(() => setAttendance([]));
    if (tab === 2) leaveApi.list({ employeeId: id }).then(({ data }) => setLeaves(data.data)).catch(() => setLeaves([]));
    if (tab === 3) payrollApi.employeePayroll(id, { limit: 12 }).then(({ data }) => setPayroll(data.data)).catch(() => setPayroll([]));
    if (tab === 4) performanceApi.employeeReviews(id).then(({ data }) => setPerformance(data.data)).catch(() => setPerformance([]));
  }, [tab, employee, id]);

  if (loading) return <LoadingScreen label="Loading employee profile…" />;
  if (!employee) return (
    <Box sx={{ p: 4, textAlign: 'center' }}>
      <Typography variant="h6">Employee not found</Typography>
      <Button onClick={() => navigate('/employees')} sx={{ mt: 2 }}>Back to Directory</Button>
    </Box>
  );

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to deactivate this employee?')) {
      try {
        await employeeApi.deactivate(id);
        navigate('/employees');
      } catch (err) {
        alert('Failed to deactivate employee');
      }
    }
    handleMenuClose();
  };

  return (
    <Box sx={{ pb: 5 }}>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
        <Stack direction="row" sx={{ alignItems: 'center' }} spacing={1.5}>
          <IconButton size="small" onClick={() => navigate(-1)}>
            <ArrowBackOutlinedIcon fontSize="small" />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Profile Intelligence</Typography>
        </Stack>
        {isHR && (
          <Box>
            <IconButton onClick={handleMenuOpen}><MoreVertIcon /></IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
              <MenuItem onClick={() => { alert('Edit feature coming soon'); handleMenuClose(); }}>
                <ListItemIcon><EditOutlinedIcon fontSize="small" /></ListItemIcon>
                Edit Profile
              </MenuItem>
              <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
                <ListItemIcon><DeleteOutlineIcon fontSize="small" color="error" /></ListItemIcon>
                Deactivate
              </MenuItem>
            </Menu>
          </Box>
        )}
      </Stack>

      <Grid container spacing={3}>
        <Grid xs={12} lg={4}>
          <Paper sx={{ p: 4, textAlign: 'center', height: '100%', borderRadius: 2 }}>
            <Avatar
              src={employee.profilePicture}
              sx={{ width: 120, height: 120, mx: 'auto', mb: 2.5, fontSize: '2.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
            >
              {initials(employee.firstName, employee.lastName)}
            </Avatar>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>{employee.firstName} {employee.lastName}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontWeight: 500 }}>
              {employee.designation}
            </Typography>
            <StatusChip status={employee.employmentStatus} sx={{ mb: 3 }} />

            <Divider sx={{ my: 3 }} />

            <Stack spacing={2.5}>
              <DetailBox label="Employee ID" value={employee.employeeCode} icon={<VerifiedOutlinedIcon fontSize="inherit" />} />
              <DetailBox label="Department" value={employee.department?.name || 'Unassigned'} />
              <DetailBox label="Work Email" value={employee.email} />
              <DetailBox label="Reporting Manager" value={employee.manager ? `${employee.manager.firstName} ${employee.manager.lastName}` : 'Direct to CEO'} />
            </Stack>

            <Box sx={{ mt: 5 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 1 }} align="left">
                BIO
              </Typography>
              <Typography variant="body2" align="left" color="text.primary" sx={{ lineHeight: 1.6, opacity: 0.8 }}>
                {employee.bio || 'This employee has not added a professional bio yet.'}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid xs={12} lg={8}>
          <Paper sx={{ mb: 3, borderRadius: 2 }}>
            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Tab label="Intelligence" sx={{ fontWeight: 700 }} />
              <Tab label="Attendance" sx={{ fontWeight: 700 }} />
              <Tab label="Leave History" sx={{ fontWeight: 700 }} />
              <Tab label="Payroll" sx={{ fontWeight: 700 }} />
              <Tab label="Reviews" sx={{ fontWeight: 700 }} />
            </Tabs>

            <Box sx={{ p: 4 }}>
              {tab === 0 && (
                <Stack spacing={4}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>Core Competencies</Typography>
                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }} useFlexGap>
                      {['React', 'Node.js', 'System Architecture', 'AWS', 'Team Leadership'].map(s => (
                        <Chip key={s} label={s} variant="outlined" sx={{ borderRadius: 1.5 }} />
                      ))}
                    </Stack>
                  </Box>

                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>Career Progression</Typography>
                    <Grid container spacing={3}>
                      <Grid xs={6}>
                        <DetailRow label="Hire Date" value={formatDate(employee.joiningDate)} />
                        <DetailRow label="Contract" value={titleCase(employee.employmentType)} />
                      </Grid>
                      <Grid xs={6}>
                        <DetailRow label="Annual Package" value={employee.annualSalary ? formatCurrency(employee.annualSalary) : 'Restricted'} />
                        <DetailRow label="Service Tenure" value="2.4 Years" />
                      </Grid>
                    </Grid>
                  </Box>

                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>Growth Readiness</Typography>
                    <Stack spacing={2.5}>
                      <Box>
                        <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>Skill Mastery Index</Typography>
                          <Typography variant="caption" sx={{ fontWeight: 800 }}>82%</Typography>
                        </Stack>
                        <LinearProgress variant="determinate" value={82} sx={{ height: 8, borderRadius: 4 }} />
                      </Box>
                      <Box>
                        <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>Leadership Pipeline Score</Typography>
                          <Typography variant="caption" sx={{ fontWeight: 800 }}>65%</Typography>
                        </Stack>
                        <LinearProgress variant="determinate" value={65} color="secondary" sx={{ height: 8, borderRadius: 4 }} />
                      </Box>
                    </Stack>
                  </Box>
                </Stack>
              )}

              {tab === 1 && (
                <Table size="small">
                  <TableHead><TableRow sx={{ bgcolor: 'action.hover' }}><TableCell>Date</TableCell><TableCell>Status</TableCell><TableCell>Check-in</TableCell><TableCell>Check-out</TableCell><TableCell>Duration</TableCell></TableRow></TableHead>
                  <TableBody>
                    {attendance.map((a) => (
                      <TableRow key={a.id} hover>
                        <TableCell>{formatDate(a.date)}</TableCell>
                        <TableCell><StatusChip status={a.status} /></TableCell>
                        <TableCell sx={{ fontFamily: 'mono' }}>{a.checkIn || '—'}</TableCell>
                        <TableCell sx={{ fontFamily: 'mono' }}>{a.checkOut || '—'}</TableCell>
                        <TableCell sx={{ fontFamily: 'mono' }}>{a.hoursWorked} hrs</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {tab === 2 && (
                <Table size="small">
                  <TableHead><TableRow sx={{ bgcolor: 'action.hover' }}><TableCell>Type</TableCell><TableCell>From</TableCell><TableCell>To</TableCell><TableCell>Days</TableCell><TableCell>Status</TableCell></TableRow></TableHead>
                  <TableBody>
                    {leaves.map((l) => (
                      <TableRow key={l.id} hover>
                        <TableCell>{titleCase(l.leaveType)}</TableCell>
                        <TableCell>{formatDate(l.startDate)}</TableCell>
                        <TableCell>{formatDate(l.endDate)}</TableCell>
                        <TableCell sx={{ fontFamily: 'mono' }}>{l.totalDays}</TableCell>
                        <TableCell><StatusChip status={l.status} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {tab === 3 && (
                <Table size="small">
                  <TableHead><TableRow sx={{ bgcolor: 'action.hover' }}><TableCell>Period</TableCell><TableCell>Base Pay</TableCell><TableCell>Net Credit</TableCell><TableCell>Status</TableCell></TableRow></TableHead>
                  <TableBody>
                    {payroll.map((p) => (
                      <TableRow key={p.id} hover>
                        <TableCell>{formatMonthYear(p.month, p.year)}</TableCell>
                        <TableCell sx={{ fontFamily: 'mono' }}>{formatCurrency(p.grossPay)}</TableCell>
                        <TableCell sx={{ fontFamily: 'mono', fontWeight: 800 }}>{formatCurrency(p.netPay)}</TableCell>
                        <TableCell><StatusChip status={p.status} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {tab === 4 && (
                <Stack spacing={2.5}>
                  {performance.map((p) => (
                    <Paper key={p.id} variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                          {p.quarter} {p.year} Review
                        </Typography>
                        <Chip icon={<WorkspacePremiumOutlinedIcon />} size="small" label={`${p.rating}.0 High Performer`} color="secondary" />
                      </Stack>
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                        "{p.managerFeedback}"
                      </Typography>
                      <Divider sx={{ my: 2 }} />
                      <Stack direction="row" spacing={4}>
                        <Box>
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>KPI Score</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 800 }}>{p.kpiScore}%</Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Review Date</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 800 }}>{formatDate(p.reviewDate)}</Typography>
                        </Box>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              )}
            </Box>
          </Paper>

          {/* New Personal Widget */}
          <Paper sx={{ p: 3, borderRadius: 2, bgcolor: 'primary.main', color: 'white' }}>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>Ready for the next big thing?</Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>Check out internal job openings tailored for your skills.</Typography>
              </Box>
              <Button variant="contained" color="secondary" sx={{ fontWeight: 800 }}>Explore Roles</Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

function DetailBox({ label, value, icon }) {
  return (
    <Box sx={{ textAlign: 'left' }}>
      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5 }}>
        {icon} {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 600, wordBreak: 'break-all' }}>{value}</Typography>
    </Box>
  );
}

function DetailRow({ label, value }) {
  return (
    <Stack direction="row" sx={{ justifyContent: 'space-between', py: 1, borderBottom: '1px dashed', borderColor: 'divider' }}>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>{label}</Typography>
      <Typography variant="body2" sx={{ fontWeight: 700 }}>{value}</Typography>
    </Stack>
  );
}
