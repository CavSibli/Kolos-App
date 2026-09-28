import { Link } from 'react-router-dom';
import { PageMeta } from '../../app/seo/PageMeta';

export function MentionsLegalesPage() {
  return (
    <div className="legal-page">
      <PageMeta
        title="Mentions légales"
        description="Mentions légales du service Kolos (projet de formation)."
        path="/mentions-legales"
      />

      <header className="legal-page__header">
        <Link to="/" className="legal-page__brand">
          Kolos
        </Link>
        <Link to="/">Retour à l&apos;accueil</Link>
      </header>

      <main className="legal-page__main">
        <h1>Mentions légales</h1>
        <p className="legal-page__lead">
          Texte informatif pour le projet de formation Kolos. Aucun numéro
          d&apos;entreprise (SIRET) n&apos;est déclaré ici : à compléter uniquement
          en cas de mise en production réelle.
        </p>

        <section>
          <h2>Éditeur</h2>
          <p>
            Service Kolos — application web de mise en relation entre
            demandeurs et aidants, développée dans le cadre d&apos;un cursus
            de formation.
          </p>
        </section>

        <section>
          <h2>Hébergement</h2>
          <p>
            L&apos;hébergement dépend de l&apos;environnement de déploiement
            (local, staging ou production). Les détails d&apos;hébergeur seront
            précisés lors d&apos;une éventuelle mise en ligne.
          </p>
        </section>

        <section>
          <h2>Contact</h2>
          <p>
            Pour toute question relative au projet : contact via l&apos;équipe
            pédagogique / le porteur du projet (coordonnées à définir avant
            production).
          </p>
        </section>

        <section>
          <h2>Propriété intellectuelle</h2>
          <p>
            Les contenus, marques et éléments graphiques de l&apos;interface
            Kolos sont réservés au projet, sauf mention contraire. Toute
            réutilisation hors cadre pédagogique nécessite un accord préalable.
          </p>
        </section>
      </main>

      <footer className="legal-page__footer">
        <Link to="/confidentialite">Confidentialité</Link>
      </footer>
    </div>
  );
}
