import { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Stack, Button, Table, TableHead, TableRow, TableCell,
  TableBody, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Autocomplete, Avatar
} from '@mui/material';
import LaptopIcon from '@mui/icons-material/Laptop';
import AddIcon from '@mui/icons-material/Add';
import PageHeader from '../components/common/PageHeader';
import { assetApi } from '../api/services/assetApi';
import { employeeApi } from '../api/services/employeeApi';
import { titleCase, initials } from '../utils/formatters';

export default function Assets() {
  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', type: 'laptop', serialNumber: '' });

  const fetch = () => assetApi.list().then(({ data }) => setAssets(data.data));

  useEffect(() => {
    fetch();
    employeeApi.list({ limit: 5000 }).then(({ data }) => setEmployees(data.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await assetApi.create(formData);
    setOpen(false);
    fetch();
  };

  const handleAssign = async (id, empId) => {
    await assetApi.assign(id, empId);
    fetch();
  };

  return (
    <Box>
      <PageHeader title="Asset Management" subtitle="Track and assign company hardware" actions={<Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>Add Asset</Button>} />
      <Paper>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Asset Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Serial Number</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Assigned To</TableCell>
              <TableCell align="right">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {assets.map((a) => (
              <TableRow key={a.id}>
                <TableCell><Stack direction="row" spacing={1} alignItems="center"><LaptopIcon fontSize="small" color="primary" /> <Typography variant="body2">{a.name}</Typography></Stack></TableCell>
                <TableCell>{titleCase(a.type)}</TableCell>
                <TableCell sx={{ fontFamily: 'mono' }}>{a.serialNumber}</TableCell>
                <TableCell><Chip size="small" label={a.status} color={a.status === 'available' ? 'success' : 'info'} /></TableCell>
                <TableCell>{a.user ? `${a.user.firstName} ${a.user.lastName}` : '—'}</TableCell>
                <TableCell align="right">
                  {a.status === 'available' && (
                    <Autocomplete
                      size="small"
                      options={employees}
                      getOptionLabel={(option) => `${option.firstName} ${option.lastName} (${option.employeeCode})`}
                      onChange={(_, newValue) => {
                        if (newValue) handleAssign(a.id, newValue.id);
                      }}
                      renderInput={(params) => <TextField {...params} label="Assign" sx={{ width: 200 }} />}
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
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Add New Asset</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField fullWidth label="Asset Name" required onChange={e => setFormData({...formData, name: e.target.value})} />
              <TextField select fullWidth label="Type" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                <MenuItem value="laptop">Laptop</MenuItem>
                <MenuItem value="monitor">Monitor</MenuItem>
                <MenuItem value="phone">Phone</MenuItem>
                <MenuItem value="headset">Headset</MenuItem>
              </TextField>
              <TextField fullWidth label="Serial Number" onChange={e => setFormData({...formData, serialNumber: e.target.value})} />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Create</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
