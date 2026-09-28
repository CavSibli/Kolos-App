-- =============================================================================
-- Kolos — Script de création PostgreSQL (EXTRAIT documentation T21 / §5.5.1)
-- =============================================================================
-- Source : apps/api/src/shared/infrastructure/postgres/migrations/*
-- Statut : EXTRAIT lisible pour le dossier / annexes — PAS un dump exécutable
--          unique. L’ordre réel + seeds complets = migrations TypeORM en série.
--
-- Inclus ici : tables du parcours livré + signalements (Option C côté PG).
-- Hors extrait (présents en migrations) : refresh_tokens, seeds détaillés
-- redondants, commentaires TypeORM.
-- Hors MPD PG volontaire : conversations / messages → MongoDB (T07/T11).
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- --- Identité ---------------------------------------------------------------
CREATE TABLE "roles" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE "users" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" VARCHAR(255) NOT NULL UNIQUE,
  "password_hash" VARCHAR(255) NOT NULL,
  "first_name" VARCHAR(100) NOT NULL,
  "last_name" VARCHAR(100) NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
  -- colonnes ban ajoutées ensuite : voir 02-modification-*.sql
);

CREATE TABLE "user_roles" (
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "role_id" INTEGER NOT NULL REFERENCES "roles"("id") ON DELETE CASCADE,
  PRIMARY KEY ("user_id", "role_id")
);

-- --- Référentiels marketplace (extrait) -------------------------------------
CREATE TABLE "statuts_demande" (
  "id" SERIAL PRIMARY KEY,
  "code" VARCHAR(40) NOT NULL UNIQUE,
  "libelle" VARCHAR(100) NOT NULL
);

CREATE TABLE "statuts_candidature" (
  "id" SERIAL PRIMARY KEY,
  "code" VARCHAR(40) NOT NULL UNIQUE,
  "libelle" VARCHAR(100) NOT NULL
);

CREATE TABLE "statuts_verification" (
  "id" SERIAL PRIMARY KEY,
  "code" VARCHAR(40) NOT NULL UNIQUE,
  "libelle" VARCHAR(100) NOT NULL
);

CREATE TABLE "statuts_mission" (
  "id" SERIAL PRIMARY KEY,
  "code" VARCHAR(40) NOT NULL UNIQUE,
  "libelle" VARCHAR(100) NOT NULL
);

CREATE TABLE "statuts_participation" (
  "id" SERIAL PRIMARY KEY,
  "code" VARCHAR(40) NOT NULL UNIQUE,
  "libelle" VARCHAR(100) NOT NULL
);

-- --- Marketplace ------------------------------------------------------------
CREATE TABLE "profils_aidant" (
  "id" SERIAL PRIMARY KEY,
  "user_id" UUID NOT NULL UNIQUE,
  "id_statut_verification" INTEGER NOT NULL,
  "bio" TEXT,
  "rayon_intervention" INTEGER NOT NULL,
  "date_identite_verifiee" TIMESTAMPTZ,
  "date_creation" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "date_maj" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "chk_profils_aidant_rayon_positif" CHECK ("rayon_intervention" > 0),
  CONSTRAINT "fk_profils_aidant_user" FOREIGN KEY ("user_id")
    REFERENCES "users"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_profils_aidant_verification" FOREIGN KEY ("id_statut_verification")
    REFERENCES "statuts_verification"("id") ON DELETE RESTRICT
);

CREATE TABLE "demandes" (
  "id" SERIAL PRIMARY KEY,
  "id_demandeur" UUID NOT NULL,
  "id_statut_demande" INTEGER NOT NULL,
  "titre" VARCHAR(150) NOT NULL,
  "description" TEXT NOT NULL,
  "contraintes_physiques" TEXT,
  "adresse" TEXT NOT NULL,
  "latitude" NUMERIC(9,6),
  "longitude" NUMERIC(9,6),
  "date_mission" TIMESTAMPTZ NOT NULL,
  "duree_estimee" INTEGER NOT NULL,
  "nb_aidants_requis" INTEGER NOT NULL,
  "budget_estime" NUMERIC(10,2),
  "date_creation" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "date_maj" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "date_annulation" TIMESTAMPTZ,
  "motif_annulation" TEXT,
  CONSTRAINT "chk_demandes_duree_positive" CHECK ("duree_estimee" > 0),
  CONSTRAINT "chk_demandes_nb_aidants_positif" CHECK ("nb_aidants_requis" > 0),
  CONSTRAINT "fk_demandes_demandeur" FOREIGN KEY ("id_demandeur")
    REFERENCES "users"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_demandes_statut" FOREIGN KEY ("id_statut_demande")
    REFERENCES "statuts_demande"("id") ON DELETE RESTRICT
);

CREATE INDEX "idx_demandes_demandeur" ON "demandes" ("id_demandeur");
CREATE INDEX "idx_demandes_statut_date"
  ON "demandes" ("id_statut_demande", "date_mission");

CREATE TABLE "candidatures" (
  "id" SERIAL PRIMARY KEY,
  "id_demande" INTEGER NOT NULL,
  "id_aidant" UUID NOT NULL,
  "id_statut_candidature" INTEGER NOT NULL,
  "message" TEXT,
  "prix_propose" NUMERIC(10,2),
  "date_creation" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "date_maj" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "date_retrait" TIMESTAMPTZ,
  CONSTRAINT "fk_candidatures_demande" FOREIGN KEY ("id_demande")
    REFERENCES "demandes"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_candidatures_aidant" FOREIGN KEY ("id_aidant")
    REFERENCES "users"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_candidatures_statut" FOREIGN KEY ("id_statut_candidature")
    REFERENCES "statuts_candidature"("id") ON DELETE RESTRICT,
  CONSTRAINT "uq_candidatures_demande_aidant" UNIQUE ("id_demande", "id_aidant")
);

CREATE TABLE "missions" (
  "id" SERIAL PRIMARY KEY,
  "id_demande" INTEGER NOT NULL UNIQUE,
  "id_statut_mission" INTEGER NOT NULL,
  "date_debut" TIMESTAMPTZ,
  "date_fin" TIMESTAMPTZ,
  "montant_total" NUMERIC(10,2) NOT NULL,
  "raison_annulation" TEXT,
  "date_confirmation_demandeur" TIMESTAMPTZ,
  "date_creation" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "date_maj" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "chk_missions_montant_non_negatif" CHECK ("montant_total" >= 0),
  CONSTRAINT "fk_missions_demande" FOREIGN KEY ("id_demande")
    REFERENCES "demandes"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_missions_statut" FOREIGN KEY ("id_statut_mission")
    REFERENCES "statuts_mission"("id") ON DELETE RESTRICT
);

CREATE INDEX "idx_missions_statut" ON "missions" ("id_statut_mission");

CREATE TABLE "participations_mission" (
  "id" SERIAL PRIMARY KEY,
  "id_mission" INTEGER NOT NULL,
  "id_aidant" UUID NOT NULL,
  "id_candidature" INTEGER NOT NULL UNIQUE,
  "id_statut_participation" INTEGER NOT NULL,
  "montant_convenu" NUMERIC(10,2) NOT NULL,
  "date_acceptation" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "date_debut" TIMESTAMPTZ,
  "date_fin" TIMESTAMPTZ,
  "date_completion" TIMESTAMPTZ,
  "date_creation" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "date_maj" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "fk_participations_mission" FOREIGN KEY ("id_mission")
    REFERENCES "missions"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_participations_aidant" FOREIGN KEY ("id_aidant")
    REFERENCES "users"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_participations_candidature" FOREIGN KEY ("id_candidature")
    REFERENCES "candidatures"("id") ON DELETE RESTRICT,
  CONSTRAINT "fk_participations_statut" FOREIGN KEY ("id_statut_participation")
    REFERENCES "statuts_participation"("id") ON DELETE RESTRICT,
  CONSTRAINT "uq_participations_mission_aidant" UNIQUE ("id_mission", "id_aidant")
);

-- --- Signalements (T10) -----------------------------------------------------
CREATE TABLE "types_signalement" (
  "id" SERIAL PRIMARY KEY,
  "code" VARCHAR(40) NOT NULL UNIQUE,
  "libelle" VARCHAR(100) NOT NULL
);

CREATE TABLE "statuts_signalement" (
  "id" SERIAL PRIMARY KEY,
  "code" VARCHAR(40) NOT NULL UNIQUE,
  "libelle" VARCHAR(100) NOT NULL
);

CREATE TABLE "priorites_signalement" (
  "id" SERIAL PRIMARY KEY,
  "code" VARCHAR(40) NOT NULL UNIQUE,
  "libelle" VARCHAR(100) NOT NULL,
  "ordre" INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE "signalements" (
  "id" SERIAL PRIMARY KEY,
  "id_mission" INTEGER NOT NULL,
  "id_auteur" UUID NOT NULL,
  "id_utilisateur_signale" UUID,
  "id_admin_traitant" UUID,
  "id_type_signalement" INTEGER NOT NULL,
  "id_statut_signalement" INTEGER NOT NULL,
  "id_priorite_signalement" INTEGER NOT NULL,
  "description" TEXT NOT NULL,
  "resolution" TEXT,
  "date_creation" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "date_maj" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "date_resolution" TIMESTAMPTZ,
  CONSTRAINT "fk_signalements_mission" FOREIGN KEY ("id_mission")
    REFERENCES "missions"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_signalements_auteur" FOREIGN KEY ("id_auteur")
    REFERENCES "users"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_signalements_signale" FOREIGN KEY ("id_utilisateur_signale")
    REFERENCES "users"("id") ON DELETE SET NULL,
  CONSTRAINT "fk_signalements_admin" FOREIGN KEY ("id_admin_traitant")
    REFERENCES "users"("id") ON DELETE SET NULL,
  CONSTRAINT "fk_signalements_type" FOREIGN KEY ("id_type_signalement")
    REFERENCES "types_signalement"("id") ON DELETE RESTRICT,
  CONSTRAINT "fk_signalements_statut" FOREIGN KEY ("id_statut_signalement")
    REFERENCES "statuts_signalement"("id") ON DELETE RESTRICT,
  CONSTRAINT "fk_signalements_priorite" FOREIGN KEY ("id_priorite_signalement")
    REFERENCES "priorites_signalement"("id") ON DELETE RESTRICT,
  CONSTRAINT "chk_signalements_auteur_signale_distincts"
    CHECK (
      "id_utilisateur_signale" IS NULL
      OR "id_utilisateur_signale" <> "id_auteur"
    )
);

CREATE INDEX "idx_signalements_mission"
  ON "signalements" ("id_mission");

CREATE INDEX "idx_signalements_statut_priorite_date"
  ON "signalements" (
    "id_statut_signalement",
    "id_priorite_signalement",
    "date_creation"
  );

-- Fin extrait création. Seeds INSERT : voir migrations TypeORM.
