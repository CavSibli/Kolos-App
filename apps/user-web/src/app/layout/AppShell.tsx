import { useMemo, useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';
import { Button } from '../../ui';

type NavItem = {
  to: string;
  label: string;
  shortLabel: string;
};

function navClassName({ isActive }: { isActive: boolean }): string {
  return ['app-shell__link', isActive ? 'app-shell__link--active' : '']
    .filter(Boolean)
    .join(' ');
}

export function AppShell() {
  const { user, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isAidant = Boolean(user?.roles.includes('aidant'));
  const isDemandeur = Boolean(user?.roles.includes('demandeur'));

  const navItems = useMemo(() => {
    const items: NavItem[] = [
      { to: '/app', label: 'Tableau de bord', shortLabel: 'Accueil' },
    ];

    if (isAidant) {
      items.push(
        { to: '/requests', label: 'Demandes', shortLabel: 'Demandes' },
        {
          to: '/applications/mine',
          label: 'Mes candidatures',
          shortLabel: 'Candidatures',
        },
        {
          to: '/profile/aidant',
          label: 'Profil aidant',
          shortLabel: 'Profil',
        },
      );
    }

    if (isDemandeur) {
      items.push(
        {
          to: '/requests/new',
          label: 'Publier une demande',
          shortLabel: 'Publier',
        },
        {
          to: '/requests/mine',
          label: 'Mes demandes',
          shortLabel: 'Demandes',
        },
      );
    }

    return items;
  }, [isAidant, isDemandeur]);

  function closeDrawer() {
    setDrawerOpen(false);
  }

  async function handleLogout() {
    closeDrawer();
    await logout();
  }

  return (
    <div className="app-shell">
      <header className="app-shell__header">
        <div className="app-shell__header-inner">
          <Link to="/app" className="app-shell__brand" onClick={closeDrawer}>
            Kolos
          </Link>

          <nav
            className="app-shell__nav-desktop"
            aria-label="Navigation principale"
          >
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end
                className={navClassName}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="app-shell__header-actions">
            <Button
              variant="ghost"
              className="app-shell__logout-desktop"
              onClick={() => void handleLogout()}
            >
              Déconnexion
            </Button>
            <button
              type="button"
              className="app-shell__menu-toggle"
              aria-expanded={drawerOpen}
              aria-controls="app-shell-drawer"
              onClick={() => setDrawerOpen((open) => !open)}
            >
              {drawerOpen ? 'Fermer' : 'Menu'}
            </button>
          </div>
        </div>
      </header>

      {drawerOpen ? (
        <>
          <button
            type="button"
            className="app-shell__backdrop"
            aria-label="Fermer le menu"
            onClick={closeDrawer}
          />
          <aside
            id="app-shell-drawer"
            className="app-shell__drawer app-shell__drawer--open"
          >
            <p className="app-shell__drawer-user">
              {user?.firstName} {user?.lastName}
            </p>
            <nav aria-label="Menu mobile">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end
                  className={navClassName}
                  onClick={closeDrawer}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <Button
              variant="secondary"
              block
              onClick={() => void handleLogout()}
            >
              Déconnexion
            </Button>
          </aside>
        </>
      ) : null}

      <main className="app-shell__main">
        <Outlet />
      </main>

      <nav className="app-shell__bottom" aria-label="Navigation rapide">
        {navItems.slice(0, 4).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end
            className={({ isActive }) =>
              [
                'app-shell__bottom-link',
                isActive ? 'app-shell__bottom-link--active' : '',
              ]
                .filter(Boolean)
                .join(' ')
            }
          >
            {item.shortLabel}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
