import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthGuard } from './guards/AuthGuard';
import { AdminGuard } from './guards/AdminGuard';
import { GuestRoute } from './guards/GuestRoute';
import { RoleGuard } from './guards/RoleGuard';
import { AppShell } from './layout/AppShell';
import { AdminShell } from './layout/AdminShell';
import { PageMeta } from './seo/PageMeta';
import { LegacyRedirect } from './routing/LegacyRedirect';
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
import { MissionMessagesPage } from '../pages/missions/MissionMessagesPage';
import { AdminHomePage } from '../pages/admin/AdminHomePage';
import { NotFoundPage } from '../pages/errors/NotFoundPage';

function ProtectedAppShell() {
  return (
    <AuthGuard>
      <AppShell />
    </AuthGuard>
  );
}

function ProtectedAdminShell() {
  return (
    <AdminGuard>
      <AdminShell />
    </AdminGuard>
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
          <GuestRoute>
            <AuthPageMeta
              title="Connexion"
              description="Connectez-vous à votre espace Kolos demandeur ou aidant."
              path="/login"
            />
            <LoginPage />
          </GuestRoute>
        }
      />
      <Route
        path="/register"
        element={
          <GuestRoute>
            <AuthPageMeta
              title="Inscription"
              description="Créez un compte Kolos pour publier une demande ou candidater."
              path="/register"
            />
            <RegisterPage />
          </GuestRoute>
        }
      />

      {/* Legacy redirects → /app/* */}
      <Route
        path="/requests/new"
        element={<Navigate to="/app/requests/new" replace />}
      />
      <Route
        path="/requests/mine/:id"
        element={
          <LegacyRedirect
            to={({ id }) => `/app/requests/mine/${id ?? ''}`}
          />
        }
      />
      <Route
        path="/requests/mine"
        element={<Navigate to="/app/requests/mine" replace />}
      />
      <Route
        path="/requests"
        element={<Navigate to="/app/requests" replace />}
      />
      <Route
        path="/applications/mine/:id"
        element={
          <LegacyRedirect
            to={({ id }) => `/app/applications/mine/${id ?? ''}`}
          />
        }
      />
      <Route
        path="/applications/mine"
        element={<Navigate to="/app/applications/mine" replace />}
      />
      <Route
        path="/profile/aidant"
        element={<Navigate to="/app/profile/aidant" replace />}
      />

      <Route path="/app" element={<ProtectedAppShell />}>
        <Route index element={<HomePage />} />
        <Route
          path="profile/aidant"
          element={
            <RoleGuard roles={['aidant']}>
              <AidantProfilePage />
            </RoleGuard>
          }
        />
        <Route
          path="requests/new"
          element={
            <RoleGuard roles={['demandeur']}>
              <PublishRequestPage />
            </RoleGuard>
          }
        />
        <Route
          path="requests/mine/:id"
          element={
            <RoleGuard roles={['demandeur']}>
              <RequestCandidatesPage />
            </RoleGuard>
          }
        />
        <Route
          path="requests/mine"
          element={
            <RoleGuard roles={['demandeur']}>
              <MyRequestsPage />
            </RoleGuard>
          }
        />
        <Route
          path="requests"
          element={
            <RoleGuard roles={['aidant']}>
              <RequestsListPage />
            </RoleGuard>
          }
        />
        <Route
          path="applications/mine/:id"
          element={
            <RoleGuard roles={['aidant']}>
              <ApplicationDetailPage />
            </RoleGuard>
          }
        />
        <Route
          path="applications/mine"
          element={
            <RoleGuard roles={['aidant']}>
              <MyApplicationsPage />
            </RoleGuard>
          }
        />
        <Route
          path="missions/:missionId/messages"
          element={
            <RoleGuard roles={['demandeur', 'aidant']}>
              <MissionMessagesPage />
            </RoleGuard>
          }
        />
      </Route>

      <Route path="/admin" element={<ProtectedAdminShell />}>
        <Route index element={<AdminHomePage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
