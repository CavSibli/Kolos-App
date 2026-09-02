import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateParticipationsMission1721000011000 implements MigrationInterface {
  name = 'CreateParticipationsMission1721000011000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
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
        CONSTRAINT "chk_participations_montant_non_negatif" CHECK ("montant_convenu" >= 0),
        CONSTRAINT "chk_participations_dates" CHECK ("date_fin" IS NULL OR "date_debut" IS NULL OR "date_fin" >= "date_debut"),
        CONSTRAINT "fk_participations_mission" FOREIGN KEY ("id_mission")
          REFERENCES "missions"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_participations_aidant" FOREIGN KEY ("id_aidant")
          REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_participations_candidature" FOREIGN KEY ("id_candidature")
          REFERENCES "candidatures"("id") ON DELETE RESTRICT,
        CONSTRAINT "fk_participations_statut" FOREIGN KEY ("id_statut_participation")
          REFERENCES "statuts_participation"("id") ON DELETE RESTRICT,
        CONSTRAINT "uq_participations_mission_aidant" UNIQUE ("id_mission", "id_aidant")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_participations_mission_statut"
        ON "participations_mission" ("id_mission", "id_statut_participation")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_participations_aidant_statut"
        ON "participations_mission" ("id_aidant", "id_statut_participation")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "participations_mission"`);
  }
}
