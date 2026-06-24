import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, TextField, MenuItem,
  Typography, Box, Alert, CircularProgress, Divider
} from '@mui/material';
import { employeeApi } from '../../api/services/employeeApi';
import { departmentApi } from '../../api/services/departmentApi';

export default function AddEmployeeDialog({ open, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [departments, setDepartments] = useState([]);
  const [managers, setManagers] = useState([]);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: 'male',
    dateOfBirth: '',
    departmentId: '',
    designation: '',
    managerId: '',
    employmentType: 'full_time',
    joiningDate: new Date().toISOString().slice(0, 10),
    annualSalary: '',
    role: 'employee',
    password: ''
  });

  useEffect(() => {
    if (open) {
      setLoading(true);
      Promise.all([
        departmentApi.list(),
        employeeApi.list({ limit: 5000 })
      ])
      .then(([deptRes, empRes]) => {
        setDepartments(deptRes.data.data || []);
        setManagers(empRes.data.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    }
  }, [open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await employeeApi.create(formData);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create employee');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Onboard New Personnel</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 2 }}>Biographical Information</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} required size="small" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} required size="small" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Corporate Email" name="email" type="email" value={formData.email} onChange={handleChange} required size="small" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} required size="small" />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField select fullWidth label="Gender" name="gender" value={formData.gender} onChange={handleChange} size="small">
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth label="Date of Birth" name="dateOfBirth" type="date"
                value={formData.dateOfBirth} onChange={handleChange}
                slotProps={{ inputLabel: { shrink: true } }}
                size="small"
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />
          <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 2 }}>Organizational Assignment</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField select fullWidth label="Department" name="departmentId" value={formData.departmentId} onChange={handleChange} required size="small">
                {departments.map(d => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Designation" name="designation" value={formData.designation} onChange={handleChange} required size="small" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField select fullWidth label="Reporting Manager" name="managerId" value={formData.managerId} onChange={handleChange} size="small">
                <MenuItem value="">Direct to Board/CEO</MenuItem>
                {managers.map(m => <MenuItem key={m.id} value={m.id}>{m.firstName} {m.lastName}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField select fullWidth label="Employment Type" name="employmentType" value={formData.employmentType} onChange={handleChange} size="small">
                <MenuItem value="full_time">Full Time</MenuItem>
                <MenuItem value="part_time">Part Time</MenuItem>
                <MenuItem value="contract">Contract</MenuItem>
                <MenuItem value="intern">Intern</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth label="Joining Date" name="joiningDate" type="date"
                value={formData.joiningDate} onChange={handleChange}
                slotProps={{ inputLabel: { shrink: true } }}
                required size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Base Annual Salary ($)" name="annualSalary" type="number" value={formData.annualSalary} onChange={handleChange} required size="small" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField select fullWidth label="Authorization Role" name="role" value={formData.role} onChange={handleChange} size="small">
                <MenuItem value="employee">Employee</MenuItem>
                <MenuItem value="manager">Manager</MenuItem>
                <MenuItem value="hr">HR Professional</MenuItem>
                <MenuItem value="super_admin">System Administrator</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Initial Password" name="password" type="password" value={formData.password} onChange={handleChange} required size="small" />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={onClose} disabled={submitting}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={submitting || loading} startIcon={submitting && <CircularProgress size={16} />}>
            Finalize Onboarding
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
