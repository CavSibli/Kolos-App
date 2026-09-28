# Scripts SQL Kolos (T21) — §5.5 gabarit

Artefacts **conception / annexes** (pas le dossier projet gelé).

| Fichier | Gabarit | Nature |
|---------|---------|--------|
| `01-creation-extrait-migrations.sql` | §5.5.1 | **Extrait** des migrations TypeORM (création PG parcours + signalements) |
| `02-modification-index-signalements-auteur.sql` | §5.5.3 | Script de **modification** applicable (`CREATE INDEX`) |
| Ce README | §5.5.2 / §5.5.4 | Argumentations |

Sources code : `apps/api/src/shared/infrastructure/postgres/migrations/`.

Mongo (messagerie, `moderation_actions`) : **hors scripts SQL** — voir `docs/messaging-mongo.md`, `docs/moderation-actions-mongo.md`.

## §5.5.2 — Argumentation script de création

- Le schéma relationnel couvre le **parcours livré** : identité → demandes → candidatures → missions / participations → signalements.
- Les **contraintes FK / CHECK / UNIQUE** matérialisent les règles métier (montant ≥ 0, auteur ≠ signalé, une candidature par couple demande/aidant, etc.).
- Index initiaux sur `demandes`, `missions`, `signalements` (mission ; statut+priorité+date) ciblent listes marketplace et **file admin**.
- La messagerie n’est **pas** créée en SQL (Option C / T07) : pas de double vérité PG+Mongo.

L’extrait n’est **pas** un dump exécutable unique : l’ordre réel + seeds = enchaînement des migrations TypeORM.

## §5.5.4 — Argumentation script de modification

**Contexte :** après livraison de `signalements` (T10), la liste admin trie surtout par `date_creation`. Un index `(id_auteur, date_creation DESC)` prépare :

1. Historique des signalements **par utilisateur** (auteur) sans scan complet.
2. Évolutions admin (filtre « signalements de X ») sans rewrite de table.

**Choix :** `CREATE INDEX IF NOT EXISTS` — non destructif, applicable à chaud en démo (hors `CONCURRENTLY` pour rester simple en local). Index existants (`idx_signalements_mission`, `idx_signalements_statut_priorite_date`) **conservés**.

**Preuve d’applicabilité :** même SQL dans la migration TypeORM `1721000014000-add-signalements-auteur-index.ts`.
