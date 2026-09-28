import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';
import { loginPathWithNext } from '../routing/safeNext';

/**
 * Admin-only zone. Unauthenticated → login+next ; authenticated non-admin → /app.
 */
export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="container">Chargement...</div>;
  }

  if (!user) {
    const next = `${location.pathname}${location.search}`;
    return <Navigate to={loginPathWithNext(next)} replace />;
  }

  if (!user.roles.includes('admin')) {
    return <Navigate to="/app" replace />;
  }

  return <>{children}</>;
}
