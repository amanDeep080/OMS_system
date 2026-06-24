import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import { buildTheme } from './theme/buildTheme';
import { selectThemeMode } from './features/ui/uiSlice';

import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './routes/ProtectedRoute';

import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import EmployeeDetail from './pages/EmployeeDetail';
import Attendance from './pages/Attendance';
import Leave from './pages/Leave';
import Payroll from './pages/Payroll';
import Performance from './pages/Performance';
import Announcements from './pages/Announcements';
import Reports from './pages/Reports';
import Recruitment from './pages/Recruitment';
import Documents from './pages/Documents';
import Tasks from './pages/Tasks';
import Assets from './pages/Assets';
import OrgChart from './pages/OrgChart';
import AuditLogs from './pages/AuditLogs';
import Expenses from './pages/Expenses';
import SocialFeed from './pages/SocialFeed';
import CareerGrowth from './pages/CareerGrowth';
import Rewards from './pages/Rewards';
import Learning from './pages/Learning';
import Communities from './pages/Communities';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

// v1.0.1 - Force Refresh
export default function App() {
  const themeMode = useSelector(selectThemeMode);
  const theme = useMemo(() => buildTheme(themeMode), [themeMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider maxSnack={3} autoHideDuration={3500}>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/employees" element={<Employees />} />
                <Route path="/employees/:id" element={<EmployeeDetail />} />
                <Route path="/org-chart" element={<OrgChart />} />
                <Route path="/tasks" element={<Tasks />} />
                <Route path="/assets" element={<Assets />} />
                <Route path="/expenses" element={<Expenses />} />
                <Route path="/social" element={<SocialFeed />} />
                <Route path="/career" element={<CareerGrowth />} />
                <Route path="/rewards" element={<Rewards />} />
                <Route path="/learning" element={<Learning />} />
                <Route path="/communities" element={<Communities />} />
                <Route path="/attendance" element={<Attendance />} />
                <Route path="/leave" element={<Leave />} />
                <Route path="/payroll" element={<Payroll />} />
                <Route path="/performance" element={<Performance />} />
                <Route path="/announcements" element={<Announcements />} />
                <Route path="/documents" element={<Documents />} />
                <Route path="/settings" element={<Settings />} />

                <Route element={<ProtectedRoute allowedRoles={['super_admin', 'hr', 'manager']} />}>
                  <Route path="/reports" element={<Reports />} />
                </Route>
                <Route element={<ProtectedRoute allowedRoles={['super_admin']} />}>
                  <Route path="/audit-logs" element={<AuditLogs />} />
                </Route>
                <Route element={<ProtectedRoute allowedRoles={['super_admin', 'hr']} />}>
                  <Route path="/recruitment" element={<Recruitment />} />
                </Route>
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </SnackbarProvider>
    </ThemeProvider>
  );
}
