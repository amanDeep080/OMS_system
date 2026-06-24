import { createTheme } from '@mui/material/styles';
import { colors, fontFamilies } from './tokens';

export function buildTheme(mode) {
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary: { main: colors.navy, light: '#3C5C85', dark: colors.navyDeep, contrastText: '#fff' },
      secondary: { main: colors.bronze, light: colors.bronzeSoft, dark: '#A66B27', contrastText: '#1A1A1A' },
      success: { main: colors.success },
      warning: { main: colors.warning },
      error: { main: colors.danger },
      info: { main: colors.info },
      background: {
        default: isDark ? colors.ink : colors.paper,
        paper: isDark ? colors.inkSoft : '#FFFFFF',
      },
      text: {
        primary: isDark ? '#EDEFF2' : colors.ink,
        secondary: isDark ? '#A9B4C4' : colors.textMuted,
      },
      divider: isDark ? colors.lineDark : colors.line,
    },
    shape: { borderRadius: 8 },
    typography: {
      fontFamily: fontFamilies.body,
      h1: { fontFamily: fontFamilies.display, fontWeight: 600 },
      h2: { fontFamily: fontFamilies.display, fontWeight: 600 },
      h3: { fontFamily: fontFamilies.display, fontWeight: 600 },
      h4: { fontFamily: fontFamilies.display, fontWeight: 600 },
      h5: { fontFamily: fontFamilies.display, fontWeight: 600 },
      h6: { fontFamily: fontFamilies.display, fontWeight: 600 },
      button: { fontWeight: 600, textTransform: 'none' },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: { borderRadius: 6, boxShadow: 'none' },
          contained: { boxShadow: 'none', '&:hover': { boxShadow: 'none' } },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            border: `1px solid ${isDark ? colors.lineDark : colors.line}`,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            border: `1px solid ${isDark ? colors.lineDark : colors.line}`,
            boxShadow: 'none',
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          head: {
            fontFamily: fontFamilies.mono,
            fontSize: '0.7rem',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: isDark ? '#8693A6' : colors.textMuted,
            borderBottom: `1px solid ${isDark ? colors.lineDark : colors.line}`,
          },
          body: {
            borderBottom: `1px solid ${isDark ? colors.lineDark : colors.line}`,
          },
        },
      },
      MuiChip: {
        styleOverrides: { root: { fontWeight: 600 } },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: 'none',
            borderBottom: `1px solid ${isDark ? colors.lineDark : colors.line}`,
          },
        },
      },
    },
  });
}
