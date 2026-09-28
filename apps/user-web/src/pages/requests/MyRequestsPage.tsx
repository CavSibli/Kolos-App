import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ApiClientError } from '@kolos/http-client';
import type { RequestWithStatsResponse } from '@kolos/shared-types';
import { useMarketplace } from '../../app/hooks/useMarketplace';

function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    PUBLISHED: 'Publiée',
    PARTIALLY_ASSIGNED: 'Partiellement assignée',
    ASSIGNED: 'Assignée',
    AWAITING_PAYMENT: 'En attente de paiement',
  };
  return labels[status] ?? status;
}

export function MyRequestsPage() {
  const { listMyRequests } = useMarketplace();
  const [requests, setRequests] = useState<RequestWithStatsResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const result = await listMyRequests();
        setRequests(result.items);
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
  }, [listMyRequests]);

  return (
    <div className="container">
      <h1>Mes demandes</h1>
      {isLoading ? <p>Chargement...</p> : null}
      {error ? <p className="error">{error}</p> : null}

      <div className="card-list">
        {requests.map((request) => (
          <article key={request.id} className="card">
            <h2>{request.titre}</h2>
            <p>
              <span className={`badge badge-${request.status.toLowerCase()}`}>
                {statusLabel(request.status)}
              </span>
            </p>
            <p>
              <strong>Candidatures :</strong> {request.pendingApplications} en
              attente, {request.acceptedApplications} acceptée(s)
            </p>
            {request.mission ? (
              <p>
                <strong>Mission :</strong> {statusLabel(request.mission.status)}
              </p>
            ) : null}
            <Link to={`/app/requests/mine/${request.id}`}>Gérer les candidats</Link>
          </article>
        ))}
      </div>

      {!isLoading && requests.length === 0 ? (
        <p>Aucune demande publiée.</p>
      ) : null}

      <p>
        <Link to="/app/requests/new">Publier une nouvelle demande</Link>
      </p>
      <p>
        <Link to="/app">Retour à l&apos;accueil</Link>
      </p>
    </div>
  );
}
