import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ApiClientError } from '@kolos/http-client';
import type {
  ApplicationWithContextResponse,
  RequestWithStatsResponse,
} from '@kolos/shared-types';
import { useAuth } from '../../app/providers/AuthProvider';
import { useMarketplace } from '../../app/hooks/useMarketplace';

const PREVIEW_SIZE = 5;

function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: 'En attente',
    ACCEPTED: 'Acceptée',
    REFUSED: 'Refusée',
    WITHDRAWN: 'Retirée',
    PUBLISHED: 'Publiée',
    PARTIALLY_ASSIGNED: 'Partiellement assignée',
    ASSIGNED: 'Assignée',
    AWAITING_PAYMENT: 'En attente de paiement',
    CONFIRMED: 'Confirmée',
    SELECTED: 'Sélectionné',
    COMPLETED: 'Terminée',
  };
  return labels[status] ?? status;
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

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

  return (
    <div className="container dashboard">
      <h1>Tableau de bord</h1>
      <div className="card">
        <p>
          <strong>Email :</strong> {user?.email}
        </p>
        <p>
          <strong>Nom :</strong> {user?.firstName} {user?.lastName}
        </p>
        <p>
          <strong>Rôles :</strong> {user?.roles.join(', ')}
        </p>
      </div>
      <nav className="card">
        <h2>Actions</h2>
        <ul>
          {isAidant ? (
            <>
              <li>
                <Link to="/profile/aidant">Compléter mon profil aidant</Link>
              </li>
              <li>
                <Link to="/requests">Voir les demandes disponibles</Link>
              </li>
              <li>
                <Link to="/applications/mine">Mes candidatures</Link>
              </li>
            </>
          ) : null}
          {isDemandeur ? (
            <>
              <li>
                <Link to="/requests/new">Publier une demande</Link>
              </li>
              <li>
                <Link to="/requests/mine">Mes demandes</Link>
              </li>
            </>
          ) : null}
        </ul>
      </nav>

      {isAidant ? (
        <section className="dashboard-section">
          <div className="dashboard-section-header">
            <h2>Mes dernières candidatures</h2>
            <Link to="/applications/mine">Tout voir</Link>
          </div>
          {applicationsLoading ? <p>Chargement...</p> : null}
          {applicationsError ? (
            <p className="error">{applicationsError}</p>
          ) : null}
          {!applicationsLoading &&
          !applicationsError &&
          applications.length === 0 ? (
            <p>
              Aucune candidature pour le moment.{' '}
              <Link to="/requests">Candidater à une demande</Link>
            </p>
          ) : null}
          <div className="card-list">
            {applications.map((application) => (
              <article key={application.id} className="card compact">
                <h3>{application.request.titre}</h3>
                <p>
                  <span
                    className={`badge badge-${application.status.toLowerCase()}`}
                  >
                    {statusLabel(application.status)}
                  </span>
                </p>
                <p>
                  <strong>Date :</strong> {formatDate(application.createdAt)}
                </p>
                {application.mission ? (
                  <p>
                    <strong>Mission :</strong>{' '}
                    {statusLabel(application.mission.status)}
                  </p>
                ) : null}
                <Link to={`/applications/mine/${application.id}`}>
                  Voir le détail
                </Link>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {isDemandeur ? (
        <section className="dashboard-section">
          <div className="dashboard-section-header">
            <h2>Mes dernières demandes</h2>
            <Link to="/requests/mine">Tout voir</Link>
          </div>
          {requestsLoading ? <p>Chargement...</p> : null}
          {requestsError ? <p className="error">{requestsError}</p> : null}
          {!requestsLoading && !requestsError && requests.length === 0 ? (
            <p>
              Aucune demande publiée.{' '}
              <Link to="/requests/new">Publier une demande</Link>
            </p>
          ) : null}
          <div className="card-list">
            {requests.map((request) => (
              <article key={request.id} className="card compact">
                <h3>{request.titre}</h3>
                <p>
                  <span className={`badge badge-${request.status.toLowerCase()}`}>
                    {statusLabel(request.status)}
                  </span>
                </p>
                <p>
                  <strong>Date :</strong> {formatDate(request.createdAt)}
                </p>
                <p>
                  <strong>Candidatures :</strong> {request.pendingApplications}{' '}
                  en attente, {request.acceptedApplications} acceptée(s)
                </p>
                {request.mission ? (
                  <p>
                    <strong>Mission :</strong>{' '}
                    {statusLabel(request.mission.status)}
                  </p>
                ) : null}
                <Link to={`/requests/mine/${request.id}`}>
                  Gérer les candidats
                </Link>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <p>
        <Link to="/register">Créer un autre compte</Link>
      </p>
    </div>
  );
}
