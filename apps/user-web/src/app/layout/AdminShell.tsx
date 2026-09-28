import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';
import { Button } from '../../ui';
import { PageMeta } from '../seo/PageMeta';

export function AdminShell() {
  const { user, logout } = useAuth();

  return (
    <div className="admin-shell">
      <PageMeta
        title="Administration"
        description="Back-office Kolos (modération)."
        path="/admin"
        noIndex
      />
      <header className="admin-shell__header">
        <div className="admin-shell__header-inner">
          <Link to="/admin" className="admin-shell__brand">
            Kolos Admin
          </Link>
          <div className="admin-shell__actions">
            <Link to="/app" className="admin-shell__link">
              Espace app
            </Link>
            <span className="admin-shell__user">
              {user?.firstName} {user?.lastName}
            </span>
            <Button variant="ghost" onClick={() => void logout()}>
              Déconnexion
            </Button>
          </div>
        </div>
      </header>
      <main className="admin-shell__main">
        <Outlet />
      </main>
    </div>
  );
}
