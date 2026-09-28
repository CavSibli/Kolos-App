import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ApiClientError } from '@kolos/http-client';
import type { ApplicationWithContextResponse } from '@kolos/shared-types';
import { useMarketplace } from '../../app/hooks/useMarketplace';
import { PageMeta } from '../../app/seo/PageMeta';
import { formatDateTime, statusLabel, statusTone } from '../../lib/status';
import { Badge, Card, ErrorState, LoadingState } from '../../ui';

export function ApplicationDetailPage() {
  const { id } = useParams();
  const { getMyApplication } = useMarketplace();
  const [application, setApplication] =
    useState<ApplicationWithContextResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!id) {
        return;
      }

      try {
        const result = await getMyApplication(Number(id));
        setApplication(result);
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
  }, [getMyApplication, id]);

  if (isLoading) {
    return (
      <div className="container">
        <LoadingState />
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="container">
        <ErrorState
          message={error ?? 'Candidature introuvable'}
          action={
            <Link
              to="/app/applications/mine"
              className="ds-button ds-button--secondary"
            >
              Retour à mes candidatures
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="container">
      <PageMeta
        title={application.request.titre}
        description="Détail de votre candidature et de la mission associée."
        path={`/app/applications/mine/${id ?? ''}`}
        noIndex
      />
      <h1>{application.request.titre}</h1>
      <p className="ds-page-lead">
        Statuts de votre candidature, de la demande et de la mission.
      </p>

      <Card title="Statuts">
        <ul className="ds-status-list">
          <li>
            Candidature :{' '}
            <Badge tone={statusTone(application.status)}>
              {statusLabel(application.status)}
            </Badge>
          </li>
          <li>
            Demande :{' '}
            <Badge tone={statusTone(application.request.status)}>
              {statusLabel(application.request.status)}
            </Badge>
          </li>
          <li>
            Mission :{' '}
            {application.mission ? (
              <Badge tone={statusTone(application.mission.status)}>
                {statusLabel(application.mission.status)}
              </Badge>
            ) : (
              'Non créée'
            )}
          </li>
          <li>
            Participation :{' '}
            {application.participation ? (
              <Badge tone={statusTone(application.participation.status)}>
                {statusLabel(application.participation.status)}
              </Badge>
            ) : (
              '—'
            )}
          </li>
        </ul>
      </Card>

      <Card title="Détail de l'offre">
        <p>{application.request.description}</p>
        <p className="ds-meta">
          <span>Adresse : {application.request.adresse}</span>
          <span>
            Date : {formatDateTime(application.request.dateMission)}
          </span>
          <span>Durée : {application.request.dureeEstimee} min</span>
          {application.message ? (
            <span>Mon message : {application.message}</span>
          ) : null}
          {application.prixPropose !== null ? (
            <span>Prix proposé : {application.prixPropose} €</span>
          ) : null}
        </p>
      </Card>

      <p className="ds-page-footer">
        <Link to="/app/applications/mine">Retour à mes candidatures</Link>
      </p>
    </div>
  );
}
