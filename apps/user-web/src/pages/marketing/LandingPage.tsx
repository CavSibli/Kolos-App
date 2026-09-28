import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../app/providers/AuthProvider';
import { PageMeta } from '../../app/seo/PageMeta';

const DESCRIPTION =
  'Kolos met en relation demandeurs et aidants pour des missions de proximité, simplement et en confiance.';

export function LandingPage() {
  const { user, isLoading } = useAuth();

  if (!isLoading && user) {
    return <Navigate to="/app" replace />;
  }

  return (
    <div className="landing">
      <PageMeta
        title="Kolos — entraide de proximité"
        description={DESCRIPTION}
        path="/"
      />

      <header className="landing__top">
        <p className="landing__brand">Kolos</p>
        <nav className="landing__top-nav" aria-label="Accès compte">
          <Link to="/login" className="landing__top-link">
            Connexion
          </Link>
          <Link to="/register" className="ds-button ds-button--secondary">
            S&apos;inscrire
          </Link>
        </nav>
      </header>

      <main className="landing__hero">
        <div className="landing__hero-plane" aria-hidden="true" />
        <div className="landing__hero-content">
          <p className="landing__hero-brand">Kolos</p>
          <h1 className="landing__headline">
            L&apos;entraide du quotidien, près de chez vous
          </h1>
          <p className="landing__lead">
            Publiez une demande ou candidater à une mission : Kolos relie
            demandeurs et aidants en quelques étapes.
          </p>
          <div className="landing__cta">
            <Link to="/register" className="ds-button ds-button--primary">
              Créer un compte
            </Link>
            <Link to="/login" className="ds-button ds-button--ghost">
              Se connecter
            </Link>
          </div>
        </div>
      </main>

      <footer className="landing__footer">
        <nav aria-label="Informations légales">
          <Link to="/mentions-legales">Mentions légales</Link>
          <Link to="/confidentialite">Confidentialité</Link>
        </nav>
      </footer>
    </div>
  );
}
