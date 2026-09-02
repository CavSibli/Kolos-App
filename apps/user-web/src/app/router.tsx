import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './guards/ProtectedRoute';
import { RoleRoute } from './guards/RoleRoute';
import { HomePage } from '../pages/home/HomePage';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { AidantProfilePage } from '../pages/profile/AidantProfilePage';
import { PublishRequestPage } from '../pages/requests/PublishRequestPage';
import { RequestsListPage } from '../pages/requests/RequestsListPage';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/aidant"
        element={
          <ProtectedRoute>
            <RoleRoute roles={['aidant']}>
              <AidantProfilePage />
            </RoleRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/requests/new"
        element={
          <ProtectedRoute>
            <RoleRoute roles={['demandeur']}>
              <PublishRequestPage />
            </RoleRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/requests"
        element={
          <ProtectedRoute>
            <RoleRoute roles={['aidant']}>
              <RequestsListPage />
            </RoleRoute>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
