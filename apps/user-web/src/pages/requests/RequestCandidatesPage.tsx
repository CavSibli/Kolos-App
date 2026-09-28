import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ApiClientError } from '@kolos/http-client';
import type { CandidateResponse, RequestWithStatsResponse } from '@kolos/shared-types';
import { useMarketplace } from '../../app/hooks/useMarketplace';

function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: 'En attente',
    ACCEPTED: 'Acceptée',
    REFUSED: 'Refusée',
  };
  return labels[status] ?? status;
}

export function RequestCandidatesPage() {
  const { id } = useParams();
  const { getRequestDetail, listRequestCandidates, decideApplication } =
    useMarketplace();
  const [request, setRequest] = useState<RequestWithStatsResponse | null>(null);
  const [candidates, setCandidates] = useState<CandidateResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  async function load() {
    if (!id) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [requestDetail, candidateList] = await Promise.all([
        getRequestDetail(Number(id)),
        listRequestCandidates(Number(id)),
      ]);
      setRequest(requestDetail);
      setCandidates(candidateList);
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

  useEffect(() => {
    void load();
  }, [id]);

  async function handleDecision(
    applicationId: number,
    decision: 'ACCEPTED' | 'REFUSED',
  ) {
    setProcessingId(applicationId);
    setError(null);
    setSuccess(null);

    try {
      const result = await decideApplication(applicationId, { decision });
      setSuccess(
        `Décision enregistrée (${result.status})${
          result.mission
            ? ` — Mission créée (${result.mission.status})`
            : ''
        }`,
      );
      await load();
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(
          typeof err.body.message === 'string'
            ? err.body.message
            : 'Décision impossible',
        );
      }
    } finally {
      setProcessingId(null);
    }
  }

  if (isLoading) {
    return <div className="container">Chargement...</div>;
  }

  if (!request) {
    return (
      <div className="container">
        <p className="error">{error ?? 'Demande introuvable'}</p>
        <Link to="/app/requests/mine">Retour à mes demandes</Link>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>{request.titre}</h1>
      <div className="card">
        <p>{request.description}</p>
        <p>
          <strong>Statut :</strong> {request.status}
        </p>
        <p>
          <strong>Candidatures :</strong> {request.pendingApplications} en
          attente / {request.acceptedApplications} acceptée(s)
        </p>
        {request.mission ? (
          <p>
            <strong>Mission :</strong> {request.mission.status} —{' '}
            {request.mission.montantTotal} €
          </p>
        ) : null}
      </div>

      {error ? <p className="error">{error}</p> : null}
      {success ? <p className="success">{success}</p> : null}

      <h2>Candidats</h2>
      <div className="card-list">
        {candidates.map((candidate) => (
          <article key={candidate.applicationId} className="card">
            <h3>
              {candidate.aidant.firstName} {candidate.aidant.lastName}
            </h3>
            <p>
              <span className={`badge badge-${candidate.status.toLowerCase()}`}>
                {statusLabel(candidate.status)}
              </span>
            </p>
            {candidate.aidant.bio ? <p>{candidate.aidant.bio}</p> : null}
            {candidate.aidant.rayonIntervention ? (
              <p>Rayon : {candidate.aidant.rayonIntervention} km</p>
            ) : null}
            {candidate.message ? <p>Message : {candidate.message}</p> : null}
            {candidate.prixPropose !== null ? (
              <p>Prix proposé : {candidate.prixPropose} €</p>
            ) : null}
            {candidate.status === 'PENDING' ? (
              <div className="actions">
                <button
                  type="button"
                  disabled={processingId === candidate.applicationId}
                  onClick={() =>
                    void handleDecision(candidate.applicationId, 'ACCEPTED')
                  }
                >
                  Accepter
                </button>
                <button
                  type="button"
                  disabled={processingId === candidate.applicationId}
                  onClick={() =>
                    void handleDecision(candidate.applicationId, 'REFUSED')
                  }
                >
                  Refuser
                </button>
              </div>
            ) : null}
          </article>
        ))}
      </div>

      {candidates.length === 0 ? <p>Aucun candidat pour cette demande.</p> : null}

      <p>
        <Link to="/app/requests/mine">Retour à mes demandes</Link>
      </p>
    </div>
  );
}
