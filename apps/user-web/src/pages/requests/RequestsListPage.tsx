import { FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ApiClientError } from '@kolos/http-client';
import type { RequestResponse } from '@kolos/shared-types';
import { useMarketplace } from '../../app/hooks/useMarketplace';

export function RequestsListPage() {
  const { listPublishedRequests, applyToRequest } = useMarketplace();
  const [requests, setRequests] = useState<RequestResponse[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [prixPropose, setPrixPropose] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
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

    void load();
  }, [listPublishedRequests]);

  async function handleApply(event: FormEvent) {
    event.preventDefault();
    if (selectedId === null) {
      return;
    }

    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      const result = await applyToRequest({
        demandeId: selectedId,
        message: message || undefined,
        prixPropose: prixPropose ? Number(prixPropose) : undefined,
      });
      setSuccess(`Candidature #${result.id} enregistrée (${result.status})`);
      setSelectedId(null);
      setMessage('');
      setPrixPropose('');
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
      {error ? <p className="error">{error}</p> : null}
      {success ? <p className="success">{success}</p> : null}

      <div className="card-list">
        {requests.map((request) => (
          <article key={request.id} className="card">
            <h2>{request.titre}</h2>
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
            <button type="button" onClick={() => setSelectedId(request.id)}>
              Candidater
            </button>
          </article>
        ))}
      </div>

      {selectedId !== null ? (
        <form className="card" onSubmit={handleApply}>
          <h2>Candidature pour la demande #{selectedId}</h2>
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
              value={prixPropose}
              onChange={(event) => setPrixPropose(event.target.value)}
            />
          </label>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Envoi...' : 'Envoyer ma candidature'}
          </button>
          <button type="button" onClick={() => setSelectedId(null)}>
            Annuler
          </button>
        </form>
      ) : null}

      <p>
        <Link to="/">Retour à l&apos;accueil</Link>
      </p>
    </div>
  );
}
