import { FormEvent, useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ApiClientError } from '@kolos/http-client';
import type { AdminRequestListItem } from '@kolos/shared-types';
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
  TextField,
} from '../../ui';

const emptyForm = {
  demandeurId: '',
  titre: '',
  description: '',
  adresse: '',
  dateMission: '',
  dureeEstimee: 60,
  nbAidantsRequis: 1,
};

export function AdminRequestsPage() {
  const {
    listAdminRequests,
    createAdminRequest,
    updateAdminRequest,
    cancelAdminRequest,
  } = useMarketplace();
  const [items, setItems] = useState<AdminRequestListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [editTitre, setEditTitre] = useState<Record<number, string>>({});

  const reload = useCallback(async () => {
    const result = await listAdminRequests({ page: 1, pageSize: 50 });
    setItems(result.items);
    setTotal(result.total);
    setEditTitre(
      Object.fromEntries(result.items.map((item) => [item.id, item.titre])),
    );
  }, [listAdminRequests]);

  useEffect(() => {
    async function load() {
      try {
        await reload();
      } catch (err) {
        if (err instanceof ApiClientError) {
          setError(
            typeof err.body.message === 'string'
              ? err.body.message
              : 'Chargement impossible',
          );
        } else {
          setError('Chargement impossible');
        }
      } finally {
        setIsLoading(false);
      }
    }
    void load();
  }, [reload]);

  async function onCreate(event: FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      await createAdminRequest({
        demandeurId: form.demandeurId.trim(),
        titre: form.titre.trim(),
        description: form.description.trim(),
        adresse: form.adresse.trim(),
        dateMission: new Date(form.dateMission).toISOString(),
        dureeEstimee: Number(form.dureeEstimee),
        nbAidantsRequis: Number(form.nbAidantsRequis),
      });
      setForm(emptyForm);
      await reload();
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(
          typeof err.body.message === 'string'
            ? err.body.message
            : 'Création impossible',
        );
      }
    }
  }

  async function onSaveTitre(id: number) {
    const titre = editTitre[id]?.trim();
    if (!titre) return;
    setBusyId(id);
    setError(null);
    try {
      await updateAdminRequest(id, { titre });
      await reload();
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(
          typeof err.body.message === 'string'
            ? err.body.message
            : 'Mise à jour impossible',
        );
      }
    } finally {
      setBusyId(null);
    }
  }

  async function onCancel(id: number) {
    setBusyId(id);
    setError(null);
    try {
      await cancelAdminRequest(id);
      await reload();
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(
          typeof err.body.message === 'string'
            ? err.body.message
            : 'Annulation impossible',
        );
      }
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="container">
      <PageMeta
        title="Demandes"
        description="Gestion des demandes."
        path="/admin/requests"
        noIndex
      />
      <h1>Demandes</h1>
      <p className="ds-page-lead">
        Soft cancel uniquement (statut CANCELLED) — pas de suppression SQL.
      </p>

      <Card as="section" title="Créer une demande">
        <form className="ds-stack" onSubmit={onCreate}>
          <TextField
            id="admin-request-demandeurId"
            label="Demandeur ID (UUID)"
            value={form.demandeurId}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, demandeurId: e.target.value }))
            }
            required
          />
          <TextField
            id="admin-request-titre"
            label="Titre"
            value={form.titre}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, titre: e.target.value }))
            }
            required
          />
          <TextField
            id="admin-request-description"
            label="Description"
            value={form.description}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, description: e.target.value }))
            }
            required
          />
          <TextField
            id="admin-request-adresse"
            label="Adresse"
            value={form.adresse}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, adresse: e.target.value }))
            }
            required
          />
          <TextField
            id="admin-request-dateMission"
            label="Date mission"
            type="datetime-local"
            value={form.dateMission}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, dateMission: e.target.value }))
            }
            required
          />
          <TextField
            id="admin-request-duree"
            label="Durée (min)"
            type="number"
            value={String(form.dureeEstimee)}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                dureeEstimee: Number(e.target.value),
              }))
            }
            required
          />
          <TextField
            id="admin-request-nbAidants"
            label="Aidants requis"
            type="number"
            value={String(form.nbAidantsRequis)}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                nbAidantsRequis: Number(e.target.value),
              }))
            }
            required
          />
          <Button type="submit">Créer</Button>
        </form>
      </Card>

      {isLoading ? <LoadingState /> : null}
      {error ? <ErrorState message={error} /> : null}
      <p className="ds-meta">{total} demande(s)</p>

      <div className="card-list">
        {items.map((item) => (
          <Card key={item.id} as="article" title={`#${item.id} — ${item.titre}`}>
            <p>
              <Badge tone={statusTone(item.status)}>
                {statusLabel(item.status)}
              </Badge>
              {item.mission ? (
                <>
                  {' '}
                  <Badge tone={statusTone(item.mission.status)}>
                    Mission {statusLabel(item.mission.status)}
                  </Badge>
                </>
              ) : null}
            </p>
            <p>{item.description}</p>
            <p className="ds-meta">
              <span>Demandeur {item.demandeurId}</span>
              <span>{item.adresse}</span>
              <span>{formatDateTime(item.dateMission)}</span>
            </p>
            {item.status !== 'CANCELLED' ? (
              <div className="ds-stack">
                <TextField
                  id={`admin-request-edit-titre-${item.id}`}
                  label="Titre (édition)"
                  value={editTitre[item.id] ?? item.titre}
                  onChange={(e) =>
                    setEditTitre((prev) => ({
                      ...prev,
                      [item.id]: e.target.value,
                    }))
                  }
                />
                <div className="ds-actions">
                  <Button
                    variant="secondary"
                    disabled={busyId === item.id}
                    onClick={() => void onSaveTitre(item.id)}
                  >
                    Enregistrer
                  </Button>
                  <Button
                    variant="danger"
                    disabled={busyId === item.id}
                    onClick={() => void onCancel(item.id)}
                  >
                    Annuler
                  </Button>
                  {item.mission?.status === 'CONFIRMED' ? (
                    <Link
                      to={`/admin/missions/${item.mission.id}/messages`}
                      className="ds-button ds-button--secondary"
                    >
                      Messagerie
                    </Link>
                  ) : null}
                </div>
              </div>
            ) : item.mission?.status === 'CONFIRMED' ? (
              <div className="ds-actions">
                <Link
                  to={`/admin/missions/${item.mission.id}/messages`}
                  className="ds-button ds-button--secondary"
                >
                  Messagerie
                </Link>
              </div>
            ) : null}
          </Card>
        ))}
      </div>

      {!isLoading && !error && items.length === 0 ? (
        <EmptyState
          title="Aucune demande"
          body="Les demandes publiées apparaîtront ici."
        />
      ) : null}
    </div>
  );
}
