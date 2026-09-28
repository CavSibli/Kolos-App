import { EmptyState } from '../../ui';
import { PageMeta } from '../../app/seo/PageMeta';

/** Placeholder Lot 1 — rempli au Lot 3. */
export function AdminRequestsPage() {
  return (
    <div className="container">
      <PageMeta
        title="Demandes"
        description="Gestion des demandes."
        path="/admin/requests"
        noIndex
      />
      <h1>Demandes</h1>
      <EmptyState
        title="Bientôt disponible"
        body="Liste et soft CRUD des demandes arrivent au prochain lot."
      />
    </div>
  );
}
