import { useEffect, useState, useCallback } from 'react';
import {
  Box, Paper, TextField, MenuItem, Table, TableHead, TableRow, TableCell, TableBody,
  Avatar, Stack, Typography, TablePagination, Button, InputAdornment,
} from '@mui/material';
import { SearchOutlined as SearchOutlinedIcon, AddOutlined as AddOutlinedIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import PageHeader from '../components/common/PageHeader';
import StatusChip from '../components/common/StatusChip';
import { LoadingScreen, EmptyState } from '../components/common/States';
import { employeeApi } from '../api/services/employeeApi';
import { departmentApi } from '../api/services/departmentApi';
import { initials } from '../utils/formatters';
import { selectCurrentUser } from '../features/auth/authSlice';
import AddEmployeeDialog from '../components/employees/AddEmployeeDialog';

export default function Employees() {
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const canManage = ['super_admin', 'hr'].includes(user?.role);

  const [rows, setRows] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const fetchEmployees = useCallback(() => {
    setLoading(true);
    employeeApi
      .list({ search, departmentId, status, page: page + 1, limit: rowsPerPage })
      .then(({ data }) => {
        setRows(data.data);
        setTotal(data.pagination.totalRecords);
      })
      .finally(() => setLoading(false));
  }, [search, departmentId, status, page, rowsPerPage]);

  useEffect(() => {
    departmentApi.list().then(({ data }) => setDepartments(data.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setTimeout(fetchEmployees, 300);
    return () => clearTimeout(timer);
  }, [fetchEmployees]);

  return (
    <Box>
      <PageHeader
        title="Employee Directory"
        subtitle={`${total} people across Spreetail`}
        actions={canManage && <Button variant="contained" startIcon={<AddOutlinedIcon />} onClick={() => setAddDialogOpen(true)}>Add employee</Button>}
      />

      <AddEmployeeDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onSuccess={fetchEmployees}
      />

      <Paper sx={{ p: 2, mb: 2.5 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <TextField
            size="small"
            placeholder="Search by name, code, or email"
            value={search}
            onChange={(e) => { setPage(0); setSearch(e.target.value); }}
            sx={{ flex: 1 }}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchOutlinedIcon fontSize="small" /></InputAdornment> }}
          />
          <TextField select size="small" label="Department" value={departmentId} onChange={(e) => { setPage(0); setDepartmentId(e.target.value); }} sx={{ width: { xs: '100%', sm: 200 } }}>
            <MenuItem value="">All departments</MenuItem>
            {departments.map((d) => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}
          </TextField>
          <TextField select size="small" label="Status" value={status} onChange={(e) => { setPage(0); setStatus(e.target.value); }} sx={{ width: { xs: '100%', sm: 160 } }}>
            <MenuItem value="">All statuses</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="on_leave">On Leave</MenuItem>
            <MenuItem value="terminated">Terminated</MenuItem>
            <MenuItem value="resigned">Resigned</MenuItem>
          </TextField>
        </Stack>
      </Paper>

      <Paper>
        {loading ? (
          <LoadingScreen label="Loading employees…" />
        ) : rows.length === 0 ? (
          <EmptyState title="No employees match these filters" description="Try adjusting your search or filters." />
        ) : (
          <>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Employee</TableCell>
                  <TableCell>Code</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Designation</TableCell>
                  <TableCell>Joined</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((emp) => (
                  <TableRow
                    key={emp.id}
                    hover
                    onClick={() => navigate(`/employees/${emp.id}`)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar src={emp.profilePicture} sx={{ width: 30, height: 30, fontSize: '0.75rem' }}>
                          {initials(emp.firstName, emp.lastName)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {emp.firstName} {emp.lastName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">{emp.email}</Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ fontFamily: 'mono', fontSize: '0.8rem' }}>{emp.employeeCode}</TableCell>
                    <TableCell>{emp.department?.name || '—'}</TableCell>
                    <TableCell>{emp.designation}</TableCell>
                    <TableCell>{new Date(emp.joiningDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</TableCell>
                    <TableCell><StatusChip status={emp.employmentStatus} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={total}
              page={page}
              onPageChange={(_, p) => setPage(p)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(0); }}
              rowsPerPageOptions={[10, 25, 50]}
            />
          </>
        )}
      </Paper>
    </Box>
  );
}
