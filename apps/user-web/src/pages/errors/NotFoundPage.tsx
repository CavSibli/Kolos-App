import { Link } from 'react-router-dom';
import { PageMeta } from '../../app/seo/PageMeta';

export function NotFoundPage() {
  return (
    <div className="legal-page">
      <PageMeta
        title="Page introuvable"
        description="La page demandée n'existe pas sur Kolos."
        path="/404"
        noIndex
      />
      <header className="legal-page__header">
        <Link to="/" className="legal-page__brand">
          Kolos
        </Link>
      </header>
      <main className="legal-page__main">
        <h1>Page introuvable</h1>
        <p className="legal-page__lead">
          Cette adresse ne correspond à aucune page de Kolos.
        </p>
        <p>
          <Link to="/">Retour à l&apos;accueil</Link>
        </p>
      </main>
    </div>
  );
}
