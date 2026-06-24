// Design tokens for the Spreetail HR Portal.
// Aesthetic direction: confident, institutional "Fortune 500 system of record" —
// steel navy + warm bronze accent (not the typical SaaS blue/purple), with a
// ledger-style monospace treatment for IDs, codes and currency to reinforce
// the feeling of a real payroll/HR record system rather than a generic dashboard.

export const colors = {
  ink: '#0F1B2D',
  inkSoft: '#1C2B40',
  navy: '#1F3A5F',
  navyDeep: '#142844',
  bronze: '#C8893B',
  bronzeSoft: '#E0AD6B',
  paper: '#F4F6F8',
  paperWarm: '#FAF9F6',
  line: '#DDE3EA',
  lineDark: '#2A3A52',
  success: '#2F855A',
  warning: '#B7791B',
  danger: '#C53030',
  info: '#2B6CB0',
  textMuted: '#5B6B82',
};

export const fontFamilies = {
  display: '"Space Grotesk", "Segoe UI", sans-serif',
  body: '"Inter", "Segoe UI", sans-serif',
  mono: '"IBM Plex Mono", "Roboto Mono", monospace',
};

// Department accent colors, also seeded server-side in Department.colorTag
export const departmentColors = {
  ENG: '#1F3A5F',
  PRD: '#2B6CB0',
  HR: '#C8893B',
  FIN: '#2F855A',
  MKT: '#B83280',
  OPS: '#6B46C1',
  CS: '#319795',
  SAL: '#C53030',
  LOG: '#975A16',
  PRC: '#4A5568',
};
