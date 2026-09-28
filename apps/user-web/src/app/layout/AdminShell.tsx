import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';
import { Button } from '../../ui';
import { PageMeta } from '../seo/PageMeta';

const NAV = [
  { to: '/admin', end: true, label: 'Tableau de bord' },
  { to: '/admin/users', end: false, label: 'Utilisateurs' },
  { to: '/admin/requests', end: false, label: 'Demandes' },
  { to: '/admin/reports', end: false, label: 'Signalements' },
];

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
          <NavLink to="/admin" end className="admin-shell__brand">
            Kolos Admin
          </NavLink>
          <div className="admin-shell__actions">
            <NavLink to="/app" className="admin-shell__link">
              Espace app
            </NavLink>
            <span className="admin-shell__user">
              {user?.firstName} {user?.lastName}
            </span>
            <Button variant="ghost" onClick={() => void logout()}>
              Déconnexion
            </Button>
          </div>
        </div>
        <nav className="admin-shell__nav" aria-label="Navigation admin">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                isActive
                  ? 'admin-shell__nav-link admin-shell__nav-link--active'
                  : 'admin-shell__nav-link'
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="admin-shell__main">
        <Outlet />
      </main>
    </div>
  );
}
