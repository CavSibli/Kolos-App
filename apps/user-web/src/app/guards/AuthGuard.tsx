import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';
import { loginPathWithNext } from '../routing/safeNext';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="container">Chargement...</div>;
  }

  if (!user) {
    const next = `${location.pathname}${location.search}`;
    return <Navigate to={loginPathWithNext(next)} replace />;
  }

  return <>{children}</>;
}
