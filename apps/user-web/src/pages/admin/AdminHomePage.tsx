import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ApiClientError } from '@kolos/http-client';
import type { AdminReportListItem } from '@kolos/shared-types';
import { useMarketplace } from '../../app/hooks/useMarketplace';
import { PageMeta } from '../../app/seo/PageMeta';
import { formatDateTime, statusLabel, statusTone } from '../../lib/status';
import {
  Badge,
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

export function AdminHomePage() {
  const { listAdminReports } = useMarketplace();
  const [reports, setReports] = useState<AdminReportListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const result = await listAdminReports({ page: 1, pageSize: 50 });
        setReports(result.items);
        setTotal(result.total);
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
  }, [listAdminReports]);

  return (
    <div className="container">
      <PageMeta
        title="Signalements"
        description="Liste des signalements à modérer."
        path="/admin"
        noIndex
      />
      <h1>Signalements</h1>
      <p className="ds-page-lead">
        Consultez les signalements Postgres. Les actions de modération (Mongo)
        arriveront en T14.
      </p>

      {isLoading ? <LoadingState /> : null}
      {error ? <ErrorState message={error} /> : null}

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
