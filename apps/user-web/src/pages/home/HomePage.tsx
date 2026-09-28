import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ApiClientError } from '@kolos/http-client';
import type {
  ApplicationWithContextResponse,
  RequestWithStatsResponse,
} from '@kolos/shared-types';
import { useAuth } from '../../app/providers/AuthProvider';
import { useMarketplace } from '../../app/hooks/useMarketplace';
import { PageMeta } from '../../app/seo/PageMeta';
import { formatDate, statusLabel, statusTone } from '../../lib/status';
import {
  Badge,
  Card,
  EmptyState,
  ErrorState,
  LoadingState,
} from '../../ui';

const PREVIEW_SIZE = 5;

function errorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiClientError && typeof err.body.message === 'string') {
    return err.body.message;
  }
  return fallback;
}

export function HomePage() {
  const { user } = useAuth();
  const { listMyApplications, listMyRequests } = useMarketplace();
  const isAidant = Boolean(user?.roles.includes('aidant'));
  const isDemandeur = Boolean(user?.roles.includes('demandeur'));

  const [applications, setApplications] = useState<
    ApplicationWithContextResponse[]
  >([]);
  const [requests, setRequests] = useState<RequestWithStatsResponse[]>([]);
  const [applicationsError, setApplicationsError] = useState<string | null>(
    null,
  );
  const [requestsError, setRequestsError] = useState<string | null>(null);
  const [applicationsLoading, setApplicationsLoading] = useState(isAidant);
  const [requestsLoading, setRequestsLoading] = useState(isDemandeur);

  useEffect(() => {
    if (!isAidant) {
      setApplicationsLoading(false);
      return;
    }

    async function loadApplications() {
      setApplicationsLoading(true);
      setApplicationsError(null);
      try {
        const result = await listMyApplications(1, PREVIEW_SIZE);
        setApplications(result.items);
      } catch (err) {
        setApplicationsError(
          errorMessage(err, 'Chargement des candidatures impossible'),
        );
      } finally {
        setApplicationsLoading(false);
      }
    }

    void loadApplications();
  }, [isAidant, listMyApplications]);

  useEffect(() => {
    if (!isDemandeur) {
      setRequestsLoading(false);
      return;
    }

    async function loadRequests() {
      setRequestsLoading(true);
      setRequestsError(null);
      try {
        const result = await listMyRequests(1, PREVIEW_SIZE);
        setRequests(result.items);
      } catch (err) {
        setRequestsError(
          errorMessage(err, 'Chargement des demandes impossible'),
        );
      } finally {
        setRequestsLoading(false);
      }
    }

    void loadRequests();
  }, [isDemandeur, listMyRequests]);

  const primaryAction = isDemandeur
    ? { to: '/app/requests/new', label: 'Publier une demande' }
    : isAidant
      ? { to: '/app/requests', label: 'Voir les demandes' }
      : null;

  return (
    <div className="container dashboard">
      <PageMeta
        title="Tableau de bord"
        description="Votre espace Kolos : demandes, candidatures et actions selon votre rôle."
        path="/app"
        noIndex
      />
      <h1>Tableau de bord</h1>
      <p className="ds-page-lead">
        Bonjour {user?.firstName} — voici l&apos;essentiel de votre activité.
      </p>

      <Card muted className="ds-stack">
        <p className="ds-meta">
          <strong>{user?.firstName} {user?.lastName}</strong>
          <span>{user?.email}</span>
          <span>Rôles : {user?.roles.join(', ')}</span>
        </p>
        {primaryAction ? (
          <Link
            to={primaryAction.to}
            className="ds-button ds-button--primary ds-button--block"
          >
            {primaryAction.label}
          </Link>
        ) : null}
      </Card>

      {isAidant ? (
        <section className="dashboard-section" aria-labelledby="dash-apps">
          <div className="dashboard-section-header">
            <h2 id="dash-apps">Mes dernières candidatures</h2>
            <Link to="/app/applications/mine">Tout voir</Link>
          </div>
          {applicationsLoading ? <LoadingState /> : null}
          {applicationsError ? (
            <ErrorState message={applicationsError} />
          ) : null}
          {!applicationsLoading &&
          !applicationsError &&
          applications.length === 0 ? (
            <EmptyState
              title="Aucune candidature"
              body="Parcourez les demandes disponibles pour candidater."
              action={
                <Link
                  to="/app/requests"
                  className="ds-button ds-button--secondary"
                >
                  Voir les demandes
                </Link>
              }
            />
          ) : null}
          <div className="card-list">
            {applications.map((application) => (
              <Card key={application.id} as="article" title={application.request.titre}>
                <p>
                  <Badge tone={statusTone(application.status)}>
                    {statusLabel(application.status)}
                  </Badge>
                </p>
                <p className="ds-meta">
                  <span>Date : {formatDate(application.createdAt)}</span>
                  {application.mission ? (
                    <span>
                      Mission : {statusLabel(application.mission.status)}
                    </span>
                  ) : null}
                </p>
                <Link
                  to={`/app/applications/mine/${application.id}`}
                  className="ds-text-link"
                >
                  Voir le détail
                </Link>
              </Card>
            ))}
          </div>
        </section>
      ) : null}

      {isDemandeur ? (
        <section className="dashboard-section" aria-labelledby="dash-reqs">
          <div className="dashboard-section-header">
            <h2 id="dash-reqs">Mes dernières demandes</h2>
            <Link to="/app/requests/mine">Tout voir</Link>
          </div>
          {requestsLoading ? <LoadingState /> : null}
          {requestsError ? <ErrorState message={requestsError} /> : null}
          {!requestsLoading && !requestsError && requests.length === 0 ? (
            <EmptyState
              title="Aucune demande publiée"
              body="Publiez une mission pour recevoir des candidatures."
              action={
                <Link
                  to="/app/requests/new"
                  className="ds-button ds-button--secondary"
                >
                  Publier une demande
                </Link>
              }
            />
          ) : null}
          <div className="card-list">
            {requests.map((request) => (
              <Card key={request.id} as="article" title={request.titre}>
                <p>
                  <Badge tone={statusTone(request.status)}>
                    {statusLabel(request.status)}
                  </Badge>
                </p>
                <p className="ds-meta">
                  <span>Date : {formatDate(request.createdAt)}</span>
                  <span>
                    Candidatures : {request.pendingApplications} en attente,{' '}
                    {request.acceptedApplications} acceptée(s)
                  </span>
                  {request.mission ? (
                    <span>
                      Mission : {statusLabel(request.mission.status)}
                    </span>
                  ) : null}
                </p>
                <Link
                  to={`/app/requests/mine/${request.id}`}
                  className="ds-text-link"
                >
                  Gérer les candidats
                </Link>
              </Card>
            ))}
          </div>
        </section>
      ) : null}

      {isAidant && !isDemandeur ? (
        <p className="ds-page-footer">
          <Link to="/app/profile/aidant">Compléter mon profil aidant</Link>
        </p>
      ) : null}
    </div>
  );
}
