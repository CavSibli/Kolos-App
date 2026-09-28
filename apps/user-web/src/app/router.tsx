import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './guards/ProtectedRoute';
import { RoleRoute } from './guards/RoleRoute';
import { AppShell } from './layout/AppShell';
import { PageMeta } from './seo/PageMeta';
import { HomePage } from '../pages/home/HomePage';
import { LandingPage } from '../pages/marketing/LandingPage';
import { MentionsLegalesPage } from '../pages/legal/MentionsLegalesPage';
import { ConfidentialitePage } from '../pages/legal/ConfidentialitePage';
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

function AuthPageMeta({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}) {
  return (
    <PageMeta title={title} description={description} path={path} noIndex />
  );
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/mentions-legales" element={<MentionsLegalesPage />} />
      <Route path="/confidentialite" element={<ConfidentialitePage />} />

      <Route
        path="/login"
        element={
          <>
            <AuthPageMeta
              title="Connexion"
              description="Connectez-vous à votre espace Kolos demandeur ou aidant."
              path="/login"
            />
            <LoginPage />
          </>
        }
      />
      <Route
        path="/register"
        element={
          <>
            <AuthPageMeta
              title="Inscription"
              description="Créez un compte Kolos pour publier une demande ou candidater."
              path="/register"
            />
            <RegisterPage />
          </>
        }
      />

      <Route element={<ProtectedAppShell />}>
        <Route path="/app" element={<HomePage />} />
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
