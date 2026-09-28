import { FormEvent, useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ApiClientError } from '@kolos/http-client';
import type { MissionMessageResponse } from '@kolos/shared-types';
import { useAuth } from '../../app/providers/AuthProvider';
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

export function AdminMissionMessagesPage() {
  const { missionId } = useParams();
  const { user } = useAuth();
  const { listAdminMissionMessages, postAdminMissionMessage } =
    useMarketplace();
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
      const items = await listAdminMissionMessages(id);
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
  }, [id, listAdminMissionMessages]);

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
      const created = await postAdminMissionMessage(id, {
        body: draft.trim(),
      });
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

  function senderLabel(message: MissionMessageResponse): string {
    if (user && message.userId === user.id) {
      return `Admin — vous (${message.authorDisplayName})`;
    }
    return message.authorDisplayName || 'Participant';
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
            <Link to="/admin/requests" className="ds-button ds-button--secondary">
              Retour aux demandes
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="container">
      <PageMeta
        title={`Admin messagerie mission #${id}`}
        description="Lecture et participation admin à la conversation de mission."
        path={`/admin/missions/${id}/messages`}
        noIndex
      />
      <h1>Messagerie admin</h1>
      <p className="ds-page-lead">
        Accès admin (mission CONFIRMED) — sans être participant métier.
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
            body="Aucun échange pour cette mission confirmée."
          />
        ) : (
          <ul className="ds-message-list">
            {messages.map((message) => {
              const isMine = Boolean(user && message.userId === user.id);
              return (
                <li
                  key={message.id}
                  className={[
                    'ds-message-item',
                    isMine ? 'ds-message-item--mine' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <p className="ds-meta">
                    <strong>{senderLabel(message)}</strong>
                    <span>
                      {new Date(message.createdAt).toLocaleString('fr-FR')}
                    </span>
                  </p>
                  <p>{message.body}</p>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <Card title="Répondre en tant qu’admin">
        <form className="ds-form" onSubmit={(event) => void handleSend(event)}>
          <TextArea
            id="admin-mission-message-body"
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
        <Link to="/admin/requests">Retour aux demandes</Link>
        {' · '}
        <Link to="/admin/reports">Signalements</Link>
      </p>
    </div>
  );
}
