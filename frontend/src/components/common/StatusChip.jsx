import { Chip } from '@mui/material';
import { STATUS_COLORS, titleCase } from '../../utils/formatters';

export default function StatusChip({ status, size = 'small' }) {
  const color = STATUS_COLORS[status] || 'default';
  return <Chip label={titleCase(status)} color={color} size={size} variant={color === 'default' ? 'outlined' : 'filled'} />;
}
