import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSignalements1721000012000 implements MigrationInterface {
  name = 'CreateSignalements1721000012000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "types_signalement" (
        "id" SERIAL PRIMARY KEY,
        "code" VARCHAR(40) NOT NULL UNIQUE,
        "libelle" VARCHAR(100) NOT NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "statuts_signalement" (
        "id" SERIAL PRIMARY KEY,
        "code" VARCHAR(40) NOT NULL UNIQUE,
        "libelle" VARCHAR(100) NOT NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "priorites_signalement" (
        "id" SERIAL PRIMARY KEY,
        "code" VARCHAR(40) NOT NULL UNIQUE,
        "libelle" VARCHAR(100) NOT NULL,
        "ordre" INTEGER NOT NULL DEFAULT 0
      )
    `);

    await queryRunner.query(`
      INSERT INTO "types_signalement" ("code", "libelle") VALUES
        ('NO_SHOW', 'Absence'),
        ('DELAY', 'Retard'),
        ('NOT_PERFORMED', 'Prestation non réalisée'),
        ('BEHAVIOUR', 'Comportement'),
        ('PAYMENT', 'Paiement'),
        ('OTHER', 'Autre')
    `);

    await queryRunner.query(`
      INSERT INTO "statuts_signalement" ("code", "libelle") VALUES
        ('OPEN', 'Ouvert'),
        ('IN_REVIEW', 'En cours de traitement'),
        ('RESOLVED', 'Résolu'),
        ('REJECTED', 'Rejeté')
    `);

    await queryRunner.query(`
      INSERT INTO "priorites_signalement" ("code", "libelle", "ordre") VALUES
        ('LOW', 'Basse', 1),
        ('NORMAL', 'Normale', 2),
        ('HIGH', 'Haute', 3),
        ('CRITICAL', 'Critique', 4)
    `);

    await queryRunner.query(`
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
          ),
        CONSTRAINT "chk_signalements_date_resolution"
          CHECK (
            "date_resolution" IS NULL
            OR "date_resolution" >= "date_creation"
          )
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_signalements_mission"
        ON "signalements" ("id_mission")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_signalements_statut_priorite_date"
        ON "signalements" (
          "id_statut_signalement",
          "id_priorite_signalement",
          "date_creation"
        )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "signalements"`);
    await queryRunner.query(`DROP TABLE "priorites_signalement"`);
    await queryRunner.query(`DROP TABLE "statuts_signalement"`);
    await queryRunner.query(`DROP TABLE "types_signalement"`);
  }
}
