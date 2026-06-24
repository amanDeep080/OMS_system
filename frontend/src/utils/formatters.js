export function formatCurrency(value) {
  const n = Number(value || 0);
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

export function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatMonthYear(month, year) {
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export function initials(firstName = '', lastName = '') {
  return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase();
}

export function titleCase(str = '') {
  return str
    .replace(/_/g, ' ')
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export const STATUS_COLORS = {
  present: 'success',
  absent: 'error',
  late: 'warning',
  half_day: 'warning',
  work_from_home: 'info',
  on_leave: 'default',
  pending: 'warning',
  approved: 'success',
  rejected: 'error',
  cancelled: 'default',
  active: 'success',
  terminated: 'error',
  resigned: 'default',
  paid: 'success',
};
