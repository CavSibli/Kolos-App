import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ApiClientError } from '@kolos/http-client';
import type { ApplicationWithContextResponse } from '@kolos/shared-types';
import { useMarketplace } from '../../app/hooks/useMarketplace';

function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: 'En attente',
    ACCEPTED: 'Acceptée',
    REFUSED: 'Refusée',
    PUBLISHED: 'Publiée',
    PARTIALLY_ASSIGNED: 'Partiellement assignée',
    ASSIGNED: 'Assignée',
    AWAITING_PAYMENT: 'En attente de paiement',
    CONFIRMED: 'Confirmée',
    SELECTED: 'Sélectionné',
  };
  return labels[status] ?? status;
}

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
    return <div className="container">Chargement...</div>;
  }

  if (error || !application) {
    return (
      <div className="container">
        <p className="error">{error ?? 'Candidature introuvable'}</p>
        <Link to="/applications/mine">Retour à mes candidatures</Link>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>{application.request.titre}</h1>
      <div className="card">
        <h2>Statuts</h2>
        <ul>
          <li>Candidature : {statusLabel(application.status)}</li>
          <li>Demande : {statusLabel(application.request.status)}</li>
          <li>
            Mission :{' '}
            {application.mission
              ? statusLabel(application.mission.status)
              : 'Non créée'}
          </li>
          <li>
            Participation :{' '}
            {application.participation
              ? statusLabel(application.participation.status)
              : '—'}
          </li>
        </ul>
      </div>
      <div className="card">
        <h2>Détail de l&apos;offre</h2>
        <p>{application.request.description}</p>
        <p>
          <strong>Adresse :</strong> {application.request.adresse}
        </p>
        <p>
          <strong>Date :</strong>{' '}
          {new Date(application.request.dateMission).toLocaleString('fr-FR')}
        </p>
        <p>
          <strong>Durée :</strong> {application.request.dureeEstimee} min
        </p>
        {application.message ? (
          <p>
            <strong>Mon message :</strong> {application.message}
          </p>
        ) : null}
        {application.prixPropose !== null ? (
          <p>
            <strong>Prix proposé :</strong> {application.prixPropose} €
          </p>
        ) : null}
      </div>
      <p>
        <Link to="/applications/mine">Retour à mes candidatures</Link>
      </p>
    </div>
  );
}
