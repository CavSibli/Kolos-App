import { Navigate } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';

/** Redirects authenticated users away from guest-only pages (login/register). */
export function GuestRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="container">Chargement...</div>;
  }

  if (user) {
    return <Navigate to="/app" replace />;
  }

  return <>{children}</>;
}
