import { useState, useEffect } from 'react';
import {
  Box, Paper, Button, Table, TableHead, TableRow, TableCell, TableBody,
  Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Stack
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PageHeader from '../components/common/PageHeader';
import { expenseApi } from '../api/services/expenseApi';
import { formatCurrency, titleCase, formatDate } from '../utils/formatters';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../features/auth/authSlice';

export default function Expenses() {
  const user = useSelector(selectCurrentUser);
  const isApprover = ['super_admin', 'hr', 'manager'].includes(user?.role);
  const [expenses, setExpenses] = useState([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', amount: '', category: 'travel' });

  const fetch = () => expenseApi.list().then(({ data }) => setExpenses(data.data));

  useEffect(() => { fetch(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await expenseApi.create(formData);
    setOpen(false);
    fetch();
  };

  const handleDecision = async (id, status) => {
    await expenseApi.approve(id, { status });
    fetch();
  };

  return (
    <Box>
      <PageHeader title="Expense Management" subtitle="Submit and track reimbursement claims" actions={<Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>New Claim</Button>} />
      <Paper>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Employee</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Status</TableCell>
              {isApprover && <TableCell align="right">Action</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {expenses.map((e) => (
              <TableRow key={e.id}>
                <TableCell>{formatDate(e.createdAt)}</TableCell>
                <TableCell>{e.employee?.firstName} {e.employee?.lastName}</TableCell>
                <TableCell>{e.title}</TableCell>
                <TableCell>{titleCase(e.category)}</TableCell>
                <TableCell sx={{ fontFamily: 'mono' }}>{formatCurrency(e.amount)}</TableCell>
                <TableCell><Chip size="small" label={e.status} color={e.status === 'paid' ? 'success' : e.status === 'pending' ? 'warning' : 'default'} /></TableCell>
                {isApprover && (
                  <TableCell align="right">
                    {e.status === 'pending' && (
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Button size="xs" color="success" onClick={() => handleDecision(e.id, 'approved')}>Approve</Button>
                        <Button size="xs" color="error" onClick={() => handleDecision(e.id, 'rejected')}>Reject</Button>
                      </Stack>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Submit New Claim</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField fullWidth label="Title/Purpose" required onChange={e => setFormData({...formData, title: e.target.value})} />
              <TextField fullWidth label="Amount" type="number" required onChange={e => setFormData({...formData, amount: e.target.value})} />
              <TextField select fullWidth label="Category" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                <MenuItem value="travel">Travel</MenuItem>
                <MenuItem value="food">Food</MenuItem>
                <MenuItem value="internet">Internet</MenuItem>
                <MenuItem value="medical">Medical</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </TextField>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Submit</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
