import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './guards/ProtectedRoute';
import { RoleRoute } from './guards/RoleRoute';
import { AppShell } from './layout/AppShell';
import { HomePage } from '../pages/home/HomePage';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { AidantProfilePage } from '../pages/profile/AidantProfilePage';
import { PublishRequestPage } from '../pages/requests/PublishRequestPage';
import { RequestsListPage } from '../pages/requests/RequestsListPage';
import { MyRequestsPage } from '../pages/requests/MyRequestsPage';
import { RequestCandidatesPage } from '../pages/requests/RequestCandidatesPage';
import { MyApplicationsPage } from '../pages/applications/MyApplicationsPage';
import { ApplicationDetailPage } from '../pages/applications/ApplicationDetailPage';

function ProtectedAppShell() {
  return (
    <ProtectedRoute>
      <AppShell />
    </ProtectedRoute>
  );
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedAppShell />}>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/profile/aidant"
          element={
            <RoleRoute roles={['aidant']}>
              <AidantProfilePage />
            </RoleRoute>
          }
        />
        <Route
          path="/requests/new"
          element={
            <RoleRoute roles={['demandeur']}>
              <PublishRequestPage />
            </RoleRoute>
          }
        />
        <Route
          path="/requests/mine/:id"
          element={
            <RoleRoute roles={['demandeur']}>
              <RequestCandidatesPage />
            </RoleRoute>
          }
        />
        <Route
          path="/requests/mine"
          element={
            <RoleRoute roles={['demandeur']}>
              <MyRequestsPage />
            </RoleRoute>
          }
        />
        <Route
          path="/requests"
          element={
            <RoleRoute roles={['aidant']}>
              <RequestsListPage />
            </RoleRoute>
          }
        />
        <Route
          path="/applications/mine/:id"
          element={
            <RoleRoute roles={['aidant']}>
              <ApplicationDetailPage />
            </RoleRoute>
          }
        />
        <Route
          path="/applications/mine"
          element={
            <RoleRoute roles={['aidant']}>
              <MyApplicationsPage />
            </RoleRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
