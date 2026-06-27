import { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Stack, Button, Grid, Chip, IconButton,
  List, ListItem, ListItemText, ListItemSecondaryAction, Checkbox,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  Avatar, CircularProgress, Tabs, Tab, Divider, Autocomplete
} from '@mui/material';
import { DeleteOutlined as DeleteOutlineIcon, Add as AddIcon, Assignment as AssignmentIcon } from '@mui/icons-material';
import PageHeader from '../components/common/PageHeader';
import { taskApi } from '../api/services/taskApi';
import { employeeApi } from '../api/services/employeeApi';
import { formatDate, titleCase, initials } from '../utils/formatters';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState(0);
  const [formData, setFormData] = useState({
    title: '', description: '', priority: 'medium', assignedToId: '', dueDate: ''
  });

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const { data } = await taskApi.list();
      setTasks(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    employeeApi.list({ limit: 5000 }).then(({ data }) => setEmployees(data.data));
  }, []);

  const handleToggle = async (task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      await taskApi.update(task.id, { status: newStatus });
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this task?')) {
      try {
        await taskApi.delete(id);
        fetchTasks();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await taskApi.create(formData);
      setOpen(false);
      setFormData({ title: '', description: '', priority: 'medium', assignedToId: '', dueDate: '' });
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const priorityColor = {
    low: 'success',
    medium: 'info',
    high: 'warning',
    critical: 'error'
  };

  const filteredTasks = tab === 0 ? tasks : tasks.filter(t => {
    if (tab === 1) return t.status === 'pending' || t.status === 'in_progress';
    if (tab === 2) return t.status === 'completed';
    if (tab === 3) return t.status === 'overdue';
    return true;
  });

  return (
    <Box>
      <PageHeader
        title="Tasks"
        subtitle="Manage and track work assignments"
        actions={<Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>New Task</Button>}
      />

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 0 }}>
            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2, pt: 1 }}>
              <Tab label="All Tasks" />
              <Tab label="Active" />
              <Tab label="Completed" />
              <Tab label="Overdue" />
            </Tabs>
            <Divider />
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <AssignmentIcon color="primary" />
              <Typography variant="h6" fontWeight={700}>Task List</Typography>
            </Box>
            {loading ? (
              <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>
            ) : (
              <List sx={{ py: 0 }}>
                {filteredTasks.length === 0 ? (
                  <Typography variant="body2" sx={{ p: 4, textAlign: 'center' }} color="text.secondary">No tasks found</Typography>
                ) : filteredTasks.map((task) => (
                  <ListItem key={task.id} divider hover>
                    <Checkbox
                      checked={task.status === 'completed'}
                      onChange={() => handleToggle(task)}
                    />
                    <ListItemText
                      primary={
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="body1" sx={{
                            fontWeight: 600,
                            textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                            color: task.status === 'completed' ? 'text.disabled' : 'text.primary'
                          }}>
                            {task.title}
                          </Typography>
                          <Chip size="small" label={task.priority} color={priorityColor[task.priority]} variant="outlined" sx={{ fontSize: '0.6rem', height: 16 }} />
                          {task.status === 'overdue' && <Chip size="small" label="Overdue" color="error" sx={{ fontSize: '0.6rem', height: 16 }} />}
                        </Stack>
                      }
                      secondary={
                        <Box component="span">
                          <Typography variant="caption" display="block" color="text.secondary">{task.description}</Typography>
                          <Typography variant="caption" color="text.disabled">
                            Due: {task.dueDate ? formatDate(task.dueDate) : 'No date'} · Assigned to: {task.assignee?.firstName} {task.assignee?.lastName}
                          </Typography>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton edge="end" size="small" onClick={() => handleDelete(task.id)}>
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Task Summary</Typography>
            <Stack spacing={2}>
              <Box>
                <Typography variant="caption" color="text.secondary">Total Tasks</Typography>
                <Typography variant="h5" fontWeight={700}>{tasks.length}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Completed</Typography>
                <Typography variant="h5" fontWeight={700} color="success.main">
                  {tasks.filter(t => t.status === 'completed').length}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Active</Typography>
                <Typography variant="h5" fontWeight={700} color="warning.main">
                  {tasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Overdue</Typography>
                <Typography variant="h5" fontWeight={700} color="error.main">
                  {tasks.filter(t => t.status === 'overdue').length}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Assign New Task</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent dividers>
            <Stack spacing={2.5}>
              <TextField
                fullWidth label="Task Title" required
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
              <TextField
                fullWidth label="Description" multiline rows={3}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    select fullWidth label="Priority"
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  >
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="critical">Critical</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth label="Due Date" type="date" InputLabelProps={{ shrink: true }}
                    value={formData.dueDate}
                    onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                  />
                </Grid>
              </Grid>
              <Autocomplete
                options={employees}
                getOptionLabel={(option) => `${option.firstName} ${option.lastName} (${option.employeeCode})`}
                value={employees.find(e => e.id === formData.assignedToId) || null}
                onChange={(_, newValue) => setFormData({...formData, assignedToId: newValue?.id || ''})}
                renderInput={(params) => <TextField {...params} label="Assign To" required />}
                renderOption={(props, option) => {
                  const { key, ...otherProps } = props;
                  return (
                    <Box component="li" key={option.id} {...otherProps} sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                      <Avatar src={option.profilePicture} sx={{ width: 24, height: 24, fontSize: '0.7rem' }}>
                        {initials(option.firstName, option.lastName)}
                      </Avatar>
                      <Typography variant="body2">{option.firstName} {option.lastName} ({option.employeeCode})</Typography>
                    </Box>
                  );
                }}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Create Task</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
