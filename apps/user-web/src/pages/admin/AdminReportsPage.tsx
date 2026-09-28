import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ApiClientError } from '@kolos/http-client';
import type {
  AdminReportListItem,
  ModerationActionCode,
} from '@kolos/shared-types';
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
} from '../../ui';

const MOTIF_LABELS: Record<string, string> = {
  NO_SHOW: 'Absence',
  DELAY: 'Retard',
  NOT_PERFORMED: 'Prestation non réalisée',
  BEHAVIOUR: 'Comportement',
  PAYMENT: 'Paiement',
  OTHER: 'Autre',
};

const ACTIONS: { code: ModerationActionCode; label: string; variant: 'primary' | 'secondary' | 'danger' }[] = [
  { code: 'CLASSIFY', label: 'Classer', variant: 'primary' },
  { code: 'MASK', label: 'Masquer', variant: 'secondary' },
  { code: 'DISMISS', label: 'Rejeter', variant: 'danger' },
];

export function AdminReportsPage() {
  const { listAdminReports, postAdminReportAction } = useMarketplace();
  const [reports, setReports] = useState<AdminReportListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [busyReportId, setBusyReportId] = useState<number | null>(null);

  const reload = useCallback(async () => {
    const result = await listAdminReports({ page: 1, pageSize: 50 });
    setReports(result.items);
    setTotal(result.total);
  }, [listAdminReports]);

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

  async function handleAction(
    reportId: number,
    action: ModerationActionCode,
  ) {
    setActionError(null);
    setBusyReportId(reportId);
    try {
      await postAdminReportAction(reportId, {
        action,
        reason: `Action admin ${action}`,
      });
      await reload();
    } catch (err) {
      if (err instanceof ApiClientError) {
        setActionError(
          typeof err.body.message === 'string'
            ? err.body.message
            : 'Action impossible',
        );
      } else {
        setActionError('Action impossible');
      }
    } finally {
      setBusyReportId(null);
    }
  }

  return (
    <div className="container">
      <PageMeta
        title="Signalements"
        description="Liste des signalements à modérer."
        path="/admin/reports"
        noIndex
      />
      <h1>Signalements</h1>
      <p className="ds-page-lead">
        Une action (classer / masquer / rejeter) écrit dans Mongo
        <code> moderation_actions</code> et met à jour le statut Postgres.
      </p>

      {isLoading ? <LoadingState /> : null}
      {error ? <ErrorState message={error} /> : null}
      {actionError ? <ErrorState message={actionError} /> : null}

      {!isLoading && !error ? (
        <p className="ds-meta">{total} signalement(s)</p>
      ) : null}

      <div className="card-list">
        {reports.map((report) => (
          <Card
            key={report.id}
            as="article"
            title={`#${report.id} — Mission ${report.missionId}`}
          >
            <p>
              <Badge tone={statusTone(report.status)}>
                {statusLabel(report.status)}
              </Badge>{' '}
              <Badge tone="neutral">
                {MOTIF_LABELS[report.motif] ?? report.motif}
              </Badge>{' '}
              <Badge tone="neutral">{statusLabel(report.priority)}</Badge>
            </p>
            <p>{report.description}</p>
            <p className="ds-meta">
              <span>Auteur : {report.auteurId}</span>
              <span>{formatDateTime(report.createdAt)}</span>
            </p>
            {report.status === 'OPEN' || report.status === 'IN_REVIEW' ? (
              <div className="ds-actions">
                {ACTIONS.map((item) => (
                  <Button
                    key={item.code}
                    variant={item.variant}
                    disabled={busyReportId === report.id}
                    onClick={() => void handleAction(report.id, item.code)}
                  >
                    {item.label}
                  </Button>
                ))}
              </div>
            ) : null}
          </Card>
        ))}
      </div>

      {!isLoading && !error && reports.length === 0 ? (
        <EmptyState
          title="Aucun signalement"
          body="Les signalements créés par les participants de mission apparaîtront ici."
        />
      ) : null}

      <p className="ds-page-footer">
        <Link to="/app">Retour à l&apos;espace applicatif</Link>
      </p>
    </div>
  );
}
