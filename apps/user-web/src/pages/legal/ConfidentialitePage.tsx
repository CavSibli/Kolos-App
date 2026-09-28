import { Link } from 'react-router-dom';
import { PageMeta } from '../../app/seo/PageMeta';

export function ConfidentialitePage() {
  return (
    <div className="legal-page">
      <PageMeta
        title="Confidentialité"
        description="Politique de confidentialité du service Kolos (projet de formation)."
        path="/confidentialite"
      />

      <header className="legal-page__header">
        <Link to="/" className="legal-page__brand">
          Kolos
        </Link>
        <Link to="/">Retour à l&apos;accueil</Link>
      </header>

      <main className="legal-page__main">
        <h1>Confidentialité</h1>
        <p className="legal-page__lead">
          Synthèse des traitements de données pour le démonstrateur Kolos.
          Document non exhaustif ; à actualiser avant toute exploitation
          commerciale.
        </p>

        <section>
          <h2>Données collectées</h2>
          <p>
            Compte utilisateur (email, nom, prénom, rôle), profil aidant le
            cas échéant, demandes de mission et candidatures. Aucune donnée
            bancaire réelle n&apos;est traitée dans le périmètre actuel (paiement
            mock uniquement).
          </p>
        </section>

        <section>
          <h2>Finalités</h2>
          <p>
            Authentification, mise en relation demandeur / aidant, suivi des
            candidatures et missions, et (ultérieurement) modération.
          </p>
        </section>

        <section>
          <h2>Conservation</h2>
          <p>
            Les données de démonstration sont conservées le temps nécessaire
            au fonctionnement de l&apos;application de formation. Une politique
            de rétention formelle sera définie avant production.
          </p>
        </section>

        <section>
          <h2>Vos droits</h2>
          <p>
            Conformément au RGPD, vous pouvez demander l&apos;accès, la
            rectification ou l&apos;effacement de vos données auprès du porteur
            du projet. Les modalités exactes seront publiées avec les
            coordonnées de contact en production.
          </p>
        </section>
      </main>

      <footer className="legal-page__footer">
        <Link to="/mentions-legales">Mentions légales</Link>
      </footer>
    </div>
  );
}
