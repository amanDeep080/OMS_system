import { useEffect, useState } from 'react';
import {
  Box, Paper, List, ListItem, ListItemIcon, ListItemText, Button, Chip,
  IconButton, Stack, Typography, Grid, TextField, MenuItem, Dialog,
  DialogTitle, DialogContent, DialogActions, LinearProgress, Alert, Autocomplete
} from '@mui/material';
import {
  InsertDriveFileOutlined as InsertDriveFileOutlinedIcon,
  DeleteOutlined as DeleteOutlineIcon,
  CloudUploadOutlined as CloudUploadOutlinedIcon
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import PageHeader from '../components/common/PageHeader';
import { LoadingScreen, EmptyState } from '../components/common/States';
import API from '../api/axiosClient';
import { selectCurrentUser } from '../features/auth/authSlice';
import { titleCase, formatDate } from '../utils/formatters';
import { employeeApi } from '../api/services/employeeApi';

const DOC_TYPES = [
  { value: 'offer_letter', label: 'Offer Letter' },
  { value: 'appointment_letter', label: 'Appointment Letter' },
  { value: 'experience_letter', label: 'Experience Letter' },
  { value: 'salary_slip', label: 'Salary Slip' },
  { value: 'contract', label: 'Contract' },
  { value: 'hr_policy', label: 'HR Policy' },
  { value: 'employee_document', label: 'Employee Document' },
  { value: 'other', label: 'Other' },
];

export default function Documents() {
  const user = useSelector(selectCurrentUser);
  const isHR = ['super_admin', 'hr'].includes(user?.role);

  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(user?.employee?.id || '');

  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadForm, setUploadForm] = useState({
    title: '',
    type: 'other',
    employeeId: '',
    file: null
  });

  const fetchDocs = async (empId) => {
    if (!empId) return;
    setLoading(true);
    try {
      const { data } = await API.get(`/uploads/document/employee/${empId}`);
      setDocs(data.data);
    } catch (err) {
      setDocs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isHR) {
      employeeApi.list({ limit: 5000 }).then(({ data }) => setEmployees(data.data));
    }
  }, [isHR]);

  useEffect(() => {
    fetchDocs(selectedEmployeeId);
  }, [selectedEmployeeId]);

  const handleDelete = async (id) => {
    if (window.confirm('Delete this document?')) {
      try {
        await API.delete(`/uploads/document/${id}`);
        fetchDocs(selectedEmployeeId);
      } catch (err) {
        alert('Failed to delete document');
      }
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadForm.file) return setUploadError('Please select a file');

    setUploading(true);
    setUploadError('');

    const formData = new FormData();
    formData.append('file', uploadForm.file);
    formData.append('title', uploadForm.title);
    formData.append('type', uploadForm.type);

    try {
      await API.post(`/uploads/document/${uploadForm.employeeId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploadDialogOpen(false);
      setUploadForm({ title: '', type: 'other', employeeId: '', file: null });
      fetchDocs(selectedEmployeeId);
    } catch (err) {
      setUploadError(err.response?.data?.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

  return (
    <Box>
      <PageHeader
        title="Documents"
        subtitle="Manage employee records, contracts, and policies."
        actions={isHR && (
          <Button
            variant="contained"
            startIcon={<CloudUploadOutlinedIcon />}
            onClick={() => setUploadDialogOpen(true)}
          >
            Upload Document
          </Button>
        )}
      />

      <Grid container spacing={2.5}>
        {isHR && (
          <Grid item xs={12}>
            <Paper sx={{ p: 2, mb: 1 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography variant="body2" sx={{ fontWeight: 600 }}>Filter by Employee:</Typography>
                <Autocomplete
                  size="small"
                  options={employees}
                  getOptionLabel={(option) => `${option.firstName} ${option.lastName} (${option.employeeCode})`}
                  value={employees.find(e => e.id === selectedEmployeeId) || null}
                  onChange={(_, newValue) => setSelectedEmployeeId(newValue?.id || '')}
                  renderInput={(params) => (
                    <TextField {...params} label="Search Employee" sx={{ minWidth: 300 }} />
                  )}
                  sx={{ width: 400 }}
                />
              </Stack>
            </Paper>
          </Grid>
        )}

        <Grid item xs={12}>
          <Paper>
            {loading ? (
              <LoadingScreen label="Loading documents..." />
            ) : docs.length === 0 ? (
              <EmptyState
                title="No documents found"
                description={isHR ? "Select an employee or upload a new document." : "Your documents will appear here."}
              />
            ) : (
              <List>
                {docs.map((d) => (
                  <ListItem key={d.id} divider>
                    <ListItemIcon><InsertDriveFileOutlinedIcon color="primary" /></ListItemIcon>
                    <ListItemText
                      primary={d.title}
                      secondary={formatDate(d.createdAt)}
                    />
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip size="small" label={titleCase(d.type)} variant="outlined" />
                      <Button size="small" href={`${baseUrl}${d.fileUrl}`} target="_blank">View</Button>
                      <Button size="small" component="a" href={`${baseUrl}${d.fileUrl}`} download target="_blank">Download</Button>
                      {isHR && (
                        <IconButton size="small" color="error" onClick={() => handleDelete(d.id)}>
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Stack>
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onClose={() => !uploading && setUploadDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Upload New Document</DialogTitle>
        <form onSubmit={handleUpload}>
          <DialogContent dividers>
            <Stack spacing={2.5}>
              {uploadError && <Alert severity="error">{uploadError}</Alert>}
              <Autocomplete
                options={employees}
                getOptionLabel={(option) => `${option.firstName} ${option.lastName} (${option.employeeCode})`}
                value={employees.find(e => e.id === uploadForm.employeeId) || null}
                onChange={(_, newValue) => setUploadForm({...uploadForm, employeeId: newValue?.id || ''})}
                renderInput={(params) => (
                  <TextField {...params} label="Target Employee" required />
                )}
                fullWidth
              />
              <TextField
                fullWidth label="Document Title" required
                value={uploadForm.title}
                onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})}
              />
              <TextField
                select fullWidth label="Document Type" required
                value={uploadForm.type}
                onChange={(e) => setUploadForm({...uploadForm, type: e.target.value})}
              >
                {DOC_TYPES.map(t => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
              </TextField>
              <Button
                variant="outlined"
                component="label"
                startIcon={<CloudUploadOutlinedIcon />}
              >
                {uploadForm.file ? uploadForm.file.name : 'Choose File'}
                <input
                  type="file"
                  hidden
                  onChange={(e) => setUploadForm({...uploadForm, file: e.target.files[0]})}
                />
              </Button>
              {uploading && <LinearProgress />}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setUploadDialogOpen(false)} disabled={uploading}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={uploading}>Upload</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
