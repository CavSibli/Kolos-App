import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDemandes1721000007000 implements MigrationInterface {
  name = 'CreateDemandes1721000007000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
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
        CONSTRAINT "chk_demandes_budget_non_negatif" CHECK ("budget_estime" IS NULL OR "budget_estime" >= 0),
        CONSTRAINT "chk_demandes_latitude" CHECK ("latitude" IS NULL OR "latitude" BETWEEN -90 AND 90),
        CONSTRAINT "chk_demandes_longitude" CHECK ("longitude" IS NULL OR "longitude" BETWEEN -180 AND 180),
        CONSTRAINT "fk_demandes_demandeur" FOREIGN KEY ("id_demandeur")
          REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_demandes_statut" FOREIGN KEY ("id_statut_demande")
          REFERENCES "statuts_demande"("id") ON DELETE RESTRICT
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_demandes_demandeur" ON "demandes" ("id_demandeur")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_demandes_statut_date"
        ON "demandes" ("id_statut_demande", "date_mission")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "demandes"`);
  }
}
