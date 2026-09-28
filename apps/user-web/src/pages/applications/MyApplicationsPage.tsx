import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ApiClientError } from '@kolos/http-client';
import type { ApplicationWithContextResponse } from '@kolos/shared-types';
import { useMarketplace } from '../../app/hooks/useMarketplace';

function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: 'En attente',
    ACCEPTED: 'Acceptée',
    REFUSED: 'Refusée',
    WITHDRAWN: 'Retirée',
    AWAITING_PAYMENT: 'En attente de paiement',
    CONFIRMED: 'Confirmée',
    SELECTED: 'Sélectionné',
    COMPLETED: 'Terminée',
  };
  return labels[status] ?? status;
}

export function MyApplicationsPage() {
  const { listMyApplications } = useMarketplace();
  const [applications, setApplications] = useState<
    ApplicationWithContextResponse[]
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const result = await listMyApplications();
        setApplications(result.items);
      } catch (err) {
        if (err instanceof ApiClientError) {
          setError(
            typeof err.body.message === 'string'
              ? err.body.message
              : 'Chargement impossible',
          );
        }
      } finally {
        setIsLoading(false);
      }
    }

    void load();
  }, [listMyApplications]);

  return (
    <div className="container">
      <h1>Mes candidatures</h1>
      {isLoading ? <p>Chargement...</p> : null}
      {error ? <p className="error">{error}</p> : null}

      <div className="card-list">
        {applications.map((application) => (
          <article key={application.id} className="card">
            <h2>{application.request.titre}</h2>
            <p>
              <span className={`badge badge-${application.status.toLowerCase()}`}>
                Candidature : {statusLabel(application.status)}
              </span>
            </p>
            <p>{application.request.description}</p>
            <p>
              <strong>Adresse :</strong> {application.request.adresse}
            </p>
            <p>
              <strong>Demande :</strong> {statusLabel(application.request.status)}
            </p>
            {application.mission ? (
              <p>
                <strong>Mission :</strong>{' '}
                {statusLabel(application.mission.status)} —{' '}
                {application.mission.montantTotal} €
              </p>
            ) : null}
            {application.participation ? (
              <p>
                <strong>Ma participation :</strong>{' '}
                {statusLabel(application.participation.status)}
              </p>
            ) : null}
            <Link to={`/app/applications/mine/${application.id}`}>Voir le détail</Link>
          </article>
        ))}
      </div>

      {!isLoading && applications.length === 0 ? (
        <p>Aucune candidature pour le moment.</p>
      ) : null}

      <p>
        <Link to="/app">Retour à l&apos;accueil</Link>
      </p>
    </div>
  );
}
