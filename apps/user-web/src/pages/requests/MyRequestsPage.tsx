import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ApiClientError } from '@kolos/http-client';
import type { RequestWithStatsResponse } from '@kolos/shared-types';
import { useMarketplace } from '../../app/hooks/useMarketplace';
import { PageMeta } from '../../app/seo/PageMeta';
import { statusLabel, statusTone } from '../../lib/status';
import {
  Badge,
  Card,
  EmptyState,
  ErrorState,
  LoadingState,
} from '../../ui';

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
      <PageMeta
        title="Mes demandes"
        description="Suivez vos demandes publiées et les candidatures reçues."
        path="/app/requests/mine"
        noIndex
      />
      <h1>Mes demandes</h1>
      <p className="ds-page-lead">
        Gérez les candidatures pour chaque mission publiée.
      </p>

      {isLoading ? <LoadingState /> : null}
      {error ? <ErrorState message={error} /> : null}

      <div className="card-list">
        {requests.map((request) => (
          <Card key={request.id} as="article" title={request.titre}>
            <p>
              <Badge tone={statusTone(request.status)}>
                {statusLabel(request.status)}
              </Badge>
            </p>
            <p className="ds-meta">
              <span>
                Candidatures : {request.pendingApplications} en attente,{' '}
                {request.acceptedApplications} acceptée(s)
              </span>
              {request.mission ? (
                <span>
                  Mission :{' '}
                  <Badge tone={statusTone(request.mission.status)}>
                    {statusLabel(request.mission.status)}
                  </Badge>
                </span>
              ) : null}
            </p>
            <div className="ds-actions">
              <Link
                to={`/app/requests/mine/${request.id}`}
                className="ds-button ds-button--secondary"
              >
                {request.mission?.status === 'AWAITING_PAYMENT'
                  ? 'Simuler le paiement'
                  : request.mission?.status === 'CONFIRMED'
                    ? 'Messagerie & signalement'
                    : 'Gérer les candidats'}
              </Link>
              {request.mission?.status === 'CONFIRMED' ? (
                <Link
                  to={`/app/missions/${request.mission.id}/messages`}
                  className="ds-button ds-button--primary"
                >
                  Ouvrir la messagerie
                </Link>
              ) : null}
            </div>
          </Card>
        ))}
      </div>

      {!isLoading && !error && requests.length === 0 ? (
        <EmptyState
          title="Aucune demande publiée"
          body="Publiez une mission pour recevoir des candidatures."
          action={
            <Link
              to="/app/requests/new"
              className="ds-button ds-button--primary"
            >
              Publier une demande
            </Link>
          }
        />
      ) : null}

      <p className="ds-page-footer">
        <Link to="/app/requests/new">Publier une nouvelle demande</Link>
        {' · '}
        <Link to="/app">Retour à l&apos;accueil</Link>
      </p>
    </div>
  );
}
