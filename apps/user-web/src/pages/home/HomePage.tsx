import { Link } from 'react-router-dom';
import { useAuth } from '../../app/providers/AuthProvider';

export function HomePage() {
  const { user, logout } = useAuth();

  return (
    <div className="container">
      <div className="nav">
        <strong>Kolos</strong>
        <button type="button" onClick={() => void logout()}>
          Déconnexion
        </button>
      </div>
      <h1>Bienvenue</h1>
      <div className="card">
        <p>
          <strong>Email :</strong> {user?.email}
        </p>
        <p>
          <strong>Nom :</strong> {user?.firstName} {user?.lastName}
        </p>
        <p>
          <strong>Rôles :</strong> {user?.roles.join(', ')}
        </p>
      </div>
      <nav className="card">
        <h2>Actions</h2>
        <ul>
          {user?.roles.includes('aidant') ? (
            <>
              <li>
                <Link to="/profile/aidant">Compléter mon profil aidant</Link>
              </li>
              <li>
                <Link to="/requests">Voir les demandes disponibles</Link>
              </li>
              <li>
                <Link to="/applications/mine">Mes candidatures</Link>
              </li>
            </>
          ) : null}
          {user?.roles.includes('demandeur') ? (
            <>
              <li>
                <Link to="/requests/new">Publier une demande</Link>
              </li>
              <li>
                <Link to="/requests/mine">Mes demandes</Link>
              </li>
            </>
          ) : null}
        </ul>
      </nav>
      <p>
        <Link to="/register">Créer un autre compte</Link>
      </p>
    </div>
  );
}
