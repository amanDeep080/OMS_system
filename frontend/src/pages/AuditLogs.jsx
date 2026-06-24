import { useEffect, useState } from 'react';
import { Box, Paper, Table, TableHead, TableRow, TableCell, TableBody, Typography, Chip } from '@mui/material';
import PageHeader from '../components/common/PageHeader';
import API from '../api/axiosClient';
import { formatDate } from '../utils/formatters';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    API.get('/audit-logs').then(({ data }) => setLogs(data.data)).catch(() => {});
  }, []);

  return (
    <Box>
      <PageHeader title="Audit Logs" subtitle="Security and activity tracking across the system" />
      <Paper>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Timestamp</TableCell>
              <TableCell>Module</TableCell>
              <TableCell>Action</TableCell>
              <TableCell>User</TableCell>
              <TableCell>IP Address</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>{formatDate(log.createdAt)}</TableCell>
                <TableCell><Chip size="small" label={log.module} variant="outlined" /></TableCell>
                <TableCell><Typography variant="body2" sx={{ fontWeight: 600 }}>{log.action}</Typography></TableCell>
                <TableCell>{log.user?.email || 'System'}</TableCell>
                <TableCell sx={{ fontFamily: 'mono', fontSize: '0.75rem' }}>{log.ipAddress}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
