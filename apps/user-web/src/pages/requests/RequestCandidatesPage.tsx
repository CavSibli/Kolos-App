import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ApiClientError } from '@kolos/http-client';
import type { CandidateResponse, RequestWithStatsResponse } from '@kolos/shared-types';
import { useMarketplace } from '../../app/hooks/useMarketplace';
import { PageMeta } from '../../app/seo/PageMeta';
import { statusLabel, statusTone } from '../../lib/status';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  LoadingState,
} from '../../ui';

export function RequestCandidatesPage() {
  const { id } = useParams();
  const {
    getRequestDetail,
    listRequestCandidates,
    decideApplication,
    authorizePayment,
  } = useMarketplace();
  const [request, setRequest] = useState<RequestWithStatsResponse | null>(null);
  const [candidates, setCandidates] = useState<CandidateResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [isPaying, setIsPaying] = useState(false);

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

  async function handleSimulatePayment() {
    if (!request?.mission) {
      return;
    }

    setIsPaying(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await authorizePayment(request.mission.id);
      setSuccess(
        `Paiement simulé — mission ${statusLabel(result.status)} (${result.montantTotal} €)`,
      );
      await load();
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(
          typeof err.body.message === 'string'
            ? err.body.message
            : 'Paiement simulé impossible',
        );
      }
    } finally {
      setIsPaying(false);
    }
  }

  if (isLoading) {
    return (
      <div className="container">
        <LoadingState />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="container">
        <ErrorState
          message={error ?? 'Demande introuvable'}
          action={
            <Link
              to="/app/requests/mine"
              className="ds-button ds-button--secondary"
            >
              Retour à mes demandes
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="container">
      <PageMeta
        title={`Candidats — ${request.titre}`}
        description="Acceptez ou refusez les candidatures pour cette demande."
        path={`/app/requests/mine/${id ?? ''}`}
        noIndex
      />
      <h1>{request.titre}</h1>
      <p className="ds-page-lead">
        {request.mission?.status === 'AWAITING_PAYMENT'
          ? 'Une action primaire : simuler le paiement pour confirmer la mission.'
          : 'Une action primaire : accepter un candidat pour créer la mission.'}
      </p>

      <Card muted>
        <p>{request.description}</p>
        <p className="ds-meta">
          <span>
            Statut :{' '}
            <Badge tone={statusTone(request.status)}>
              {statusLabel(request.status)}
            </Badge>
          </span>
          <span>
            Candidatures : {request.pendingApplications} en attente /{' '}
            {request.acceptedApplications} acceptée(s)
          </span>
          {request.mission ? (
            <span>
              Mission : {statusLabel(request.mission.status)} —{' '}
              {request.mission.montantTotal} €
            </span>
          ) : null}
        </p>
        {request.mission?.status === 'AWAITING_PAYMENT' ? (
          <div className="ds-actions">
            <Button
              type="button"
              disabled={isPaying}
              onClick={() => void handleSimulatePayment()}
            >
              {isPaying ? 'Simulation…' : 'Simuler paiement'}
            </Button>
          </div>
        ) : null}
      </Card>

      {error ? (
        <p className="ds-form-error" role="alert">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="ds-form-success" role="status">
          {success}
        </p>
      ) : null}

      <h2>Candidats</h2>
      <div className="card-list">
        {candidates.map((candidate) => (
          <Card
            key={candidate.applicationId}
            as="article"
            title={`${candidate.aidant.firstName} ${candidate.aidant.lastName}`}
          >
            <p>
              <Badge tone={statusTone(candidate.status)}>
                {statusLabel(candidate.status)}
              </Badge>
            </p>
            {candidate.aidant.bio ? <p>{candidate.aidant.bio}</p> : null}
            <p className="ds-meta">
              {candidate.aidant.rayonIntervention ? (
                <span>Rayon : {candidate.aidant.rayonIntervention} km</span>
              ) : null}
              {candidate.message ? (
                <span>Message : {candidate.message}</span>
              ) : null}
              {candidate.prixPropose !== null ? (
                <span>Prix proposé : {candidate.prixPropose} €</span>
              ) : null}
            </p>
            {candidate.status === 'PENDING' ? (
              <div className="ds-actions">
                <Button
                  type="button"
                  disabled={processingId === candidate.applicationId}
                  onClick={() =>
                    void handleDecision(candidate.applicationId, 'ACCEPTED')
                  }
                >
                  Accepter
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  disabled={processingId === candidate.applicationId}
                  onClick={() =>
                    void handleDecision(candidate.applicationId, 'REFUSED')
                  }
                >
                  Refuser
                </Button>
              </div>
            ) : null}
          </Card>
        ))}
      </div>

      {candidates.length === 0 ? (
        <EmptyState
          title="Aucun candidat"
          body="Les aidants apparaîtront ici dès qu’ils candidatent."
        />
      ) : null}

      <p className="ds-page-footer">
        <Link to="/app/requests/mine">Retour à mes demandes</Link>
      </p>
    </div>
  );
}
