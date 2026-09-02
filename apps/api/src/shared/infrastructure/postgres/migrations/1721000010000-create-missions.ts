import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMissions1721000010000 implements MigrationInterface {
  name = 'CreateMissions1721000010000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
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
        CONSTRAINT "chk_missions_dates" CHECK ("date_fin" IS NULL OR "date_debut" IS NULL OR "date_fin" >= "date_debut"),
        CONSTRAINT "fk_missions_demande" FOREIGN KEY ("id_demande")
          REFERENCES "demandes"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_missions_statut" FOREIGN KEY ("id_statut_mission")
          REFERENCES "statuts_mission"("id") ON DELETE RESTRICT
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_missions_statut" ON "missions" ("id_statut_mission")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "missions"`);
  }
}
