import { useEffect, useState } from 'react';
import { Box, Paper, Typography, Avatar, Stack, CircularProgress, IconButton, Tooltip } from '@mui/material';
import { Tree, TreeNode } from 'react-organizational-chart';
import {
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Fullscreen as FullscreenIcon
} from '@mui/icons-material';
import { employeeApi } from '../api/services/employeeApi';
import { initials } from '../utils/formatters';
import PageHeader from '../components/common/PageHeader';

const EmployeeNode = ({ node }) => (
  <Box
    sx={{
      p: 1.5,
      border: '1px solid',
      borderColor: 'primary.light',
      borderRadius: 2,
      display: 'inline-block',
      bgcolor: 'background.paper',
      minWidth: 180,
      boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
      transition: 'transform 0.2s',
      '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }
    }}
  >
    <Stack direction="row" spacing={1.5} alignItems="center">
      <Avatar src={node.profilePicture} sx={{ width: 36, height: 36, fontSize: '0.85rem', border: '2px solid', borderColor: 'secondary.main' }}>
        {initials(node.firstName, node.lastName)}
      </Avatar>
      <Box textAlign="left">
        <Typography variant="body2" sx={{ fontWeight: 800, fontSize: '0.8rem' }}>{node.firstName} {node.lastName}</Typography>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.65rem', fontWeight: 600 }}>{node.designation}</Typography>
      </Box>
    </Stack>
  </Box>
);

const renderTree = (node) => (
  <TreeNode key={node.id} label={<EmployeeNode node={node} />}>
    {node.directReports?.map((report) => renderTree(report))}
  </TreeNode>
);

export default function OrgChart() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(0.85);

  useEffect(() => {
    employeeApi.list({ limit: 5000 }).then(({ data }) => {
      const emps = data.data;
      const idMap = {};
      emps.forEach(e => idMap[e.id] = { ...e, directReports: [] });

      let root = null;
      emps.forEach(e => {
        if (e.managerId && idMap[e.managerId]) {
          idMap[e.managerId].directReports.push(idMap[e.id]);
        } else if (!e.managerId || e.designation?.toLowerCase().includes('ceo')) {
          root = idMap[e.id];
        }
      });

      setData(root);
      setLoading(false);
    });
  }, []);

  return (
    <Box sx={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      <PageHeader
        title="Command Structure"
        subtitle="Visual reporting lines and organizational hierarchy."
        actions={
          <Stack direction="row" spacing={1}>
            <Tooltip title="Zoom Out"><IconButton size="small" onClick={() => setZoom(z => Math.max(z - 0.1, 0.3))}><ZoomOutIcon /></IconButton></Tooltip>
            <Tooltip title="Reset"><IconButton size="small" onClick={() => setZoom(0.85)}><FullscreenIcon /></IconButton></Tooltip>
            <Tooltip title="Zoom In"><IconButton size="small" onClick={() => setZoom(z => Math.min(z + 0.1, 2))}><ZoomInIcon /></IconButton></Tooltip>
          </Stack>
        }
      />

      <Paper sx={{
        flexGrow: 1,
        overflow: 'auto',
        p: 4,
        bgcolor: 'action.hover',
        borderRadius: 2,
        position: 'relative',
        display: 'flex',
        justifyContent: 'center'
      }}>
        {loading ? (
          <Box sx={{ alignSelf: 'center' }}><CircularProgress /></Box>
        ) : data ? (
          <Box sx={{ transform: `scale(${zoom})`, transformOrigin: 'top center', transition: 'transform 0.3s' }}>
            <Tree
              lineWidth={'2px'}
              lineColor={'#C8893B'}
              lineBorderRadius={'10px'}
              label={<EmployeeNode node={data} />}
            >
              {data.directReports?.map(report => renderTree(report))}
            </Tree>
          </Box>
        ) : (
          <Typography sx={{ alignSelf: 'center' }}>No hierarchy data available</Typography>
        )}
      </Paper>
    </Box>
  );
}
