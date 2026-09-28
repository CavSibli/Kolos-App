import { FormEvent, useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ApiClientError } from '@kolos/http-client';
import type { MissionMessageResponse } from '@kolos/shared-types';
import { useMarketplace } from '../../app/hooks/useMarketplace';
import { PageMeta } from '../../app/seo/PageMeta';
import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  LoadingState,
  TextArea,
} from '../../ui';

export function MissionMessagesPage() {
  const { missionId } = useParams();
  const { listMissionMessages, postMissionMessage } = useMarketplace();
  const [messages, setMessages] = useState<MissionMessageResponse[]>([]);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const id = Number(missionId);

  const load = useCallback(async () => {
    if (!Number.isFinite(id) || id < 1) {
      setError('Mission invalide');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const items = await listMissionMessages(id);
      setMessages(items);
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
  }, [id, listMissionMessages]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleSend(event: FormEvent) {
    event.preventDefault();
    if (!draft.trim()) {
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      const created = await postMissionMessage(id, { body: draft.trim() });
      setMessages((prev) => [...prev, created]);
      setDraft('');
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(
          typeof err.body.message === 'string'
            ? err.body.message
            : 'Envoi impossible',
        );
      }
    } finally {
      setIsSending(false);
    }
  }

  if (isLoading) {
    return (
      <div className="container">
        <LoadingState />
      </div>
    );
  }

  if (error && messages.length === 0) {
    return (
      <div className="container">
        <ErrorState
          message={error}
          action={
            <Link to="/app" className="ds-button ds-button--secondary">
              Retour à l’accueil
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="container">
      <PageMeta
        title={`Messagerie mission #${id}`}
        description="Échangez avec les participants de la mission."
        path={`/app/missions/${id}/messages`}
        noIndex
      />
      <h1>Messagerie</h1>
      <p className="ds-page-lead">
        Une action primaire : envoyer un message aux participants.
      </p>

      {error ? (
        <p className="ds-form-error" role="alert">
          {error}
        </p>
      ) : null}

      <Card title={`Mission #${id}`}>
        {messages.length === 0 ? (
          <EmptyState
            title="Aucun message"
            body="Démarrez la conversation après confirmation du paiement."
          />
        ) : (
          <ul className="ds-message-list">
            {messages.map((message) => (
              <li key={message.id} className="ds-message-item">
                <p className="ds-meta">
                  <span>{message.userId.slice(0, 8)}…</span>
                  <span>
                    {new Date(message.createdAt).toLocaleString('fr-FR')}
                  </span>
                </p>
                <p>{message.body}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="Nouveau message">
        <form className="ds-form" onSubmit={(event) => void handleSend(event)}>
          <TextArea
            id="mission-message-body"
            label="Message"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            rows={3}
            required
          />
          <div className="ds-actions">
            <Button type="submit" disabled={isSending || !draft.trim()}>
              {isSending ? 'Envoi…' : 'Envoyer'}
            </Button>
          </div>
        </form>
      </Card>

      <p className="ds-page-footer">
        <Link to="/app">Retour à l’accueil</Link>
      </p>
    </div>
  );
}
