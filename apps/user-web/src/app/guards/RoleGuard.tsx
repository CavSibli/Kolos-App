import { Navigate } from 'react-router-dom';
import type { UserRole } from '@kolos/shared-types';
import { useAuth } from '../providers/AuthProvider';

/**
 * Role-only guard. Parent must already be AuthGuard (no auth re-check).
 */
export function RoleGuard({
  roles,
  children,
}: {
  roles: UserRole[];
  children: React.ReactNode;
}) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/app" replace />;
  }

  const hasRole = user.roles.some((role) => roles.includes(role));
  if (!hasRole) {
    return <Navigate to="/app" replace />;
  }

  return <>{children}</>;
}
