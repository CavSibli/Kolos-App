-- =============================================================================
-- Kolos — Script de modification PostgreSQL (T21 / §5.5.3)
-- =============================================================================
-- Applicable sur une base déjà migrée (après create-signalements).
-- Objectif : index secondaire sur l’auteur d’un signalement pour les requêtes
--       « signalements d’un utilisateur » / filtres admin futurs.
--
-- Migration TypeORM miroir (même SQL) :
--   apps/api/.../migrations/1721000014000-add-signalements-auteur-index.ts
-- =============================================================================

CREATE INDEX IF NOT EXISTS "idx_signalements_auteur_date"
  ON "signalements" ("id_auteur", "date_creation" DESC);

-- Rollback :
-- DROP INDEX IF EXISTS "idx_signalements_auteur_date";
