import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ApiClientError } from '@kolos/http-client';
import type { AdminStatsResponse } from '@kolos/shared-types';
import { useMarketplace } from '../../app/hooks/useMarketplace';
import { PageMeta } from '../../app/seo/PageMeta';
import { Card, ErrorState, LoadingState } from '../../ui';

export function AdminDashboardPage() {
  const { getAdminStats } = useMarketplace();
  const [stats, setStats] = useState<AdminStatsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const result = await getAdminStats();
        // #region agent log
        fetch('http://127.0.0.1:7922/ingest/326d00f4-1522-4d98-ad21-c5e911302b3a',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'081765'},body:JSON.stringify({sessionId:'081765',runId:'post-fix',hypothesisId:'A',location:'AdminDashboardPage.tsx:load',message:'admin stats fetch ok',data:{usersTotal:result.usersTotal,requestsTotal:result.requestsTotal},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
        setStats(result);
      } catch (err) {
        if (err instanceof ApiClientError) {
          // #region agent log
          fetch('http://127.0.0.1:7922/ingest/326d00f4-1522-4d98-ad21-c5e911302b3a',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'081765'},body:JSON.stringify({sessionId:'081765',runId:'post-fix',hypothesisId:'A',location:'AdminDashboardPage.tsx:load',message:'admin stats fetch error',data:{status:err.status,msg:typeof err.body.message==='string'?err.body.message:String(err.body.message)},timestamp:Date.now()})}).catch(()=>{});
          // #endregion
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
  }, [getAdminStats]);

  return (
    <div className="container">
      <PageMeta
        title="Tableau de bord admin"
        description="Indicateurs Kolos."
        path="/admin"
        noIndex
      />
      <h1>Tableau de bord</h1>
      <p className="ds-page-lead">
        Vue d&apos;ensemble de la plateforme (Postgres + Mongo).
      </p>

      {isLoading ? <LoadingState /> : null}
      {error ? <ErrorState message={error} /> : null}

      {stats ? (
        <div className="admin-stats-grid">
          <Card as="article" title="Utilisateurs">
            <p className="admin-stats-grid__value">{stats.usersTotal}</p>
            <p>
              <Link to="/admin/users">Gérer</Link>
            </p>
          </Card>
          <Card as="article" title="Demandes">
            <p className="admin-stats-grid__value">{stats.requestsTotal}</p>
            <ul className="admin-stats-grid__breakdown">
              {Object.entries(stats.requestsByStatus).map(([code, count]) => (
                <li key={code}>
                  {code}: {count}
                </li>
              ))}
            </ul>
            <p>
              <Link to="/admin/requests">Gérer</Link>
            </p>
          </Card>
          <Card as="article" title="Missions">
            <p className="admin-stats-grid__value">{stats.missionsTotal}</p>
          </Card>
          <Card as="article" title="Signalements">
            <p className="admin-stats-grid__value">
              {stats.reportsOpen}
              <span className="admin-stats-grid__suffix">
                {' '}
                ouverts / {stats.reportsTotal}
              </span>
            </p>
            <p>
              <Link to="/admin/reports">Modérer</Link>
            </p>
          </Card>
          <Card as="article" title="Messages Mongo">
            <p className="admin-stats-grid__value">{stats.messagesTotal}</p>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
