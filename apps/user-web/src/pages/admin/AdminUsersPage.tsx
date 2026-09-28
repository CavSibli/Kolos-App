import { FormEvent, useCallback, useEffect, useState } from 'react';
import { ApiClientError } from '@kolos/http-client';
import type { AdminUserResponse } from '@kolos/shared-types';
import { useMarketplace } from '../../app/hooks/useMarketplace';
import { PageMeta } from '../../app/seo/PageMeta';
import { formatDateTime } from '../../lib/status';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  LoadingState,
  TextField,
} from '../../ui';

export function AdminUsersPage() {
  const {
    listAdminUsers,
    createAdminUser,
    banAdminUser,
    unbanAdminUser,
  } = useMarketplace();
  const [users, setUsers] = useState<AdminUserResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [form, setForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'demandeur' as 'demandeur' | 'aidant',
  });

  const reload = useCallback(async () => {
    const result = await listAdminUsers({ page: 1, pageSize: 50 });
    setUsers(result.items);
    setTotal(result.total);
  }, [listAdminUsers]);

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
      await createAdminUser(form);
      setForm({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        role: 'demandeur',
      });
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

  async function onBan(user: AdminUserResponse, permanent: boolean) {
    setBusyId(user.id);
    setError(null);
    try {
      const until = permanent
        ? null
        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      await banAdminUser(user.id, {
        until,
        reason: permanent ? 'Ban définitif admin' : 'Ban temporaire 7 jours',
      });
      await reload();
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(
          typeof err.body.message === 'string'
            ? err.body.message
            : 'Ban impossible',
        );
      }
    } finally {
      setBusyId(null);
    }
  }

  async function onUnban(user: AdminUserResponse) {
    setBusyId(user.id);
    setError(null);
    try {
      await unbanAdminUser(user.id);
      await reload();
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(
          typeof err.body.message === 'string'
            ? err.body.message
            : 'Unban impossible',
        );
      }
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="container">
      <PageMeta
        title="Utilisateurs"
        description="Gestion des utilisateurs."
        path="/admin/users"
        noIndex
      />
      <h1>Utilisateurs</h1>
      <p className="ds-page-lead">
        Soft ban (temporaire ou définitif) — aucune suppression physique.
      </p>

      {isLoading ? <LoadingState /> : null}
      {error ? <ErrorState message={error} /> : null}

      <Card as="section" title="Créer un compte">
        <form className="admin-form" onSubmit={(e) => void onCreate(e)}>
          <TextField
            id="admin-user-firstName"
            label="Prénom"
            value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            required
          />
          <TextField
            id="admin-user-lastName"
            label="Nom"
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            required
          />
          <TextField
            id="admin-user-email"
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <TextField
            id="admin-user-password"
            label="Mot de passe"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            minLength={8}
          />
          <label className="ds-field">
            <span className="ds-field__label">Rôle</span>
            <select
              className="ds-field__control"
              value={form.role}
              onChange={(e) =>
                setForm({
                  ...form,
                  role: e.target.value as 'demandeur' | 'aidant',
                })
              }
            >
              <option value="demandeur">Demandeur</option>
              <option value="aidant">Aidant</option>
            </select>
          </label>
          <Button type="submit" variant="primary">
            Créer
          </Button>
        </form>
      </Card>

      <p className="ds-meta">{total} utilisateur(s)</p>

      <div className="card-list">
        {users.map((user) => (
          <Card
            key={user.id}
            as="article"
            title={`${user.firstName} ${user.lastName}`}
          >
            <p>
              <Badge tone={user.banned ? 'danger' : 'success'}>
                {user.banned ? 'Banni' : 'Actif'}
              </Badge>{' '}
              {user.roles.map((role) => (
                <Badge key={role} tone="neutral">
                  {role}
                </Badge>
              ))}
            </p>
            <p className="ds-meta">
              <span>{user.email}</span>
              <span>{formatDateTime(user.createdAt)}</span>
            </p>
            {user.banReason ? <p>Motif : {user.banReason}</p> : null}
            <div className="ds-actions">
              {user.banned ? (
                <Button
                  variant="secondary"
                  disabled={busyId === user.id}
                  onClick={() => void onUnban(user)}
                >
                  Lever le ban
                </Button>
              ) : (
                <>
                  <Button
                    variant="secondary"
                    disabled={busyId === user.id || user.roles.includes('admin')}
                    onClick={() => void onBan(user, false)}
                  >
                    Ban 7 jours
                  </Button>
                  <Button
                    variant="danger"
                    disabled={busyId === user.id || user.roles.includes('admin')}
                    onClick={() => void onBan(user, true)}
                  >
                    Ban définitif
                  </Button>
                </>
              )}
            </div>
          </Card>
        ))}
      </div>

      {!isLoading && !error && users.length === 0 ? (
        <EmptyState title="Aucun utilisateur" body="Créez un compte ci-dessus." />
      ) : null}
    </div>
  );
}
