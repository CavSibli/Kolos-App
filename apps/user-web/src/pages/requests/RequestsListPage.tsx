import { FormEvent, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ApiClientError } from '@kolos/http-client';
import type { PublishedRequestResponse } from '@kolos/shared-types';
import { useMarketplace } from '../../app/hooks/useMarketplace';

function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: 'En attente',
    ACCEPTED: 'Acceptée',
    REFUSED: 'Refusée',
    WITHDRAWN: 'Retirée',
  };
  return labels[status] ?? status;
}

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
      <h1>Demandes disponibles</h1>
      {isLoading ? <p>Chargement...</p> : null}
      {error && selectedId === null ? <p className="error">{error}</p> : null}
      {success ? <p className="success">{success}</p> : null}

      <div className="card-list">
        {requests.map((request) => (
          <article key={request.id} className="card">
            <h2>{request.titre}</h2>
            {request.myApplicationStatus ? (
              <p>
                <span
                  className={`badge badge-${request.myApplicationStatus.toLowerCase()}`}
                >
                  Déjà candidaté : {statusLabel(request.myApplicationStatus)}
                </span>
              </p>
            ) : null}
            <p>{request.description}</p>
            <p>
              <strong>Adresse :</strong> {request.adresse}
            </p>
            <p>
              <strong>Mission :</strong>{' '}
              {new Date(request.dateMission).toLocaleString('fr-FR')}
            </p>
            <p>
              <strong>Aidants requis :</strong> {request.nbAidantsRequis}
            </p>

            {!request.myApplicationStatus && selectedId !== request.id ? (
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setSuccess(null);
                  setSelectedId(request.id);
                }}
              >
                Candidater
              </button>
            ) : null}

            {selectedId === request.id ? (
              <form
                ref={formRef}
                className="apply-form"
                onSubmit={handleApply}
              >
                <h3>Votre candidature</h3>
                {error ? <p className="error">{error}</p> : null}
                <label>
                  Message
                  <textarea
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    rows={3}
                  />
                </label>
                <label>
                  Prix proposé (€, optionnel)
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={prixPropose}
                    onChange={(event) => setPrixPropose(event.target.value)}
                  />
                </label>
                <div className="actions">
                  <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Envoi...' : 'Envoyer ma candidature'}
                  </button>
                  <button type="button" onClick={resetForm} disabled={isSubmitting}>
                    Annuler
                  </button>
                </div>
              </form>
            ) : null}
          </article>
        ))}
      </div>

      {!isLoading && requests.length === 0 ? (
        <p>Aucune demande disponible pour le moment.</p>
      ) : null}

      <p>
        <Link to="/applications/mine">Voir mes candidatures</Link>
      </p>
      <p>
        <Link to="/app">Retour à l&apos;accueil</Link>
      </p>
    </div>
  );
}
