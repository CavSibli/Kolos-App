import { EmptyState } from '../../ui';
import { PageMeta } from '../../app/seo/PageMeta';

/** Placeholder Lot 1 — rempli au Lot 2. */
export function AdminUsersPage() {
  return (
    <div className="container">
      <PageMeta
        title="Utilisateurs"
        description="Gestion des utilisateurs."
        path="/admin/users"
        noIndex
      />
      <h1>Utilisateurs</h1>
      <EmptyState
        title="Bientôt disponible"
        body="Liste, création, modification et ban soft arrivent au prochain lot."
      />
    </div>
  );
}
