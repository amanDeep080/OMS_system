import { useEffect, useState } from 'react';
import {
  Box, Paper, Button, Chip, IconButton, Stack, Typography, Grid, TextField,
  MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, LinearProgress,
  Alert, Autocomplete, Card, CardContent, CardActions, Tooltip, Zoom, Fade
} from '@mui/material';
import {
  InsertDriveFileOutlined as InsertDriveFileOutlinedIcon,
  DeleteOutlined as DeleteOutlineIcon,
  CloudUploadOutlined as CloudUploadOutlinedIcon,
  PictureAsPdf as PdfIcon,
  Description as DescriptionIcon,
  VisibilityOutlined as ViewIcon,
  DownloadOutlined as DownloadIcon,
  FilterList as FilterIcon,
  AccountCircleOutlined as AccountIcon
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { alpha } from '@mui/material/styles';
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

const getDocIcon = (type) => {
  const sx = { fontSize: 42 };
  switch (type) {
    case 'offer_letter':
    case 'appointment_letter':
    case 'contract':
      return <PdfIcon sx={{ ...sx, color: '#f44336' }} />;
    case 'salary_slip':
      return <DescriptionIcon sx={{ ...sx, color: '#4caf50' }} />;
    case 'hr_policy':
      return <InsertDriveFileOutlinedIcon sx={{ ...sx, color: '#2196f3' }} />;
    default:
      return <InsertDriveFileOutlinedIcon sx={{ ...sx, color: 'text.secondary' }} />;
  }
};

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
    if (selectedEmployeeId) {
      fetchDocs(selectedEmployeeId);
    }
  }, [selectedEmployeeId]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to permanently delete this document?')) {
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
    if (!uploadForm.employeeId) return setUploadError('Please select a target employee');

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
    <Box sx={{ pb: 6 }}>
      <PageHeader
        title="Documents"
        subtitle="Access and manage official employee records and company policies."
        actions={isHR && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<CloudUploadOutlinedIcon />}
            onClick={() => setUploadDialogOpen(true)}
            sx={{
              px: 3,
              py: 1,
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              '&:hover': { transform: 'translateY(-1px)' }
            }}
          >
            Upload Document
          </Button>
        )}
      />

      <Stack spacing={4}>
        {isHR && (
          <Fade in timeout={500}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: (theme) => theme.palette.mode === 'dark' ? alpha(theme.palette.background.paper, 0.6) : '#fff'
              }}
            >
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems={{ sm: 'center' }}>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ color: 'primary.main' }}>
                  <AccountIcon fontSize="medium" />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                    Select Employee
                  </Typography>
                </Stack>
                <Autocomplete
                  size="small"
                  options={employees}
                  getOptionLabel={(option) => `${option.firstName} ${option.lastName} (${option.employeeCode})`}
                  value={employees.find(e => e.id === selectedEmployeeId) || null}
                  onChange={(_, newValue) => setSelectedEmployeeId(newValue?.id || '')}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Type name or employee code..."
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)'
                        }
                      }}
                    />
                  )}
                  sx={{ flexGrow: 1, maxWidth: 600 }}
                />
              </Stack>
            </Paper>
          </Fade>
        )}

        <Box>
          {loading ? (
            <LoadingScreen label="Retrieving secure records..." />
          ) : docs.length === 0 ? (
            <EmptyState
              title="No Documents Found"
              description={isHR ? "Select an employee to view their files or upload a new record." : "Your digital document vault is currently empty."}
              icon={<InsertDriveFileOutlinedIcon sx={{ fontSize: 80, opacity: 0.1, mb: 2 }} />}
            />
          ) : (
            <Grid container spacing={3}>
              {docs.map((d, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={d.id}>
                  <Zoom in timeout={400 + index * 50}>
                    <Card
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: 3,
                        overflow: 'hidden',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        position: 'relative',
                        '&:hover': {
                          transform: 'translateY(-6px)',
                          boxShadow: (theme) => theme.palette.mode === 'dark'
                            ? '0 12px 32px rgba(0,0,0,0.5)'
                            : '0 12px 32px rgba(0,0,0,0.12)',
                          borderColor: 'primary.light'
                        }
                      }}
                    >
                      <CardContent sx={{ flexGrow: 1, p: 3 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2.5}>
                          <Box sx={{
                            p: 2,
                            borderRadius: 2.5,
                            bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            {getDocIcon(d.type)}
                          </Box>
                          <Chip
                            label={titleCase(d.type)}
                            size="small"
                            variant="outlined"
                            sx={{
                              fontWeight: 700,
                              fontSize: '0.65rem',
                              height: 22,
                              borderRadius: 1.5,
                              color: 'text.secondary',
                              borderColor: 'divider'
                            }}
                          />
                        </Stack>

                        <Typography variant="h6" sx={{ fontSize: '1.05rem', mb: 1, fontWeight: 700, lineHeight: 1.4, color: 'text.primary' }}>
                          {d.title}
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                            {formatDate(d.createdAt)}
                          </Typography>
                        </Stack>
                      </CardContent>

                      <Box sx={{ p: 2, pt: 0, mt: 'auto' }}>
                        <Stack direction="row" spacing={1} sx={{ p: 1.5, borderRadius: 2, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
                          <Button
                            fullWidth
                            size="small"
                            startIcon={<ViewIcon sx={{ fontSize: 18 }} />}
                            href={`${baseUrl}${d.fileUrl}`}
                            target="_blank"
                            sx={{ color: 'text.primary', fontWeight: 600 }}
                          >
                            View
                          </Button>
                          <Button
                            fullWidth
                            size="small"
                            startIcon={<DownloadIcon sx={{ fontSize: 18 }} />}
                            component="a"
                            href={`${baseUrl}${d.fileUrl}`}
                            download
                            target="_blank"
                            sx={{ color: 'text.primary', fontWeight: 600 }}
                          >
                            Get
                          </Button>
                          {isHR && (
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDelete(d.id)}
                              sx={{ ml: 'auto' }}
                            >
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          )}
                        </Stack>
                      </Box>
                    </Card>
                  </Zoom>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Stack>

      {/* Upload Dialog */}
      <Dialog
        open={uploadDialogOpen}
        onClose={() => !uploading && setUploadDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 4, backgroundImage: 'none' }
        }}
      >
        <DialogTitle sx={{ p: 4, pb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>Upload Document</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Securely upload and assign documents to employee profiles.
          </Typography>
        </DialogTitle>
        <form onSubmit={handleUpload}>
          <DialogContent sx={{ p: 4, pt: 1 }}>
            <Stack spacing={3.5}>
              {uploadError && <Alert severity="error" variant="filled" sx={{ borderRadius: 2 }}>{uploadError}</Alert>}

              <Autocomplete
                options={employees}
                getOptionLabel={(option) => `${option.firstName} ${option.lastName} (${option.employeeCode})`}
                value={employees.find(e => e.id === uploadForm.employeeId) || null}
                onChange={(_, newValue) => setUploadForm({...uploadForm, employeeId: newValue?.id || ''})}
                renderInput={(params) => (
                  <TextField {...params} label="Employee Assignment" required placeholder="Search employee..." />
                )}
                fullWidth
              />

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  fullWidth label="Document Title" required
                  placeholder="e.g. Contract-2024"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})}
                />
                <TextField
                  select fullWidth label="Type" required
                  value={uploadForm.type}
                  onChange={(e) => setUploadForm({...uploadForm, type: e.target.value})}
                  sx={{ minWidth: 180 }}
                >
                  {DOC_TYPES.map(t => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
                </TextField>
              </Stack>

              <Box
                sx={{
                  border: '2px dashed',
                  borderColor: uploadForm.file ? 'primary.main' : 'divider',
                  borderRadius: 3,
                  p: 4,
                  textAlign: 'center',
                  bgcolor: (theme) => theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.02) : alpha(theme.palette.common.black, 0.01),
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04)
                  }
                }}
                component="label"
              >
                <input
                  type="file"
                  hidden
                  onChange={(e) => setUploadForm({...uploadForm, file: e.target.files[0]})}
                />
                <CloudUploadOutlinedIcon sx={{ fontSize: 48, color: uploadForm.file ? 'primary.main' : 'text.disabled', mb: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {uploadForm.file ? 'File Selected' : 'Select File'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {uploadForm.file ? uploadForm.file.name : 'Click to browse or drag and drop'}
                </Typography>
                {uploadForm.file && (
                  <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'primary.main', fontWeight: 600 }}>
                    {(uploadForm.file.size / 1024 / 1024).toFixed(2)} MB
                  </Typography>
                )}
              </Box>

              {uploading && (
                <Box>
                  <Stack direction="row" justifyContent="space-between" mb={1}>
                    <Typography variant="caption" color="text.secondary">Processing file...</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>Uploading</Typography>
                  </Stack>
                  <LinearProgress sx={{ borderRadius: 1, height: 8 }} />
                </Box>
              )}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 4, pt: 0 }}>
            <Button
              onClick={() => setUploadDialogOpen(false)}
              disabled={uploading}
              sx={{ fontWeight: 700, color: 'text.secondary' }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={uploading || !uploadForm.file}
              sx={{
                px: 4,
                py: 1.2,
                borderRadius: 2,
                fontWeight: 700,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
            >
              Confirm Upload
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
