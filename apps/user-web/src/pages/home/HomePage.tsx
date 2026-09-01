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
      <p>
        <Link to="/register">Créer un autre compte</Link>
      </p>
    </div>
  );
}
