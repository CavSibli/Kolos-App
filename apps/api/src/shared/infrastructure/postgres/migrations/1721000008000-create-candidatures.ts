import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCandidatures1721000008000 implements MigrationInterface {
  name = 'CreateCandidatures1721000008000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
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
        CONSTRAINT "chk_candidatures_prix_non_negatif" CHECK ("prix_propose" IS NULL OR "prix_propose" >= 0),
        CONSTRAINT "fk_candidatures_demande" FOREIGN KEY ("id_demande")
          REFERENCES "demandes"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_candidatures_aidant" FOREIGN KEY ("id_aidant")
          REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_candidatures_statut" FOREIGN KEY ("id_statut_candidature")
          REFERENCES "statuts_candidature"("id") ON DELETE RESTRICT,
        CONSTRAINT "uq_candidatures_demande_aidant" UNIQUE ("id_demande", "id_aidant")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_candidatures_demande_statut"
        ON "candidatures" ("id_demande", "id_statut_candidature")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_candidatures_aidant_statut"
        ON "candidatures" ("id_aidant", "id_statut_candidature")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "candidatures"`);
  }
}
