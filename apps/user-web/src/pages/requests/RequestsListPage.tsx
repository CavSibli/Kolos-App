import { FormEvent, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ApiClientError } from '@kolos/http-client';
import type { PublishedRequestResponse } from '@kolos/shared-types';
import { useMarketplace } from '../../app/hooks/useMarketplace';
import { PageMeta } from '../../app/seo/PageMeta';
import { formatDateTime, statusLabel, statusTone } from '../../lib/status';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  LoadingState,
  TextArea,
  TextField,
} from '../../ui';

export function RequestsListPage() {
  const { listPublishedRequests, applyToRequest } = useMarketplace();
  const [requests, setRequests] = useState<PublishedRequestResponse[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [prixPropose, setPrixPropose] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement | null>(null);

  async function load() {
    try {
      const result = await listPublishedRequests();
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

  useEffect(() => {
    void load();
  }, [listPublishedRequests]);

  useEffect(() => {
    if (selectedId !== null) {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [selectedId]);

  function resetForm() {
    setSelectedId(null);
    setMessage('');
    setPrixPropose('');
    setError(null);
  }

  async function handleApply(event: FormEvent) {
    event.preventDefault();
    if (selectedId === null) {
      return;
    }

    const parsedPrice = prixPropose.trim() ? Number(prixPropose) : undefined;
    if (parsedPrice !== undefined && Number.isNaN(parsedPrice)) {
      setError('Le prix proposé est invalide');
      return;
    }

    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      const result = await applyToRequest({
        demandeId: selectedId,
        message: message || undefined,
        prixPropose: parsedPrice,
      });
      setSuccess(`Candidature #${result.id} enregistrée (${result.status})`);
      resetForm();
      await load();
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(
          typeof err.body.message === 'string'
            ? err.body.message
            : 'Candidature impossible',
        );
      } else {
        setError('Une erreur est survenue');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container">
      <PageMeta
        title="Demandes disponibles"
        description="Parcourez les missions publiées et candidatez."
        path="/app/requests"
        noIndex
      />
      <h1>Demandes disponibles</h1>
      <p className="ds-page-lead">
        Choisissez une mission, puis envoyez votre candidature.
      </p>

      {isLoading ? <LoadingState /> : null}
      {error && selectedId === null ? <ErrorState message={error} /> : null}
      {success ? (
        <p className="ds-form-success" role="status">
          {success}
        </p>
      ) : null}

      <div className="card-list">
        {requests.map((request) => (
          <Card key={request.id} as="article" title={request.titre}>
            {request.myApplicationStatus ? (
              <p>
                <Badge tone={statusTone(request.myApplicationStatus)}>
                  Déjà candidaté : {statusLabel(request.myApplicationStatus)}
                </Badge>
              </p>
            ) : null}
            <p>{request.description}</p>
            <p className="ds-meta">
              <span>Adresse : {request.adresse}</span>
              <span>Mission : {formatDateTime(request.dateMission)}</span>
              <span>Aidants requis : {request.nbAidantsRequis}</span>
            </p>

            {!request.myApplicationStatus && selectedId !== request.id ? (
              <Button
                type="button"
                onClick={() => {
                  setError(null);
                  setSuccess(null);
                  setSelectedId(request.id);
                }}
              >
                Candidater
              </Button>
            ) : null}

            {selectedId === request.id ? (
              <form
                ref={formRef}
                className="apply-form"
                onSubmit={handleApply}
                noValidate
              >
                <h3 className="ds-card__title">Votre candidature</h3>
                {error ? (
                  <p className="ds-form-error" role="alert">
                    {error}
                  </p>
                ) : null}
                <TextArea
                  id={`apply-message-${request.id}`}
                  label="Message"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  rows={3}
                />
                <TextField
                  id={`apply-prix-${request.id}`}
                  label="Prix proposé (€, optionnel)"
                  type="number"
                  min={0}
                  step="0.01"
                  value={prixPropose}
                  onChange={(event) => setPrixPropose(event.target.value)}
                />
                <div className="ds-actions">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Envoi…' : 'Envoyer ma candidature'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={resetForm}
                    disabled={isSubmitting}
                  >
                    Annuler
                  </Button>
                </div>
              </form>
            ) : null}
          </Card>
        ))}
      </div>

      {!isLoading && !error && requests.length === 0 ? (
        <EmptyState
          title="Aucune demande disponible"
          body="Revenez plus tard ou complétez votre profil aidant."
          action={
            <Link
              to="/app/profile/aidant"
              className="ds-button ds-button--secondary"
            >
              Mon profil aidant
            </Link>
          }
        />
      ) : null}

      <p className="ds-page-footer">
        <Link to="/app/applications/mine">Voir mes candidatures</Link>
        {' · '}
        <Link to="/app">Retour à l&apos;accueil</Link>
      </p>
    </div>
  );
}
