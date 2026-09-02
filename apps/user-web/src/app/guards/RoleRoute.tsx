import { Navigate } from 'react-router-dom';
import type { UserRole } from '@kolos/shared-types';
import { useAuth } from '../providers/AuthProvider';

export function RoleRoute({
  roles,
  children,
}: {
  roles: UserRole[];
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <p>Chargement...</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const hasRole = user.roles.some((role) => roles.includes(role));
  if (!hasRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
