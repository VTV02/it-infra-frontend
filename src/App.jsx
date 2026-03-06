import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import OfflineBar from './components/OfflineBar';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import IncidentsPage from './pages/IncidentsPage';
import AssetsPage from './pages/AssetsPage';
import MaintenancePage from './pages/MaintenancePage';
import ReportsPage from './pages/ReportsPage';
import StaffManagementPage from './pages/StaffManagementPage';
import DeploymentPlanPage from './pages/DeploymentPlanPage';
import WelcomePage from './pages/WelcomePage';

export default function App() {
  return (
    <>
    <OfflineBar />
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route path="/welcome" element={<ProtectedRoute><WelcomePage /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />

      <Route path="/incidents" element={<ProtectedRoute><IncidentsPage /></ProtectedRoute>} />

      <Route
        path="/assets"
        element={
          <ProtectedRoute roles={['it_staff', 'admin']}>
            <AssetsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/maintenance"
        element={
          <ProtectedRoute roles={['it_staff', 'admin']}>
            <MaintenancePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/reports"
        element={
          <ProtectedRoute roles={['manager', 'admin']}>
            <ReportsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/staff"
        element={
          <ProtectedRoute roles={['admin']}>
            <StaffManagementPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/deployment-plans"
        element={
          <ProtectedRoute roles={['it_staff', 'admin']}>
            <DeploymentPlanPage />
          </ProtectedRoute>
        }
      />

      {/* Redirect root to dashboard */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
    </>
  );
}
