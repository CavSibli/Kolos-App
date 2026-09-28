import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ApiClientError } from '@kolos/http-client';
import type { ApplicationWithContextResponse } from '@kolos/shared-types';
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
      <PageMeta
        title="Mes candidatures"
        description="Suivez le statut de vos candidatures et missions."
        path="/app/applications/mine"
        noIndex
      />
      <h1>Mes candidatures</h1>
      <p className="ds-page-lead">
        Consultez l&apos;état de chaque candidature et mission associée.
      </p>

      {isLoading ? <LoadingState /> : null}
      {error ? <ErrorState message={error} /> : null}

      <div className="card-list">
        {applications.map((application) => (
          <Card
            key={application.id}
            as="article"
            title={application.request.titre}
          >
            <p>
              <Badge tone={statusTone(application.status)}>
                Candidature : {statusLabel(application.status)}
              </Badge>
            </p>
            <p>{application.request.description}</p>
            <p className="ds-meta">
              <span>Adresse : {application.request.adresse}</span>
              <span>
                Demande : {statusLabel(application.request.status)}
              </span>
              {application.mission ? (
                <span>
                  Mission :{' '}
                  <Badge tone={statusTone(application.mission.status)}>
                    {statusLabel(application.mission.status)}
                  </Badge>{' '}
                  — {application.mission.montantTotal} €
                </span>
              ) : null}
              {application.participation ? (
                <span>
                  Ma participation :{' '}
                  {statusLabel(application.participation.status)}
                </span>
              ) : null}
            </p>
            <div className="ds-actions">
              <Link
                to={`/app/applications/mine/${application.id}`}
                className="ds-button ds-button--secondary"
              >
                {application.mission?.status === 'CONFIRMED'
                  ? 'Messagerie & signalement'
                  : 'Voir le détail'}
              </Link>
              {application.mission?.status === 'CONFIRMED' ? (
                <Link
                  to={`/app/missions/${application.mission.id}/messages`}
                  className="ds-button ds-button--primary"
                >
                  Ouvrir la messagerie
                </Link>
              ) : null}
            </div>
          </Card>
        ))}
      </div>

      {!isLoading && !error && applications.length === 0 ? (
        <EmptyState
          title="Aucune candidature"
          body="Parcourez les demandes disponibles pour candidater."
          action={
            <Link to="/app/requests" className="ds-button ds-button--primary">
              Voir les demandes
            </Link>
          }
        />
      ) : null}

      <p className="ds-page-footer">
        <Link to="/app">Retour à l&apos;accueil</Link>
      </p>
    </div>
  );
}
