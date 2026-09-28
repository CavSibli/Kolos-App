import { Link } from 'react-router-dom';
import { PageMeta } from '../../app/seo/PageMeta';

export function AdminHomePage() {
  return (
    <div className="container">
      <PageMeta
        title="Back-office"
        description="Espace d'administration Kolos."
        path="/admin"
        noIndex
      />
      <h1>Back-office</h1>
      <p>
        Zone admin prête. La liste des signalements et les actions de
        modération arriveront avec les tâches T13–T14.
      </p>
      <p>
        <Link to="/app">Retour à l&apos;espace applicatif</Link>
      </p>
    </div>
  );
}
